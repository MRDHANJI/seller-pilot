"use client";

import { useState } from "react";
import {
    Globe,
    Download,
    Trash2,
    Play,
    FileSpreadsheet,
    CheckCircle2,
    Loader2,
    Swords,
    ChevronRight,
    Search
} from "lucide-react";
import csvDownload from "json-to-csv-export";
import styles from "./BulkScraper.module.css";
import { AmazonProductData } from "../../lib/amazon-scraper";
import { performGapAnalysis, GapAnalysisResult } from "../../lib/gap-analysis";
import ComparisonTable from "../../components/intelligence/ComparisonTable";

export default function BulkScraper() {
    const [asinsInput, setAsinsInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<AmazonProductData[]>([]);
    const [progress, setProgress] = useState(0);
    const [isCompareMode, setIsCompareMode] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<GapAnalysisResult | null>(null);

    const startScraping = async () => {
        const asins = asinsInput.split(/[\s,]+/).filter(a => a.length >= 10);
        if (asins.length === 0) {
            alert("Please enter valid ASINs.");
            return;
        }

        if (isCompareMode && asins.length < 2) {
            alert("Comparison Mode requires at least 2 ASINs (Your ASIN + 1 or more competitors).");
            return;
        }

        setLoading(true);
        setResults([]);
        setAnalysisResult(null);
        setProgress(0);

        const scrapedData: AmazonProductData[] = [];
        for (let i = 0; i < asins.length; i++) {
            try {
                const response = await fetch("/api/scrape", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ asin: asins[i] }),
                });
                const data = await response.json();
                scrapedData.push(data);
                setResults([...scrapedData]);
                setProgress(Math.round(((i + 1) / asins.length) * 100));
            } catch (error) {
                console.error(`Error scraping ${asins[i]}`, error);
            }
        }

        if (isCompareMode && scrapedData.length >= 2) {
            const userProduct = scrapedData[0];
            const competitors = scrapedData.slice(1);
            const analysis = performGapAnalysis(userProduct, competitors);
            setAnalysisResult(analysis);
        }

        setLoading(false);
    };

    const exportData = () => {
        if (results.length === 0) return;
        csvDownload({
            data: results,
            filename: `amazon_scrape_${new Date().toISOString().split('T')[0]}`,
            delimiter: ',',
            headers: [
                "ASIN", "Title", "Price", "MRP", "Rating", "Reviews",
                "BSR", "Sold By", "Image Count", "Description"
            ]
        });
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerIcon}>
                    <Globe size={28} className="gradient-text" />
                </div>
                <div className={styles.headerContent}>
                    <div>
                        <h2 className={styles.title}>Product Intelligence</h2>
                        <p className={styles.subtitle}>Extract comprehensive product data and analyze competitor gaps.</p>
                    </div>
                </div>
                <div className={styles.modeToggle}>
                    <button
                        className={`${styles.toggleBtn} ${!isCompareMode ? styles.activeMode : ""}`}
                        onClick={() => setIsCompareMode(false)}
                    >
                        <Search size={16} /> Bulk Extract
                    </button>
                    <button
                        className={`${styles.toggleBtn} ${isCompareMode ? styles.activeMode : ""}`}
                        onClick={() => setIsCompareMode(true)}
                    >
                        <Swords size={16} /> Competitor Gap
                    </button>
                </div>
            </header>

            <div className={styles.layout}>
                <div className={`glass-panel ${styles.inputPanel}`}>
                    <div className={styles.inputHeader}>
                        <h3>{isCompareMode ? "Compare ASINs" : "Enter ASINs"}</h3>
                        {isCompareMode && <span className={styles.infoBadge}>First ASIN = Your Product</span>}
                    </div>
                    <textarea
                        placeholder={isCompareMode ? "Enter Your ASIN first, then competitor ASINs..." : "Paste ASINs here (separated by space, comma or new line)..."}
                        value={asinsInput}
                        onChange={(e) => setAsinsInput(e.target.value)}
                        className={styles.asinTextarea}
                        disabled={loading}
                    />
                    <div className={styles.inputActions}>
                        <button
                            className={styles.clearBtn}
                            onClick={() => {
                                setAsinsInput("");
                                setResults([]);
                                setAnalysisResult(null);
                            }}
                            disabled={loading || !asinsInput}
                        >
                            <Trash2 size={16} /> Clear
                        </button>
                        <button
                            className={styles.startBtn}
                            onClick={startScraping}
                            disabled={loading || !asinsInput}
                        >
                            {loading ? <Loader2 className={styles.spin} size={18} /> : (isCompareMode ? <Swords size={18} /> : <Play size={18} />)}
                            <span>{loading ? `Processing (${progress}%)` : (isCompareMode ? "Start Gap Analysis" : "Get Product Data")}</span>
                        </button>
                    </div>
                </div>

                <div className={styles.outputArea}>
                    <div className={styles.outputHeader}>
                        <div className={styles.resultsCount}>
                            <CheckCircle2 size={18} color={results.length > 0 ? "var(--success)" : "var(--text-muted)"} />
                            <span>{results.length} Products Found</span>
                        </div>
                        {results.length > 0 && !isCompareMode && (
                            <button className={styles.exportBtn} onClick={exportData}>
                                <Download size={18} /> <span>Download CSV</span>
                            </button>
                        )}
                    </div>

                    {isCompareMode && analysisResult ? (
                        <div className="animate-fade-in">
                            <ComparisonTable data={analysisResult} />
                        </div>
                    ) : (
                        <div className={`glass-panel ${styles.tableContainer}`}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Product Details</th>
                                        <th>Price / MRP</th>
                                        <th>Stats (BSR/Rating)</th>
                                        <th>Images</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map((item, i) => (
                                        <tr key={i} className="animate-fade-in">
                                            <td>
                                                <div className={styles.productCell}>
                                                    <span className={styles.asin}>{item.asin}</span>
                                                    <span className={styles.productTitle}>{item.title}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.priceCell}>
                                                    <span className={styles.price}>₹{item.price}</span>
                                                    <span className={styles.mrp}>₹{item.mrp}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.statsCell}>
                                                    <span className={styles.bsr}>#{item.bsr}</span>
                                                    <span className={styles.rating}>{item.rating}★ ({item.reviews})</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={styles.imageCount}>{item.images}</span>
                                            </td>
                                            <td>
                                                <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.actionBtn}>
                                                    View <ChevronRight size={14} />
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                    {results.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className={styles.emptyTd}>
                                                <div className={styles.emptyContent}>
                                                    <FileSpreadsheet size={48} className={styles.emptyIcon} />
                                                    <p>{isCompareMode ? "Waiting for comparison data..." : "No data extracted yet. Start a task to see results."}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
