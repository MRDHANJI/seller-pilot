from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from selenium import webdriver
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import random
import time

app = FastAPI(title="SellerPilot Amazon Scraper API")

# Add CORS so Next.js can communicate with it if needed directly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TrackRequest(BaseModel):
    asin: str
    keyword: str

# Update with user's specific GeckoDriver path
gecko_driver_path = r"C:\Program Files\Mozilla Firefox\geckodriver.exe"

@app.post("/api/track-keyword")
def track_keyword(req: TrackRequest):
    asin = req.asin.strip().upper()
    keyword = req.keyword.strip()
    
    print(f"Tracking keyword: {keyword} and ASIN: {asin}")
    
    try:
        service = Service(gecko_driver_path)
        options = webdriver.FirefoxOptions()
        # Removed headless mode so user can see what's happening and solve captchas if needed
        driver = webdriver.Firefox(service=service, options=options)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start Firefox WebDriver. Ensure geckodriver is at {gecko_driver_path}. Error: {str(e)}")

    try:
        search_url = f"https://www.amazon.in/s?k={keyword}"
        driver.get(search_url)
        time.sleep(random.uniform(2, 4))

        for page in range(1, 11):
            print(f"Checking page {page} for ASIN {asin}")
            try:
                WebDriverWait(driver, 15).until(
                    EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 's-main-slot')]"))
                )
            except TimeoutException:
                print(f"ERROR: Timed out waiting for Amazon search results on page {page}. Did Amazon show a CAPTCHA?")
                break

            asin_elements = driver.find_elements(By.XPATH, f"//*[contains(@data-asin, '{asin}')]")
            if asin_elements:
                for element in asin_elements:
                    ad_badge = element.find_elements(By.XPATH, ".//span[contains(text(), 'Sponsored')]")
                    try:
                        price_element = element.find_element(By.XPATH, ".//span[@class='a-price-whole']")
                        price = price_element.text
                    except NoSuchElementException:
                        price = "N/A"

                    status = "Sponsored" if ad_badge else "Organic"
                    
                    driver.quit()
                    return {
                        "success": True,
                        "data": {
                            "organicRank": None if status == "Sponsored" else 1,
                            "sponsoredRank": 1 if status == "Sponsored" else None,
                            "page": page,
                            "price": price,
                            "status": status
                        }
                    }

            # Pagination
            try:
                next_button = driver.find_element(By.XPATH, "//a[contains(@class, 's-pagination-next')]")
                if "s-pagination-disabled" not in next_button.get_attribute("class"):
                    next_button.click()
                    time.sleep(random.uniform(2, 4))
                else:
                    break
            except NoSuchElementException:
                break

        driver.quit()
        return {
            "success": True,
            "data": {
                "organicRank": None,
                "sponsoredRank": None,
                "page": None,
                "price": None,
                "status": "Not Found"
            }
        }
    except Exception as e:
        driver.quit()
        raise HTTPException(status_code=500, detail=f"Scraping error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print("Starting API on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
