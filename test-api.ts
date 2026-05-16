async function testApi() {
    try {
        const response = await fetch("http://localhost:3000/api/keyword-tracker", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                asin: "B07S27F2W3",
                keyword: "boat airdopes"
            })
        });
        const data = await response.json();
        console.log(data);
    } catch (e) {
        console.error(e);
    }
}
testApi();
