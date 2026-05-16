async function test() {
    console.log("Testing Python API for Whey Protein...");
    try {
        const response = await fetch("http://localhost:8000/api/track-keyword", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ asin: "B0CQVCHFNK", keyword: "Whey Protein" })
        });
        const data = await response.json();
        console.log("Python API Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}
test();
