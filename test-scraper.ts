import { findAsinRank } from './src/lib/amazon-scraper.ts';

async function test() {
    console.log("Testing scraper...");
    const result = await findAsinRank('B0CQVCHFNK', 'Whey Protein', 'amazon.in');
    console.log("Result:", result);
}

test().catch(console.error);
