"use client";

import { useState } from "react";
import {
    Search,
    TrendingUp,
    TrendingDown,
    BarChart2,
    Download,
    Filter,
    ArrowUpRight
} from "lucide-react";
import styles from "./KeywordFinder.module.css";

interface KeywordData {
    id: number;
    keyword: string;
    volume: number;
    trend: number;
    competition: string;
    organic: number;
    sponsored: number;
    relevance: number;
}

export default function KeywordFinder() {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<KeywordData[]>([]);

    const findKeywords = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulating API call
        setTimeout(() => {
            const mockKeywords: KeywordData[] = Array.from({ length: 20 }, (_, i) => ({
                id: i,
                keyword: `${query} ${['pro', 'accessories', 'kit', 'best', '2024', 'premium', 'ultra', 'mini'][i % 8]}`,
                volume: Math.floor(Math.random() * 50000) + 1000,
                trend: Math.floor(Math.random() * 100) - 20,
                competition: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
                organic: Math.floor(Math.random() * 100),
                sponsored: Math.floor(Math.random() * 50),
                relevance: Math.floor(Math.random() * 40) + 60
            }));
            setResults(mockKeywords.sort((a, b) => b.volume - a.volume));
            setLoading(false);
        }, 1500);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerIcon}>
                    <Search size={28} className="gradient-text" />
                </div>
                <div>
                    <h1 className={styles.title}>Keyword Finder</h1>
                    <p className={styles.subtitle}>Discover high-volume keywords and trends for your product category.</p>
                </div>
            </header>

            <div className={`glass-panel ${styles.searchSection}`}>
                <form onSubmit={findKeywords} className={styles.searchForm}>
                    <div className={styles.inputWrapper}>
                        <Search className={styles.searchIcon} size={20} />
                        <input
                            type="text"
                            placeholder="Enter a seed keyword (e.g. 'Coffee Maker')"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className={styles.searchBtn} disabled={loading}>
                        {loading ? "Searching..." : "Find Keywords"}
                    </button>
                </form>
            </div>

            {results.length > 0 && (
                <div className="animate-fade-in">
                    <div className={styles.actions}>
                        <div className={styles.stats}>
                            <span>Found 20 top keywords</span>
                        </div>
                        <div className={styles.buttonGroup}>
                            <button className={styles.secondaryBtn}><Filter size={16} /> Filters</button>
                            <button className={styles.secondaryBtn}><Download size={16} /> Export CSV</button>
                        </div>
                    </div>

                    <div className={`glass-panel ${styles.tableWrapper}`}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Keyword</th>
                                    <th>Search Volume</th>
                                    <th>Trend</th>
                                    <th>Competition</th>
                                    <th>Relevance</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((kw) => (
                                    <tr key={kw.id}>
                                        <td>
                                            <div className={styles.keywordCell}>
                                                <span className={styles.keywordName}>{kw.keyword}</span>
                                                <div className={styles.badgeGroup}>
                                                    {kw.organic > 70 && <span className={styles.badgeOrganic}>Organic High</span>}
                                                    {kw.sponsored > 40 && <span className={styles.badgeSponsored}>Sponsored Peak</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={styles.volumeText}>{kw.volume.toLocaleString()}</span>
                                        </td>
                                        <td>
                                            <div className={styles.trendCell} style={{ color: kw.trend > 0 ? 'var(--success)' : 'var(--error)' }}>
                                                {kw.trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                                <span>{Math.abs(kw.trend)}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`${styles.compBadge} ${styles[kw.competition.toLowerCase()]}`}>
                                                {kw.competition}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.relevanceBar}>
                                                <div className={styles.relevanceFill} style={{ width: `${kw.relevance}%` }} />
                                            </div>
                                        </td>
                                        <td>
                                            <button className={styles.actionBtn}>
                                                <ArrowUpRight size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {results.length === 0 && !loading && (
                <div className={`glass-panel ${styles.emptyState}`}>
                    <BarChart2 size={64} className={styles.emptyIcon} />
                    <h3>Start your research</h3>
                    <p>Enter a keyword above to uncover search volumes, market trends, and competitive insights.</p>
                    <div className={styles.suggestions}>
                        <span>Try:</span>
                        <button onClick={() => setQuery("Electric Kettle")}>Electric Kettle</button>
                        <button onClick={() => setQuery("Gaming Mouse")}>Gaming Mouse</button>
                        <button onClick={() => setQuery("Yoga Mat")}>Yoga Mat</button>
                    </div>
                </div>
            )}
        </div>
    );
}
