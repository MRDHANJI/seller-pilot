import streamlit as st
import requests
from bs4 import BeautifulSoup
import time
import random
from fake_useragent import UserAgent

def get_random_header():
    ua = UserAgent()
    referers = [
        "https://www.google.com/",
        "https://www.bing.com/",
        "https://search.yahoo.com/", 
        "https://duckduckgo.com/"
    ]
    return {
        'User-Agent': ua.random,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': random.choice(referers),
        'DNT': '1',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'cross-site',
    }

def fetch_page_stateless(url, retries=3):
    """
    Fetches a page with a fresh session each time.
    """
    for attempt in range(retries):
        try:
            # Fresh Session = No Cookies from previous request
            session = requests.Session()
            headers = get_random_header()
            
            # Request
            response = session.get(url, headers=headers, timeout=15)
            
            if response.status_code == 200:
                # Basic check for captcha page
                if "api-services-support@amazon.com" in response.text:
                    return None, 503 # Soft block
                return response.content, 200
            elif response.status_code == 503:
                time.sleep(5 + (attempt * 5)) # 5s, 10s, 15s wait
                continue
            else:
                return None, response.status_code
                
        except Exception as e:
            time.sleep(2)
            continue
            
    return None, 503

def track_keyword_deep(target_asin, keyword, domain="amazon.in", max_pages=3):
    base_url = f"https://www.{domain}/s?k={keyword}"
    log = []
    
    for page in range(1, max_pages + 1):
        # Construct URL
        page_url = f"{base_url}&page={page}"
        
        # Delay (Critical)
        if page > 1:
            wait = random.uniform(4, 8)
            time.sleep(wait)
        
        # Fetch
        content, status = fetch_page_stateless(page_url)
        
        if status == 200 and content:
            soup = BeautifulSoup(content, 'lxml')
            results = soup.select('div[data-component-type="s-search-result"]')
            
            if not results:
                 log.append(f"Page {page}: Loaded but no results (Captcha?).")
                 continue
                 
            # Scan Results
            for i, res in enumerate(results):
                asin = res.get('data-asin')
                if asin == target_asin:
                    # Check Sponsored
                    is_sponsored = False
                    sp_text = res.select_one('.s-label-popover-default') or res.select_one('.puis-sponsored-label-text')
                    if sp_text and "Sponsored" in sp_text.get_text():
                        is_sponsored = True
                        
                    return {
                        "Status": "Found",
                        "Page": page,
                        "Position": i + 1,
                        "Type": "Sponsored" if is_sponsored else "Organic",
                        "Log": log
                    }
            log.append(f"Page {page}: Scanned {len(results)} items. Not found.")
            
        elif status == 503:
            log.append(f"Page {page}: Amazon Busy (503) after retries. Skipping.")
        else:
            log.append(f"Page {page}: Failed (Status {status})")

    return {
        "Status": "Not Found",
        "Log": log
    }

def get_suggestions(seed):
    try:
        url = f"https://completion.amazon.co.uk/search/complete?search-alias=aps&client=amazon-search-ui&mkt=1&q={seed}"
        return requests.get(url, timeout=3).json()[1]
    except: return []

def app():
    st.header("🔍 Rank Tracker (Stateless)")
    
    t1, t2 = st.tabs(["Deep Scan", "Keywords"])
    
    with t1:
        st.info("Uses 'Fresh Session' strategy to avoid 503s.")
        c1, c2 = st.columns(2)
        with c1: asin = st.text_input("ASIN")
        with c2: kw = st.text_input("Keyword")
        
        max_p = st.slider("Pages to Scan", 1, 10, 3)
        domain = st.selectbox("Marketplace", ["amazon.in", "amazon.com"])
        
        if st.button("Start Scan"):
            if asin and kw:
                status = st.empty()
                status.write("Starting stateless scan...")
                
                res = track_keyword_deep(asin, kw, domain, max_p)
                
                if res['Status'] == "Found":
                    st.success(f"Found on Page {res['Page']} ({res['Type']})")
                else:
                    st.error("Not found.")
                    
                with st.expander("Log"):
                    st.json(res['Log'])
