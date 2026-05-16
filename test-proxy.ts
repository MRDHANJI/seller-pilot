import * as cheerio from 'cheerio';

async function testProxy() {
    console.log("Testing via codetabs...");
    const url = 'https://api.codetabs.com/v1/proxy/?quest=' + encodeURIComponent('https://www.amazon.in/s?k=Whey+Protein');
    try {
        const response = await fetch(url);
        console.log("Status:", response.status);
        const html = await response.text();
        const $ = cheerio.load(html);
        console.log("Items found:", $('[data-asin]').length);
        if ($('[data-asin]').length === 0) {
            console.log("Empty or blocked");
        }
    } catch (e) {
        console.error(e);
    }
}

testProxy();
