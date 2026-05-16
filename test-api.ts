async function testApi() {
    console.log("=== Testing via Next.js API ===");
    
    // Test 1
    console.log("\nTest 1: Whey Protein / B0CQVCHFNK");
    try {
        const r1 = await fetch("http://localhost:3000/api/keyword-tracker", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ asin: "B0CQVCHFNK", keyword: "Whey Protein" })
        });
        const text1 = await r1.text();
        console.log("Status:", r1.status);
        console.log("Response:", text1);
    } catch (e) {
        console.error("Error:", e);
    }
    
    // Test 2
    console.log("\nTest 2: Fitspire protein / B0CQVCHFNK");
    try {
        const r2 = await fetch("http://localhost:3000/api/keyword-tracker", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ asin: "B0CQVCHFNK", keyword: "Fitspire protein" })
        });
        const text2 = await r2.text();
        console.log("Status:", r2.status);
        console.log("Response:", text2);
    } catch (e) {
        console.error("Error:", e);
    }
}

testApi();
