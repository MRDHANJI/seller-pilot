"use client";

import { useState } from "react";
import {
    Globe,
    Download,
    Trash2,
    Play,
    FileSpreadsheet,
    CheckCircle2,
    Loader2
} from "lucide-react";
import csvDownload from "json-to-csv-export";
import styles from "./BulkScraper.module.css";

interface ScrapedData {
    asin: string;
    title: string;
    price: string;
    mrp: string;
    rating: string;
    reviews: string;
    bsr: string;
    category: string;
    images: number;
    soldBy: string;
}

export default function BulkScraper() {
    const [asinsInput, setAsinsInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<ScrapedData[]>([]);
    const [progress, setProgress] = useState(0);

    const startScraping = async () => {
        const asins = asinsInput.split(/[\s,]+/).filter(a => a.length >= 10);
        if (asins.length === 0) {
            alert("Please enter valid ASINs.");
            return;
        }

        setLoading(true);
        setResults([]);
        setProgress(0);

        const scrapedData: ScrapedData[] = [];
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
                <div>
                    <h2 className={styles.title}>Product Intelligence</h2>
                    <p className={styles.subtitle}>Extract comprehensive product data for multiple ASINs from Amazon.in.</p>
                </div>
            </header>

            <div className={styles.layout}>
                <div className={`glass-panel ${styles.inputPanel}`}>
                    <div className={styles.inputHeader}>
                        <h3>Enter ASINs</h3>
                        <span className={styles.countBadge}>{asinsInput.split(/[\s,]+/).filter(Boolean).length} ASINs</span>
                    </div>
                    <textarea
                        placeholder="Paste ASINs here (separated by space, comma or new line)..."
                        value={asinsInput}
                        onChange={(e) => setAsinsInput(e.target.value)}
                        className={styles.asinTextarea}
                        disabled={loading}
                    />
                    <div className={styles.inputActions}>
                        <button
                            className={styles.clearBtn}
                            onClick={() => setAsinsInput("")}
                            disabled={loading || !asinsInput}
                        >
                            <Trash2 size={16} /> Clear
                        </button>
                        <button
                            className={styles.startBtn}
                            onClick={startScraping}
                            disabled={loading || !asinsInput}
                        >
                            {loading ? <Loader2 className={styles.spin} size={18} /> : <Play size={18} />}
                            <span>{loading ? `Processing (${progress}%)` : "Get Product Data"}</span>
                        </button>
                    </div>
                </div>

                <div className={styles.outputArea}>
                    <div className={styles.outputHeader}>
                        <div className={styles.resultsCount}>
                            <CheckCircle2 size={18} color={results.length > 0 ? "var(--success)" : "var(--text-muted)"} />
                            <span>{results.length} Products Processed</span>
                        </div>
                        <button
                            className={styles.exportBtn}
                            onClick={exportData}
                            disabled={results.length === 0}
                        >
                            <Download size={18} />
                            <span>Download CSV</span>
                        </button>
                    </div>

                    <div className={`glass-panel ${styles.tableContainer}`}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Product Details</th>
                                    <th>Price / MRP</th>
                                    <th>Category</th>
                                    <th>Stats (BSR/Rating)</th>
                                    <th>Images</th>
                                    <th>Sold By</th>
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
                                            <span className={styles.category}>{item.category}</span>
                                        </td>
                                        <td>
                                            <div className={styles.statsCell}>
                                                <span className={styles.bsr}>BSR #{item.bsr}</span>
                                                <span className={styles.rating}>{item.rating}★ ({item.reviews})</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={styles.imageCount}>{item.images}</span>
                                        </td>
                                        <td>
                                            <span className={styles.seller}>{item.soldBy}</span>
                                        </td>
                                    </tr>
                                ))}
                                {results.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className={styles.emptyTd}>
                                            <div className={styles.emptyContent}>
                                                <FileSpreadsheet size={48} className={styles.emptyIcon} />
                                                <p>No data extracted yet. Start a scraping task to see results.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
