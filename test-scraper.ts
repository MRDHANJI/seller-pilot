import { findAsinRank } from './src/lib/amazon-scraper.ts';

async function test() {
    console.log("Testing boat...");
    const r = await findAsinRank('B07S27F2W3', 'boat airdopes', 'amazon.in');
    console.log(r);
}

test().catch(console.error);
