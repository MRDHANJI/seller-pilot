import { findAsinRank } from './src/lib/amazon-scraper.ts';

async function test() {
    console.log("=== Test 1: Whey Protein / B0CQVCHFNK ===");
    const r1 = await findAsinRank('B0CQVCHFNK', 'Whey Protein');
    console.log("Result:", JSON.stringify(r1, null, 2));
    
    console.log("\n=== Test 2: Fitspire Protein / B0CQVCHFNK ===");
    const r2 = await findAsinRank('B0CQVCHFNK', 'Fitspire protein');
    console.log("Result:", JSON.stringify(r2, null, 2));
}

test().catch(console.error);
