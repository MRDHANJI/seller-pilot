import { NextResponse } from "next/server";
import { analyzeListingSEO } from "@/lib/seo-utils";

export async function POST(req: Request) {
    try {
        const { productName, brandName, specifications, keywords } = await req.json();

        // In a real scenario, we would call an LLM (e.g., Gemini) here.
        // For this implementation, we'll construct a high-quality listing based on the inputs.

        const kvList = keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
        const brand = brandName || "Generic";

        // Simulate AI Generation
        const title = `${brand} ${productName} - ${kvList[0] || 'Premium Quality'} Material with ${kvList[1] || 'Modern Design'} Features`;

        const bullets = [
            `【${kvList[0] || 'Premium Quality'}】 Crafted from high-grade materials ensuring long-lasting durability and reliability for daily use.`,
            `【${kvList[1] || 'Advanced Tech'}】 Features cutting-edge technology to provide superior performance compared to standard alternatives.`,
            `【Ergonomic Design】 Designed with user comfort in mind, focusing on ease of use and maximum efficiency.`,
            `【Versatile Utility】 Perfect for various applications, making it an essential addition to your collection.`,
            `【Worry-Free Warranty】 Comes with dedicated customer support and a satisfaction guarantee to ensure peace of mind.`
        ];

        const description = `Discover the excellence of the ${brand} ${productName}. This innovative product is designed to meet the highest standards of quality and performance. \n\n Key Features: \n ${specifications} \n\n Why Choose ${brand}? \n We focus on delivering value and innovation to our customers. Our ${productName} is the result of extensive research and development to ensure you get the best experience possible. Whether you are using it for professional or personal needs, it stands out as a top-tier choice in the market.`;

        const seoAnalysis = analyzeListingSEO(title, bullets, description, kvList);

        return NextResponse.json({
            title,
            bullets,
            description,
            seoScore: seoAnalysis.score,
            suggestions: seoAnalysis.suggestions
        });
    } catch {
        return NextResponse.json({ error: "Failed to generate listing" }, { status: 500 });
    }
}
