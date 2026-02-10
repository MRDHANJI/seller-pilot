import streamlit as st
import pandas as pd
import re

def clean_currency(x):
    if isinstance(x, (int, float)): return float(x)
    if isinstance(x, str):
        clean = re.sub(r'[^\d.]', '', x)
        try: return float(clean)
        except: return 0.0
    return 0.0

def find_header_row(df):
    """
    Scans looking for a row that looks like a header.
    Returns the dataframe re-indexed with that header.
    """
    best_idx = -1
    
    # Heuristic: Row should contain "Campaign" and ("Spend" or "Impressions" or "Clicks")
    for i, row in df.head(20).iterrows():
        row_str = " ".join([str(x).lower() for x in row.values])
        if "campaign" in row_str and ("spend" in row_str or "impressions" in row_str or "clicks" in row_str):
            best_idx = i
            break
            
    if best_idx != -1:
        df.columns = df.iloc[best_idx]
        df = df[best_idx+1:]
        
    df.columns = [str(c).strip() for c in df.columns]
    return df

def get_col_name(df, keywords):
    """
    Finds a column name that contains one of the keywords (case-insensitive).
    """
    cols = [c.lower() for c in df.columns]
    for k in keywords:
        k = k.lower()
        # Exact match first
        if k in cols:
            return df.columns[cols.index(k)]
        # Partial match
        for i, c in enumerate(cols):
            if k in c:
                return df.columns[i]
    return None

def analyze_campaigns(df):
    try:
        # 1. Identify Columns
        col_camp = get_col_name(df, ['Campaign Name', 'Campaign Name (Informational only)', 'Campaign'])
        col_spend = get_col_name(df, ['Spend', 'Cost'])
        col_sales = get_col_name(df, ['Sales', 'Total Sales', '7 Day Total Sales'])
        
        # If headers are totally missing (numbers '0', '1'...), try index fallback?
        # Amazon standard often: Col 5 (Campaign), Col 19 (Spend). But risky.
        # Let's stick to header logic first.
        
        if not col_camp or not col_spend:
             missing = []
             if not col_camp: missing.append("Campaign Column")
             if not col_spend: missing.append("Spend Column")
             return pd.DataFrame(), f"Could not find: {', '.join(missing)}. Detected: {list(df.columns)}", None

        # 2. Clean Data
        df['Clean_Spend'] = df[col_spend].apply(clean_currency)
        if col_sales:
            df['Clean_Sales'] = df[col_sales].apply(clean_currency)
        else:
            df['Clean_Sales'] = 0.0
            
        # 3. Aggregation
        try:
             camp_stats = df.groupby(col_camp).agg({'Clean_Spend': 'sum', 'Clean_Sales': 'sum'}).reset_index()
        except TypeError:
             # Handle potential group issues
             return pd.DataFrame(), "Data type error during grouping.", None
             
        # ACOS
        camp_stats['ACOS'] = 0.0
        mask = camp_stats['Clean_Sales'] > 0
        camp_stats.loc[mask, 'ACOS'] = (camp_stats.loc[mask, 'Clean_Spend'] / camp_stats.loc[mask, 'Clean_Sales'] * 100)
        
        suggestions = []
        for i, row in camp_stats.iterrows():
            campaign = row[col_camp]
            spend = row['Clean_Spend']
            sales = row['Clean_Sales']
            acos = row['ACOS']
            
            status = "Stable"
            action = "Monitor"
            
            if sales > 0:
                if acos > 60:
                    status = "Bleeding (High ACOS)"
                    action = "📉 Lower Bids / Negatives"
                elif acos < 20:
                    status = "Winner (Low ACOS)"
                    action = "🚀 Scale Budget"
            else:
                if spend > 15:
                     status = "Wasted Spend"
                     action = "🚫 Pause / Negatives"
                else:
                     status = "Low Data"
                     action = "⏳ Wait"
            
            suggestions.append([campaign, status, f"{acos:.1f}%", f"{spend:.2f}", action])

        return pd.DataFrame(suggestions, columns=['Campaign', 'Status', 'ACOS', 'Spend', 'Action']), None, None

    except Exception as e:
        return pd.DataFrame(), str(e), None

def app():
    st.header("📈 Ads Manager (Universal Parser)")
    st.info("Upload your Excel/CSV Report.")
    
    uploaded_file = st.file_uploader("Upload File", type=['csv', 'xlsx'])
    
    if uploaded_file:
        try:
            df_raw = None
            if uploaded_file.name.endswith('.csv'):
                df_raw = pd.read_csv(uploaded_file, header=None)
            else:
                excel_file = pd.ExcelFile(uploaded_file)
                sheet_names = excel_file.sheet_names
                selected_sheet = st.selectbox("Select Sheet", sheet_names)
                df_raw = pd.read_excel(uploaded_file, sheet_name=selected_sheet, header=None)
            
            if df_raw is not None:
                # 1. Smarter Header Search
                df_parsed = find_header_row(df_raw)
                
                with st.expander("🔍 Debug: Header Detection", expanded=False):
                    st.write(f"**Detected Columns:** {list(df_parsed.columns)}")
                
                # 2. Analyze
                camp_plan, error, _ = analyze_campaigns(df_parsed)
                
                if error:
                    st.error(f"Analysis Failed: {error}")
                    st.warning("Ensure your report has columns like 'Campaign Name' and 'Spend'.")
                    st.dataframe(df_parsed.head())
                elif not camp_plan.empty:
                    st.subheader("🛡️ Strategic Action Plan")
                    
                    # Metrics
                    total_spend = df_parsed['Clean_Spend'].sum() if 'Clean_Spend' in df_parsed else 0
                    c1, c2 = st.columns(2)
                    c1.metric("Total Spend Analyzed", f"₹{total_spend:,.2f}")
                    c2.metric("Campaigns", len(camp_plan))
                    
                    st.table(camp_plan)
                    
                    csv = camp_plan.to_csv(index=False).encode('utf-8')
                    st.download_button("Download Strategy", csv, "ads_strategy.csv", "text/csv")
                else:
                    st.warning("No campaign data found.")
                
        except Exception as e:
            st.error(f"File Error: {e}")
