"use client";

import { useState } from "react";
import {
    BarChart3,
    Swords,
    Loader2
} from "lucide-react";
import styles from "./CompetitiveAnalysis.module.css";
import { AmazonProductData } from "../../lib/amazon-scraper";
import { performCompetitiveAnalysis, CompetitiveMatrix } from "../../lib/gap-analysis";

export default function CompetitiveAnalysisPage() {
    const [userAsin, setUserAsin] = useState("");
    const [compAsins, setCompAsins] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<CompetitiveMatrix[]>([]);
    const [progress, setProgress] = useState("");

    const runAnalysis = async () => {
        const competitors = compAsins.split(/[\s,]+/).filter(a => a.length >= 10);
        if (!userAsin || competitors.length < 1) {
            alert("Please provide Your ASIN and at least 1 competitor ASIN (Recommended: 3).");
            return;
        }

        setLoading(true);
        setResults([]);
        const allScraped: AmazonProductData[] = [];
        const asinsToScrape = [userAsin, ...competitors.slice(0, 3)];

        for (let i = 0; i < asinsToScrape.length; i++) {
            setProgress(`Scraping ${asinsToScrape[i]}...`);
            try {
                const response = await fetch("/api/scrape", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ asin: asinsToScrape[i] }),
                });
                const data = await response.json();
                allScraped.push(data);
            } catch (e) {
                console.error(e);
            }
        }

        if (allScraped.length >= 2) {
            const userProduct = allScraped[0];
            const compProducts = allScraped.slice(1);
            const matrix = performCompetitiveAnalysis(userProduct, compProducts);
            setResults(matrix);
        }
        setLoading(false);
        setProgress("");
    };

    const FactorRow = ({ label, field }: { label: string, field: keyof CompetitiveMatrix }) => (
        <tr>
            <td className={styles.factorCell}>{label}</td>
            {results.map((res, i) => (
                <td key={i} className={res.isUser ? styles.userCol : styles.compCol}>
                    <div className={styles.value}>
                        {field === 'badge' ? (
                            <span className={`${styles.badge} ${res.badge === 'Best Seller' ? styles.bestSeller : (res.badge === 'Amazon Choice' ? styles.amazonChoice : styles.none)}`}>
                                {res[field]}
                            </span>
                        ) : field === 'titleOptimization' || field === 'adsRunning' ? (
                            <span className={styles[res[field].toLowerCase()]}>{res[field]}</span>
                        ) : field === 'keywordVolume' ? (
                            <span className={styles.mainValue}>{res[field].toLocaleString()}</span>
                        ) : (
                            <span className={styles.mainValue}>{res[field] as string}</span>
                        )}
                    </div>
                </td>
            ))}
        </tr>
    );

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerIcon}>
                    <BarChart3 size={32} />
                </div>
                <div>
                    <h1 className={styles.title}>Competitive Analysis</h1>
                    <p className={styles.subtitle}>Full-scale growth matrix comparing your brand against the competitive field.</p>
                </div>
            </header>

            <section className={`glass-panel ${styles.inputSection}`}>
                <div className={styles.inputGrid}>
                    <div className={styles.inputField}>
                        <label className={styles.inputLabel}>Your Product ASIN</label>
                        <input
                            placeholder="B0XXXXXXX"
                            className={styles.asinInput}
                            value={userAsin}
                            onChange={(e) => setUserAsin(e.target.value)}
                        />
                    </div>
                    <div className={styles.inputField}>
                        <label className={styles.inputLabel}>Competitor ASINs (Comma separated)</label>
                        <input
                            placeholder="ASIN 1, ASIN 2, ASIN 3"
                            className={styles.asinInput}
                            value={compAsins}
                            onChange={(e) => setCompAsins(e.target.value)}
                        />
                    </div>
                </div>
                <button
                    className={styles.startBtn}
                    onClick={runAnalysis}
                    disabled={loading}
                >
                    {loading ? <Loader2 className={styles.loader} size={20} /> : <Swords size={20} />}
                    <span>{loading ? progress : "Run Pro Matrix Analysis"}</span>
                </button>
            </section>

            {results.length > 0 && (
                <div className={`${styles.matrixContainer} animate-in`}>
                    <table className={styles.matrixTable}>
                        <thead>
                            <tr>
                                <th className={styles.factorCell}>Factor</th>
                                {results.map((res, i) => (
                                    <th key={i} className={`${res.isUser ? styles.userCol : styles.compCol} ${res.isUser ? styles.userHeader : ''}`}>
                                        {res.isUser ? "YOUR BRAND" : `COMPETITOR ${i}`}
                                        <div className={styles.subValue}>{res.asin}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <FactorRow label="Price" field="price" />
                            <FactorRow label="Rating" field="rating" />
                            <FactorRow label="Reviews" field="reviews" />
                            <FactorRow label="Keyword Rank" field="keywordRank" />
                            <FactorRow label="Title Optimization" field="titleOptimization" />
                            <FactorRow label="Images Quality" field="imagesQuality" />
                            <FactorRow label="A+ Content" field="aPlusContent" />
                            <FactorRow label="Brand Store" field="brandStore" />
                            <FactorRow label="Ads Running" field="adsRunning" />
                            <FactorRow label="Offers" field="offers" />
                            <FactorRow label="Coupons" field="coupons" />
                            <FactorRow label="Delivery" field="delivery" />
                            <FactorRow label="Badge" field="badge" />
                            <FactorRow label="Keyword With Volume" field="keywordVolume" />
                        </tbody>
                    </table>
                </div>
            )}

            {results.length === 0 && !loading && (
                <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', opacity: 0.5 }}>
                    <BarChart3 size={48} style={{ margin: '0 auto 16px' }} />
                    <p>Enter your ASIN and competitors to generate the growth matrix.</p>
                </div>
            )}
        </div>
    );
}
