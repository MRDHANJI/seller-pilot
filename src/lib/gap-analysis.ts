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

    // 1. Image Count Comparison
    const userImages = userProduct.images || 0;
    const compImageAvg = competitors.reduce((acc, c) => acc + (c.images || 0), 0) / competitors.length;
    metrics.push({
        label: "Product Images",
        userValue: userImages,
        competitorAvg: Math.round(compImageAvg),
        status: userImages >= compImageAvg ? 'better' : 'worse',
        improvement: userImages < compImageAvg ? `Add ${Math.ceil(compImageAvg - userImages)} more high-quality images` : "Good visual depth"
    });

    // 2. Rating Comparison
    const userRating = parseFloat(userProduct.rating?.split(' ')[0] || "0");
    const compRatingAvg = competitors.reduce((acc, c) => acc + parseFloat(c.rating?.split(' ')[0] || "0"), 0) / competitors.length;
    metrics.push({
        label: "Customer Rating",
        userValue: `${userRating}★`,
        competitorAvg: `${compRatingAvg.toFixed(1)}★`,
        status: userRating >= compRatingAvg ? 'better' : 'worse',
        improvement: userRating < compRatingAvg ? "Analyze negative reviews for quality issues" : "Leading in customer satisfaction"
    });

    // 3. Keyword Gap Analysis
    const stopWords = new Set(['and', 'the', 'with', 'for', 'from', 'this', 'that', 'into', 'under', 'premium', 'best', 'quality']);
    const getKeywords = (text: string) => text.toLowerCase().split(/\W+/).filter(w => w.length > 3 && !stopWords.has(w));

    const userKws = new Set(getKeywords(userProduct.title + " " + userProduct.bullets.join(" ")));
    const compKwMap = new Map<string, number>();

    competitors.forEach(c => {
        const kws = new Set(getKeywords(c.title + " " + c.bullets.join(" ")));
        kws.forEach(kw => {
            if (!userKws.has(kw)) {
                compKwMap.set(kw, (compKwMap.get(kw) || 0) + 1);
            }
        });
    });

    const keywordGaps = Array.from(compKwMap.entries())
        .map(([keyword, freq]) => {
            let importance: 'high' | 'medium' | 'low' = 'low';
            if (freq === competitors.length) importance = 'high';
            else if (freq >= 2) importance = 'medium';

            return {
                keyword,
                competitorFrequency: freq,
                importance
            };
        })
        .filter(g => g.importance !== 'low')
        .sort((a, b) => b.competitorFrequency - a.competitorFrequency)
        .slice(0, 8);

    // 4. A9 SEO Check
    const a9Check: GapAnalysisResult['a9Check'] = [
        {
            label: "Title Context",
            score: userProduct.title.length > 150 ? 100 : 60,
            tip: "Ideal title length is 150-200 characters for A9.",
            passed: userProduct.title.length > 100
        },
        {
            label: "Feature Depth",
            score: userProduct.bullets.length >= 5 ? 100 : 20 * userProduct.bullets.length,
            tip: "Always use exactly 5 high-impact bullet points.",
            passed: userProduct.bullets.length >= 5
        },
        {
            label: "Keyword Density",
            score: userKws.size > 20 ? 100 : 50,
            tip: "Target at least 20 unique high-volume keywords in listing.",
            passed: userKws.size > 20
        }
    ];

    return { metrics, keywordGaps, a9Check };
}
