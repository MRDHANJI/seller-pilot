import streamlit as st
import sys
import os

# Fix for Streamlit Cloud Import Error
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Page Configuration
st.set_page_config(
    page_title="SellerPilot Pro",
    page_icon="🚀",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- PRO THEME CSS ---
st.markdown("""
<style>
    /* Global Font */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
    }
    
    /* Headers */
    h1, h2, h3 {
        color: #232F3E; /* Amazon Dark Blue */
        font-weight: 700;
    }
    
    /* Buttons */
    .stButton>button {
        background-color: #FF9900; /* Amazon Orange */
        color: white;
        border-radius: 8px;
        border: none;
        padding: 10px 24px;
        font-weight: 600;
        transition: all 0.3s ease;
    }
    .stButton>button:hover {
        background-color: #e68a00;
        transform: scale(1.02);
    }
    
    /* Cards (Using st.info/warning as container bases) */
    .stAlert {
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    /* Sidebar */
    .css-1d391kg {
        background-color: #f7f9fc;
    }
    
    /* Analysis Tables */
    thead tr th:first-child {display:none}
    tbody th {display:none}
</style>
""", unsafe_allow_html=True)

# Sidebar Navigation
st.sidebar.markdown("## 🚀 SellerPilot **Pro**")
st.sidebar.markdown("---")

option = st.sidebar.radio(
    "Navigation",
    (
        "🏠 Dashboard",
        "📝 Listing Generator",
        "🔍 Keyword Research",
        "📊 Competitor Spy",
        "📦 Bulk Extractor",
        "📈 Ads Manager"
    )
)

st.sidebar.markdown("---")
st.sidebar.info("💡 **Pro Tip**: Use 'Ads Manager' to cut wasted spend instantly.")
st.sidebar.caption("v4.0.0 | Built for Sellers")

# Main Content Routing
if option == "🏠 Dashboard":
    st.title("SellerPilot Command Center 🚀")
    st.markdown("### Welcome back, Seller!")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.info("📝 **Listing Generator**\n\nAuto-generate A9 optimized titles & bullets using AI logic.")
    with col2:
        st.info("🔍 **Keyword Research**\n\nFind hidden long-tail keywords from Amazon & Google.")
    with col3:
        st.info("📈 **Ads Manager**\n\nAnalyze bulk sheets & optimize bids to lower ACOS.")
        
    st.markdown("---")
    st.markdown("#### ⚡ Quick Actions")
    c1, c2 = st.columns(2)
    with c1:
        st.write("**New Product Launch?** Start with Keyword Research -> Listing Generator.")
    with c2:
        st.write("**High ACOS?** Go straight to Ads Manager and upload your report.")

elif option == "📝 Listing Generator":
    import listing_builder
    listing_builder.app()

elif option == "🔍 Keyword Research":
    import keyword_research
    keyword_research.app()

elif option == "📊 Competitor Spy":
    import scraper
    scraper.app_competitor_analysis()

elif option == "📦 Bulk Extractor":
    import scraper
    scraper.app_bulk_scraper()

elif option == "📈 Ads Manager":
    import ads_optimizer
    ads_optimizer.app()
