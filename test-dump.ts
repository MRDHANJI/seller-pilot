import * as cheerio from 'cheerio';
import { findAsinRank } from './src/lib/amazon-scraper.ts';

async function dumpAsins() {
    const url = 'https://www.amazon.in/s?k=boat+airdopes';
    console.log("Fetching", url);
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5'
        }
    });
    const html = await response.text();
    const $ = cheerio.load(html);
    
    console.log("Is Captcha?", html.includes('captcha') || html.includes('api/services/support/feedback'));
    console.log("Title:", $('title').text());

    const asins: string[] = [];
    $('[data-asin]').each((_, el) => {
        const asin = $(el).attr('data-asin');
        if (asin) asins.push(asin);
    });
    console.log("ASINs found on page 1:", asins);
}

dumpAsins().catch(console.error);
