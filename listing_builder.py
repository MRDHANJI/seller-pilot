import streamlit as st
import random

POWER_WORDS = [
    "Premium", "Exclusive", "Advanced", "Professional", "Ultimate", 
    "High-Performance", "Durable", "Heavy-Duty", "Luxury", "Top-Rated"
]

def generate_a9_listing(brand, category, features_text, materials="Premium Quality"):
    """
    Generates a Helium10-style optimized listing.
    """
    features = [f.strip() for f in features_text.split('\n') if f.strip()]
    if not features: features = ["High Quality Build", "Modern Design", "Easy to Use"]
    
    # 1. Title Strategy (150-200 chars preferred)
    # [Brand] [Category] - [Main Feature] | [Material/benefit] | [Usage]
    power_word = random.choice(POWER_WORDS)
    title = f"{brand} {power_word} {category} - {features[0]}"
    
    if len(features) > 1: title += f" | {features[1]}"
    title += f" | {materials} for Men & Women"
    
    # Length check & padding
    if len(title) < 80: title += f" | Ideal for Home, Office, Travel"
    
    # 2. Bullets Strategy (5 bullets, caps header)
    bullets = []
    
    # B1: Main Benefit
    bullets.append(f"✅ {features[0].upper()}: Experience the difference with our {brand} {category}. Engineered for superior performance and longevity.")
    
    # B2: Material/Durability
    bullets.append(f"✅ BUILT TO LAST: Made from {materials}, ensuring resistance to wear and tear. A reliable choice for daily use.")
    
    # B3: Feature 2
    if len(features) > 1:
        bullets.append(f"✅ {features[1].upper()}: Designed with user convenience in mind. {features[1]} makes it stand out from the competition.")
    else:
        bullets.append(f"✅ ADVANCED DESIGN: Ergonomically crafted for maximum comfort and style.")

    # B4: Usage
    bullets.append(f"✅ VERSATILE & PORTABLE: Perfect for home, office, gym, or travel. Lightweight and easy to carry anywhere.")
    
    # B5: Trust/Gift
    bullets.append(f"✅ PERFECT GIFT IDEA: Comes in premium packaging. The ideal gift for birthdays, anniversaries, and holidays. Trust in {brand} quality.")
    
    # 3. Description (HTML)
    description = f"""
    <h3>Product Description</h3>
    <p>Upgrade your lifestyle with the <b>{brand} {category}</b>. Whether you are at home or on the go, this product is designed to meet your needs with style and efficiency.</p>
    
    <p><b>Why Choose {brand}?</b></p>
    <ul>
        <li><b>{features[0]}</b>: The core feature that delivers results.</li>
        <li><b>{materials}</b>: Built for durability.</li>
        <li><b>Customer Satisfaction</b>: We prioritize quality above all.</li>
    </ul>
    """
    
    # 4. A9 Score Calculation
    score = 0
    feedback = []
    
    if 150 <= len(title) <= 200: score += 20
    else: feedback.append("Title length should be 150-200 chars (Current: " + str(len(title)) + ")")
    
    if len(bullets) >= 5: score += 20
    
    if any(x in title for x in ["Premium", "Professional", "Ultimate"]): score += 10
    else: feedback.append("Title missing Power Words (e.g. Premium, Ultimate)")
    
    score += 50 # Base score for structure
    
    return title, "\n\n".join(bullets), description, score, feedback

def app():
    st.header("📝 AI Listing Generator (V3)")
    st.info("Enter minimal details. AI generates the rest.")
    
    col1, col2 = st.columns(2)
    with col1:
        brand = st.text_input("Brand Name", value="NovaGear")
        category = st.text_input("Category", value="Running Shoes")
    with col2:
        materials = st.text_input("Material/USP", value="Breathable Mesh")
        
    features = st.text_area("Key Features (1 per line)", value="Anti-Slip Sole\nMemory Foam\nLightweight")
    
    if st.button("Generate Listing 🚀"):
        t, b, d, score, feedback = generate_a9_listing(brand, category, features, materials)
        
        st.subheader(f"Listing Score: {score}/100")
        if feedback:
            for f in feedback: st.warning(f"⚠️ {f}")
        else:
            st.success("Perfect A9 Structure!")
            
        st.subheader("Title")
        st.code(t, language=None)
        
        st.subheader("Bullet Points")
        st.code(b, language=None)
        
        st.subheader("Description (HTML)")
        st.code(d, language="html")
