import { NextResponse } from "next/server";
import { findAsinRank } from "@/lib/amazon-scraper";

export async function POST(req: Request) {
    try {
        const { asin, keyword } = await req.json();

        if (!asin || !keyword) {
            return NextResponse.json({ error: "ASIN and Keyword are required" }, { status: 400 });
        }

        // Call the local Python Selenium API (runs on port 8000)
        const pythonApiUrl = process.env.PYTHON_SCRAPER_API_URL || 'http://localhost:8000/api/track-keyword';
        
        const response = await fetch(pythonApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ asin, keyword })
        });
        
        if (!response.ok) {
            throw new Error(`Python API returned Status: ${response.status}. Make sure you ran start-python-backend.bat!`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.detail || "Error from Python Selenium scraper");
        }

        const result = data.data;

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
