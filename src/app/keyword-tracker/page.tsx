"use client";

import { useState } from "react";
import {
    Search,
    MapPin,
    Clock,
    RefreshCw,
    ExternalLink,
    Target,
    BarChart2,
    AlertCircle,
    CheckCircle2,
    Layout,
    DollarSign
} from "lucide-react";
import styles from "./KeywordTracker.module.css";

interface RankResult {
    organicRank: number | null;
    sponsoredRank: number | null;
    page: number | null;
    price: string | null;
    status: string;
}

export default function KeywordTracker() {
    const [asin, setAsin] = useState("");
    const [keyword, setKeyword] = useState("");
    const [loading, setLoading] = useState(false);
    const [scanPage, setScanPage] = useState(1);
    const [result, setResult] = useState<RankResult | null>(null);
    const [error, setError] = useState("");

    const trackKeyword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!asin || !keyword) return;

        setLoading(true);
        setScanPage(1);
        setError("");
        setResult(null);

        const interval = setInterval(() => {
            setScanPage(prev => (prev < 10 ? prev + 1 : prev));
        }, 4000);

        try {
            const response = await fetch("/api/keyword-tracker", {
                method: "POST",
                body: JSON.stringify({ asin, keyword }),
            });

            clearInterval(interval);
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            setResult(data);
        } catch (err: unknown) {
            clearInterval(interval);
            const errorMessage = err instanceof Error ? err.message : "Failed to track keyword";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerIcon}>
                    <Target size={28} className="gradient-text" />
                </div>
                <div>
                    <h2 className={styles.title}>Keyword Rank Tracker</h2>
                    <p className={styles.subtitle}>Track your ASIN&apos;s position for specific keywords across multiple pages.</p>
                </div>
            </header>

            <div className={`glass-panel ${styles.searchSection}`}>
                <form onSubmit={trackKeyword} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>Product ASIN</label>
                        <div className={styles.inputWrapper}>
                            <Layout size={18} />
                            <input
                                type="text"
                                placeholder="e.g., B0CZ77N7D5"
                                value={asin}
                                onChange={(e) => setAsin(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Target Keyword</label>
                        <div className={styles.inputWrapper}>
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="e.g., wireless headphones"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className={styles.trackBtn} disabled={loading}>
                        {loading ? (
                            <div className={styles.loadingFlex}>
                                <RefreshCw size={18} className="spin" />
                                <span>Scanning Page {scanPage}...</span>
                            </div>
                        ) : "Track Rank"}
                    </button>
                </form>
            </div>

            {error && (
                <div className={`glass-panel ${styles.errorCard}`}>
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {result ? (
                <div className={styles.resultsArea}>
                    <div className="animate-fade-in">
                        <div className={styles.mainScore}>
                            <div className={`glass-panel ${styles.scoreCard}`}>
                                <span className={styles.scoreLabel}>Rank Position</span>
                                <h2 className={styles.scoreValue}>
                                    {result.organicRank || result.sponsoredRank || "N/A"}
                                </h2>
                                <div className={styles.scoreStatus}>
                                    <CheckCircle2 size={16} color="var(--success)" />
                                    <span>On Page {result.page || "N/A"}</span>
                                </div>
                            </div>

                            <div className={`glass-panel ${styles.scoreCard}`}>
                                <span className={styles.scoreLabel}>Current Price</span>
                                <h2 className={styles.scoreValue}>
                                    {result.price ? `₹${result.price}` : "N/A"}
                                </h2>
                                <div className={styles.scoreStatus}>
                                    <DollarSign size={16} color="var(--warning)" />
                                    <span>Real-time extraction</span>
                                </div>
                            </div>

                            <div className={`glass-panel ${styles.scoreCard}`}>
                                <span className={styles.scoreLabel}>Listing Status</span>
                                <h2 className={styles.scoreValue} style={{
                                    color: result.status === 'Organic' ? 'var(--success)' : result.status === 'Sponsored' ? 'var(--warning)' : 'var(--error)'
                                }}>
                                    {result.status}
                                </h2>
                                <div className={styles.scoreStatus}>
                                    <BarChart2 size={16} color="var(--accent-primary)" />
                                    <span>Amazon.in Search</span>
                                </div>
                            </div>
                        </div>

                        <div className={`glass-panel ${styles.detailList}`}>
                            <h3 className={styles.detailTitle}>Tracking Details</h3>
                            <div className={styles.detailItem}>
                                <Clock size={16} />
                                <span>Last checked: {new Date().toLocaleTimeString()}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <MapPin size={16} />
                                <span>Marketplace: Amazon.in</span>
                            </div>
                            <a
                                href={`https://www.amazon.in/s?k=${encodeURIComponent(keyword)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.verifyLink}
                            >
                                Manual Verification <ExternalLink size={14} />
                            </a>
                        </div>
                    </div>
                </div>
            ) : (
                !loading && (
                    <div className={`glass-panel ${styles.emptyState}`}>
                        <RefreshCw size={48} className={styles.emptyIcon} />
                        <h3>Analyze your position</h3>
                        <p>We&apos;ll scan up to 10 pages on Amazon.in search results to find exactly where your product appears.</p>
                    </div>
                )
            )}
        </div>
    );
}
