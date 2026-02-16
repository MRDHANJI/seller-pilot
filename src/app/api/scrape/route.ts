import { NextResponse } from "next/server";
import { scrapeAmazonProduct } from "@/lib/amazon-scraper";

export async function POST(req: Request) {
    try {
        const { asin } = await req.json();

        if (!asin) {
            return NextResponse.json({ error: "ASIN is required" }, { status: 400 });
        }

        const productData = await scrapeAmazonProduct(asin);

        if (productData.error) {
            return NextResponse.json({ error: productData.error }, { status: 500 });
        }

        return NextResponse.json(productData);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to scrape product" }, { status: 500 });
    }
}
