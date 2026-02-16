export interface SEOAnalysis {
    score: number;
    suggestions: string[];
}

export function analyzeListingSEO(
    title: string,
    bullets: string[],
    description: string,
    targetKeywords: string[]
): SEOAnalysis {
    let score = 0;
    const suggestions: string[] = [];

    // 1. Title Analysis
    if (title.length >= 150 && title.length <= 200) {
        score += 25;
    } else if (title.length > 0) {
        score += 15;
        suggestions.push(title.length < 150
            ? "Title is too short. Aim for 150-200 characters for maximum visibility."
            : "Title is too long. Some marketplaces truncate after 200 characters."
        );
    }

    // 2. Keyword Presence
    const combinedContent = (title + " " + bullets.join(" ") + " " + description).toLowerCase();
    const foundKeywords = targetKeywords.filter(kw => combinedContent.includes(kw.toLowerCase()));

    if (targetKeywords.length > 0) {
        const keywordScore = (foundKeywords.length / targetKeywords.length) * 25;
        score += keywordScore;
        if (foundKeywords.length < targetKeywords.length) {
            suggestions.push(`Missing important keywords: ${targetKeywords.filter(kw => !foundKeywords.includes(kw)).slice(0, 3).join(", ")}`);
        }
    } else {
        score += 25; // No targets specified, assume optimal if other factors met
    }

    // 3. Bullet Points Analysis
    if (bullets.length >= 5) {
        score += 25;
    } else {
        score += (bullets.length / 5) * 25;
        suggestions.push(`Include at least 5 bullet points to highlight product benefits.`);
    }

    // 4. Description Analysis
    if (description.length >= 500) {
        score += 25;
    } else {
        score += Math.min(25, (description.length / 500) * 25);
        if (description.length < 500) {
            suggestions.push("Product description is brief. Expand to 500+ characters to improve rank and conversion.");
        }
    }

    return {
        score: Math.round(score),
        suggestions: suggestions.length > 0 ? suggestions : ["Great job! Your listing follows best practices."]
    };
}
