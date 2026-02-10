import requests
from bs4 import BeautifulSoup
from fake_useragent import UserAgent
import time
import random
import re
import streamlit as st
import pandas as pd

def get_headers():
    ua = UserAgent()
    return {
        'User-Agent': ua.random,
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'DNT': '1'
    }

def get_text_safe(soup, selectors):
    for sel in selectors:
        element = soup.select_one(sel)
        if element:
            return element.get_text().strip()
    return "N/A"

def scrape_product_details(asin, domain="amazon.in"):
    """
    Scrapes comprehensive product details for A9 analysis.
    """
    url = f"https://www.{domain}/dp/{asin}"
    headers = get_headers()
    
    try:
        time.sleep(random.uniform(1.5, 3.5))
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            if response.status_code == 503:
                return {"Error": "Amazon blocked (503). Try scraping slower."}
            return {"Error": f"Status: {response.status_code}"}
            
        soup = BeautifulSoup(response.content, 'lxml')
        
        # 1. Title
        title = get_text_safe(soup, ['#productTitle', '#title'])
        
        # 2. Selling Price & MRP
        price = get_text_safe(soup, ['.a-price-whole', '#priceblock_ourprice', '.a-price .a-offscreen'])
        price = re.sub(r'[^\d,.]', '', price)
        
        mrp = get_text_safe(soup, ['.a-text-strike', '#listPrice', '.a-text-price span.a-offscreen'])
        mrp = re.sub(r'[^\d,.]', '', mrp)
        
        # 3. Sold By
        sold_by = get_text_safe(soup, ['#merchant-info', '#sellerProfileTriggerId'])
        sold_by = sold_by.replace("Sold by ", "").replace(" and Fulfilled by Amazon.", "").strip()

        # 4. Category (Breadcrumbs)
        category = get_text_safe(soup, ['#wayfinding-breadcrumbs_feature_div', '.a-breadcrumb'])
        category = category.replace('\n', ' > ').replace('  ', '')

        # 5. Rating & Reviews
        rating_elm = soup.select_one('#acrPopover') or soup.select_one('.a-icon-star')
        rating = rating_elm.get('title') if rating_elm else "N/A"
        
        reviews = get_text_safe(soup, ['#acrCustomerReviewText', '.a-size-small .a-link-normal'])
        
        # 6. Images
        images_len = len(soup.select('#altImages li.item')) 
        if images_len == 0: images_len = len(soup.select('.imageThumbnail'))

        # 7. Description & Bullets
        description = get_text_safe(soup, ['#productDescription', '.aplus-v2', '#feature-bullets'])
        bullets_text = get_text_safe(soup, ['#feature-bullets'])
        
        # 8. BSR
        bsr = "N/A"
        body_text = soup.get_text()
        bsr_match = re.search(r'#([0-9,]+) in', body_text)
        if bsr_match: bsr = bsr_match.group(1)

        return {
            "ASIN": asin,
            "Title": title,
            "Price": price,
            "MRP": mrp,
            "Sold By": sold_by,
            "Category": category[:50] + "..." if len(category)>50 else category,
            "Rating": rating,
            "Reviews": reviews,
            "Images": images_len,
            "BSR": bsr,
            "Description_Length": len(description),
            "Bullets_Length": len(bullets_text),
            "URL": url
        }

    except Exception as e:
        return {"Error": str(e)}

# UI Functions
def app_competitor_analysis():
    st.header("📊 Competitor Analysis & Comparison")
    
    col1, col2 = st.columns(2)
    with col1:
        my_asin = st.text_input("YOUR Product ASIN", help="Optional - for comparison")
    with col2:
        comp_asin = st.text_input("COMPETITOR ASIN", help="Required")
        
    domain = st.selectbox("Select Marketplace", ["amazon.in", "amazon.com"])
    
    if st.button("Compare Products"):
        if comp_asin:
            with st.spinner("Analyzing Competitor..."):
                comp_data = scrape_product_details(comp_asin, domain)
                
                my_data = None
                if my_asin:
                    with st.spinner("Analyzing Your Product..."):
                        my_data = scrape_product_details(my_asin, domain)
                
                if "Error" in comp_data:
                    st.error(f"Competitor Error: {comp_data['Error']}")
                else:
                    st.success("Analysis Complete!")
                    
                    # Side by Side Comparison
                    if my_data and "Error" not in my_data:
                        st.subheader("⚔️ Head-to-Head Comparison")
                        
                        comp_df = pd.DataFrame([
                            {"Metric": "Price", "You": my_data['Price'], "Competitor": comp_data['Price']},
                            {"Metric": "MRP", "You": my_data['MRP'], "Competitor": comp_data['MRP']},
                            {"Metric": "Rating", "You": my_data['Rating'], "Competitor": comp_data['Rating']},
                            {"Metric": "Reviews", "You": my_data['Reviews'], "Competitor": comp_data['Reviews']},
                            {"Metric": "Images", "You": my_data['Images'], "Competitor": comp_data['Images']},
                            {"Metric": "BSR", "You": my_data['BSR'], "Competitor": comp_data['BSR']},
                            {"Metric": "Sold By", "You": my_data['Sold By'], "Competitor": comp_data['Sold By']},
                        ])
                        st.table(comp_df)
                    
                    # Detailed View
                    st.subheader("Competitor Details")
                    st.json(comp_data)
        else:
            st.warning("Enter at least the Competitor ASIN.")

def app_bulk_scraper():
    st.header("📦 Bulk Product Extractor")
    asins_input = st.text_area("Enter ASINs (Comma separated)", height=150)
    
    if st.button("Start Bulk Scraping"):
        asins = [a.strip() for a in re.split(r'[,\n]+', asins_input) if a.strip()]
        if asins:
            results = []
            progress = st.progress(0)
            
            for i, asin in enumerate(asins):
                data = scrape_product_details(asin)
                if "Error" in data: data["Title"] = f"Error: {data['Error']}"
                results.append(data)
                progress.progress((i+1)/len(asins))
            
            st.success("Done!")
            df = pd.DataFrame(results)
            st.dataframe(df)
            
            csv = df.to_csv(index=False).encode('utf-8')
            st.download_button("Download CSV", csv, "bulk_data.csv", "text/csv")
