import { AmazonProductData } from "./amazon-scraper";

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
    }[];
    a9Check: {
        label: string;
        score: number;
        tip: string;
        passed: boolean;
    }[];
}

export function performGapAnalysis(userProduct: AmazonProductData, competitors: AmazonProductData[]): GapAnalysisResult {
    const metrics: GapAnalysisResult['metrics'] = [];

    // 1. Pricing Delta (Addressing "Value" / Difference)
    const userPrice = parseFloat(userProduct.price.replace(/,/g, '')) || 0;
    const compPriceAvg = competitors.reduce((acc, c) => acc + (parseFloat(c.price.replace(/,/g, '')) || 0), 0) / competitors.length;
    const priceDiff = ((userPrice - compPriceAvg) / compPriceAvg) * 100;

    metrics.push({
        label: "Pricing Positioning",
        userValue: `₹${userPrice.toLocaleString()}`,
        competitorAvg: `₹${Math.round(compPriceAvg).toLocaleString()}`,
        status: userPrice <= compPriceAvg ? 'better' : 'worse',
        improvement: priceDiff > 10 ? `Your price is ${priceDiff.toFixed(0)}% higher than competitors. Consider a coupon.` : "Price is competitive."
    });

    // 2. Image and Rating
    const userImages = userProduct.images || 0;
    const compImageAvg = competitors.reduce((acc, c) => acc + (c.images || 0), 0) / competitors.length;
    metrics.push({
        label: "Visual Depth",
        userValue: `${userImages} Images`,
        competitorAvg: `${Math.round(compImageAvg)} Avg`,
        status: userImages >= compImageAvg ? 'better' : 'worse',
        improvement: userImages < compImageAvg ? `Add ${Math.ceil(compImageAvg - userImages)} more images` : "Good visual depth"
    });

    // 3. Advanced Keyword Gap (Phrases + Volume)
    const stopWords = new Set(['and', 'the', 'with', 'for', 'from', 'this', 'that', 'into', 'under', 'premium', 'best', 'quality', 'product', 'item']);

    const extractPhrases = (text: string) => {
        const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2);
        const results: string[] = [];

        // 1-word (Broad)
        words.filter(w => !stopWords.has(w)).forEach(w => results.push(w));

        // 2-word (Phrase)
        for (let i = 0; i < words.length - 1; i++) {
            if (!stopWords.has(words[i]) || !stopWords.has(words[i + 1])) {
                results.push(`${words[i]} ${words[i + 1]}`);
            }
        }

        // 3-word (Phrase)
        for (let i = 0; i < words.length - 2; i++) {
            if (!stopWords.has(words[i]) || !stopWords.has(words[i + 2])) {
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
            const baseVol = freq * 850;
            const lengthBonus = keyword.split(' ').length * 300;
            const volume = Math.round(baseVol + lengthBonus + (Math.random() * 200));

            let importance: 'high' | 'medium' | 'low' = 'low';
            if (freq === competitors.length && isPhrase) importance = 'high';
            else if (freq >= competitors.length || isPhrase) importance = 'medium';

            return {
                keyword,
                competitorFrequency: freq,
                volume,
                type: (isPhrase ? 'Phrase' : 'Broad') as 'Broad' | 'Phrase',
                importance
            };
        })
        .filter(g => g.importance !== 'low' || g.competitorFrequency === competitors.length)
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 12);

    // 4. A9 SEO Health
    const a9Check: GapAnalysisResult['a9Check'] = [
        {
            label: "Title Context",
            score: userProduct.title.length > 140 ? 100 : Math.round((userProduct.title.length / 150) * 100),
            tip: "Ideal title length is 150-200 characters for A9.",
            passed: userProduct.title.length > 120
        },
        {
            label: "Bullet Points",
            score: Math.min(100, userProduct.bullets.length * 20),
            tip: "Use exactly 5 bullet points with 150+ characters each.",
            passed: userProduct.bullets.length >= 5
        },
        {
            label: "Brand Identity",
            score: userProduct.title.toLowerCase().startsWith(userProduct.soldBy.split(' ')[0].toLowerCase()) ? 100 : 0,
            tip: "Start your title with the Brand Name for better indexing.",
            passed: userProduct.title.toLowerCase().startsWith(userProduct.soldBy.split(' ')[0].toLowerCase())
        }
    ];

    return { metrics, keywordGaps, a9Check };
}
