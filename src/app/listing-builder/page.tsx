"use client";

import { useState } from "react";
import {
    PenTool,
    Sparkles,
    Layout,
    Type,
    ListOrdered,
    FileText,
    AlertCircle,
    Copy,
    Check
} from "lucide-react";
import styles from "./ListingBuilder.module.css";

interface ListingResult {
    title: string;
    bullets: string[];
    description: string;
    seoScore: number;
    suggestions: string[];
}

export default function ListingBuilder() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        productName: "",
        brandName: "",
        specifications: "",
        keywords: "",
        marketplace: "Amazon"
    });
    const [result, setResult] = useState<ListingResult | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const generateListing = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch("/api/generate-listing", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error("Failed to generate");

            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error(error);
            alert("Error generating listing. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerIcon}>
                    <PenTool size={28} className="gradient-text" />
                </div>
                <div>
                    <h2 className={styles.title}>AI Listing Builder</h2>
                    <p className={styles.subtitle}>Generate SEO-optimized product content powered by Amazon&apos;s A9 algorithm insights.</p>
                </div>
            </header>

            <div className={styles.layout}>
                {/* Input Section */}
                <div className={`glass-panel ${styles.inputPanel}`}>
                    <form onSubmit={generateListing} className={styles.form}>
                        <div className={styles.field}>
                            <label>Product Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Wireless Noise Canceling Headphones"
                                value={formData.productName}
                                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Brand Name</label>
                            <input
                                type="text"
                                placeholder="e.g. SoundMax"
                                value={formData.brandName}
                                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Product Specifications</label>
                            <textarea
                                placeholder="List key details, materials, what&apos;s in the box..."
                                rows={5}
                                value={formData.specifications}
                                onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Target Keywords (Comma separated)</label>
                            <textarea
                                placeholder="e.g. bluetooth, noise canceling, bass, stereo..."
                                rows={2}
                                value={formData.keywords}
                                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                            />
                        </div>

                        <button type="submit" className={styles.generateBtn} disabled={loading}>
                            {loading ? "Generating..." : (
                                <>
                                    <Sparkles size={18} />
                                    <span>Generate Listing</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Output Section */}
                <div className={styles.resultContainer}>
                    {result ? (
                        <div className="animate-fade-in">
                            <div className={`glass-panel ${styles.seoScoreCard}`}>
                                <div className={styles.scoreCircle}>
                                    <span className={styles.score}>{result.seoScore}</span>
                                    <span className={styles.scoreMax}>/100</span>
                                </div>
                                <div>
                                    <h3 className={styles.scoreTitle}>SEO Health Score</h3>
                                    <p className={styles.scoreDesc}>Your listing is performing well! Implement the suggestions to reach 100.</p>
                                </div>
                            </div>

                            <div className={styles.resultList}>
                                {/* Title */}
                                <div className={`glass-panel ${styles.resultItem}`}>
                                    <div className={styles.itemHeader}>
                                        <div className={styles.itemLabel}>
                                            <Type size={16} />
                                            <span>Product Title</span>
                                        </div>
                                        <button
                                            className={styles.copyBtn}
                                            onClick={() => handleCopy(result.title, 'title')}
                                        >
                                            {copied === 'title' ? <Check size={16} /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                    <p className={styles.itemValue}>{result.title}</p>
                                </div>

                                {/* Bullets */}
                                <div className={`glass-panel ${styles.resultItem}`}>
                                    <div className={styles.itemHeader}>
                                        <div className={styles.itemLabel}>
                                            <ListOrdered size={16} />
                                            <span>Bullet Points</span>
                                        </div>
                                        <button
                                            className={styles.copyBtn}
                                            onClick={() => handleCopy(result.bullets.join('\n'), 'bullets')}
                                        >
                                            {copied === 'bullets' ? <Check size={16} /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                    <ul className={styles.bullets}>
                                        {result.bullets.map((bullet: string, i: number) => (
                                            <li key={i}>{bullet}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Description */}
                                <div className={`glass-panel ${styles.resultItem}`}>
                                    <div className={styles.itemHeader}>
                                        <div className={styles.itemLabel}>
                                            <FileText size={16} />
                                            <span>Description</span>
                                        </div>
                                        <button
                                            className={styles.copyBtn}
                                            onClick={() => handleCopy(result.description, 'desc')}
                                        >
                                            {copied === 'desc' ? <Check size={16} /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                    <p className={styles.itemValue}>{result.description}</p>
                                </div>
                            </div>

                            <div className={`glass-panel ${styles.suggestionsCard}`}>
                                <h4 className={styles.suggestionsTitle}>
                                    <AlertCircle size={16} />
                                    <span>Optimization Suggestions</span>
                                </h4>
                                <ul className={styles.suggestionsList}>
                                    {result.suggestions.map((s: string, i: number) => (
                                        <li key={i}>{s}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className={`glass-panel ${styles.emptyState}`}>
                            <Layout size={48} className={styles.emptyIcon} />
                            <h3>Ready to transform your sales?</h3>
                            <p>Fill in the product details and click generate to see the magic happen.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
