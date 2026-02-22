import { AmazonProductData } from "./amazon-scraper";

export interface ContentAudit {
    asin: string;
    isUser: boolean;
    score: number;
    titleLength: number;
    bulletCount: number;
    hasBrandInTitle: boolean;
    bulletsQuality: 'High' | 'Medium' | 'Low';
}

export interface GapAnalysisResult {
    metrics: {
        label: string;
        userValue: string | number;
        competitorAvg: string | number;
        status: 'better' | 'worse' | 'neutral';
        improvement: string;
    }[];
    keywordGaps: {
        keyword: string;
        competitorFrequency: number;
        volume: number;
        type: 'Broad' | 'Phrase';
        importance: 'high' | 'medium' | 'low';
        isMandatory: boolean;
    }[];
    audits: ContentAudit[];
}

function calculateA9Score(product: AmazonProductData): number {
    let score = 0;
    // Title length (Ideal: 150-200)
    if (product.title.length > 140) score += 35;
    else score += (product.title.length / 150) * 35;

    // Bullet points (Ideal: 5)
    score += Math.min(30, product.bullets.length * 6);

    // Image depth (Ideal: 7+)
    score += Math.min(20, (product.images || 0) * 3);

    // Brand in Title
    const brandName = product.soldBy.split(' ')[0].toLowerCase();
    if (product.title.toLowerCase().startsWith(brandName)) score += 15;

    return Math.round(score);
}

export function performGapAnalysis(userProduct: AmazonProductData, competitors: AmazonProductData[]): GapAnalysisResult {
    const metrics: GapAnalysisResult['metrics'] = [];

    // 1. Pricing Delta
    const userPrice = parseFloat(userProduct.price.replace(/,/g, '')) || 0;
    const compPriceAvg = competitors.reduce((acc, c) => acc + (parseFloat(c.price.replace(/,/g, '')) || 0), 0) / competitors.length;
    const priceDiff = ((userPrice - compPriceAvg) / compPriceAvg) * 100;

    metrics.push({
        label: "Market Price Difference",
        userValue: `₹${userPrice.toLocaleString()}`,
        competitorAvg: `₹${Math.round(compPriceAvg).toLocaleString()}`,
        status: userPrice <= compPriceAvg ? 'better' : 'worse',
        improvement: priceDiff > 10 ? `Price is ${priceDiff.toFixed(0)}% above market avg.` : "Pricing is professional/competitive."
    });

    // 2. Performance Metrics
    const userImages = userProduct.images || 0;
    const compImageAvg = competitors.reduce((acc, c) => acc + (c.images || 0), 0) / competitors.length;
    metrics.push({
        label: "Listing Visual Depth",
        userValue: `${userImages} Images`,
        competitorAvg: `${Math.round(compImageAvg)} Avg`,
        status: userImages >= compImageAvg ? 'better' : 'worse',
        improvement: userImages < compImageAvg ? `Add ${Math.ceil(compImageAvg - userImages)} more images.` : "Visual depth meets industry standards."
    });

    // 3. Complete PDP Audits
    const audits: ContentAudit[] = [userProduct, ...competitors].map(p => ({
        asin: p.asin,
        isUser: p.asin === userProduct.asin,
        score: calculateA9Score(p),
        titleLength: p.title.length,
        bulletCount: p.bullets.length,
        hasBrandInTitle: p.title.toLowerCase().startsWith(p.soldBy.split(' ')[0].toLowerCase()),
        bulletsQuality: p.bullets.length >= 5 ? 'High' : (p.bullets.length >= 3 ? 'Medium' : 'Low')
    }));

    // 4. Advanced Keyword Intelligence
    const stopWords = new Set(['and', 'the', 'with', 'for', 'from', 'this', 'that', 'into', 'under', 'premium', 'best', 'quality', 'product', 'item']);

    const extractPhrases = (text: string) => {
        const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2);
        const results: string[] = [];
        words.filter(w => !stopWords.has(w)).forEach(w => results.push(w));
        for (let i = 0; i < words.length - 1; i++) {
            if (!stopWords.has(words[i]) || !stopWords.has(words[i + 1])) {
                results.push(`${words[i]} ${words[i + 1]}`);
            }
        }
        for (let i = 0; i < words.length - 2; i++) {
            if (!stopWords.has(words[i]) || !stopWords.has(words[i + 1]) || !stopWords.has(words[i + 2])) {
                results.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
            }
        }
        return Array.from(new Set(results));
    };

    const userPhrases = new Set(extractPhrases(userProduct.title + " " + userProduct.bullets.join(" ")));
    const compPhraseMap = new Map<string, number>();

    competitors.forEach(c => {
        const phrases = extractPhrases(c.title + " " + c.bullets.join(" "));
        phrases.forEach(p => {
            if (!userPhrases.has(p)) {
                compPhraseMap.set(p, (compPhraseMap.get(p) || 0) + 1);
            }
        });
    });

    const keywordGaps = Array.from(compPhraseMap.entries())
        .map(([keyword, freq]) => {
            const isPhrase = keyword.split(' ').length > 1;
            const isMandatory = freq === competitors.length;

            const baseVol = freq * 900;
            const lengthBonus = keyword.split(' ').length * 350;
            const volume = Math.round(baseVol + lengthBonus + (Math.random() * 200));

            let importance: 'high' | 'medium' | 'low' = 'low';
            if (isMandatory) importance = 'high';
            else if (freq >= 2 || isPhrase) importance = 'medium';

            return {
                keyword,
                competitorFrequency: freq,
                volume,
                type: (isPhrase ? 'Phrase' : 'Broad') as 'Broad' | 'Phrase',
                importance,
                isMandatory
            };
        })
        .filter(g => g.importance !== 'low' || g.isMandatory)
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 15);

    return { metrics, keywordGaps, audits };
}
