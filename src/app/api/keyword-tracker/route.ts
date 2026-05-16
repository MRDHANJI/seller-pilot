import { NextResponse } from "next/server";
import { findAsinRank } from "@/lib/amazon-scraper";

export const maxDuration = 60; // Allow Vercel to run up to 60 seconds for scraping

export async function POST(req: Request) {
    try {
        const { asin, keyword } = await req.json();

        if (!asin || !keyword) {
            return NextResponse.json({ error: "ASIN and Keyword are required" }, { status: 400 });
        }

        // Call the internal Next.js/cheerio scraper directly
        const result = await findAsinRank(asin, keyword);

        if (result.error) {
            throw new Error(result.error);
        }

        return NextResponse.json({
            asin,
            keyword,
            organicRank: result.organicRank,
            sponsoredRank: result.sponsoredRank,
            page: result.page,
            price: result.price,
            status: result.status,
            success: true
        });
    } catch (error: any) {
        console.error("API Route Error:", error);
        return NextResponse.json({ error: error.message || "Failed to track keyword. Amazon might have blocked the request." }, { status: 500 });
    }
}
