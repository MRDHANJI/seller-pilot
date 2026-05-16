import { NextResponse } from "next/server";
import { findAsinRank } from "@/lib/amazon-scraper";

export async function POST(req: Request) {
    try {
        const { asin, keyword } = await req.json();

        if (!asin || !keyword) {
            return NextResponse.json({ error: "ASIN and Keyword are required" }, { status: 400 });
        }

        // Use the built-in cheerio scraper directly (no Python dependency needed)
        const result = await findAsinRank(asin, keyword);

        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 500 });
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
        return NextResponse.json({ error: error.message || "Failed to track keyword." }, { status: 500 });
    }
}
