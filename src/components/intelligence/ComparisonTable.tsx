import { useState } from "react";
import { Zap, Target, ShieldCheck, AlertCircle, TrendingUp, Info, BarChart3, Search, FileText } from "lucide-react";
import styles from "./ComparisonTable.module.css";
import { GapAnalysisResult } from "../../lib/gap-analysis";

interface ComparisonTableProps {
    data: GapAnalysisResult;
}

type TabType = 'market' | 'keywords' | 'audit';

export default function ComparisonTable({ data }: ComparisonTableProps) {
    const [activeTab, setActiveTab] = useState<TabType>('market');

    return (
        <div className={styles.container}>
            {/* Tab Navigation */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'market' ? styles.active : ''}`}
                    onClick={() => setActiveTab('market')}
                >
                    <BarChart3 size={18} /> Market Overview
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'keywords' ? styles.active : ''}`}
                    onClick={() => setActiveTab('keywords')}
                >
                    <Search size={18} /> Keyword Intelligence
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'audit' ? styles.active : ''}`}
                    onClick={() => setActiveTab('audit')}
                >
                    <FileText size={18} /> PDP Content Audit
                </button>
            </div>

            {/* 1. Market Overview Tab */}
            {activeTab === 'market' && (
                <section className="animate-in">
                    <div className={styles.sectionHeader}>
                        <h3><Zap size={20} className="gradient-text" /> Performance Gaps</h3>
                    </div>
                    <div className={styles.metricGrid}>
                        {data.metrics.map((metric, i) => (
                            <div key={i} className={`glass-panel ${styles.metricCard} ${styles[metric.status]}`}>
                                <span className={styles.metricLabel}>{metric.label}</span>
                                <div className={styles.comparisonValues}>
                                    <div className={styles.valueBlock}>
                                        <h4>{metric.userValue}</h4>
                                        <span className={styles.valueSub}>Your Product</span>
                                    </div>
                                    <span className={styles.vsBadge}>VS</span>
                                    <div className={styles.valueBlock}>
                                        <h4>{metric.competitorAvg}</h4>
                                        <span className={styles.valueSub}>Comp. Avg</span>
                                    </div>
                                </div>
                                <div className={styles.improvement}>
                                    {metric.status === 'worse' ?
                                        <AlertCircle size={14} color="var(--error)" /> :
                                        <ShieldCheck size={14} color="var(--success)" />
                                    }
                                    <span>{metric.improvement}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* 2. Keyword Intelligence Tab */}
            {activeTab === 'keywords' && (
                <section className="animate-in">
                    <div className={styles.sectionHeader}>
                        <h3><Target size={20} className="gradient-text" /> Missing Keyword Opportunities</h3>
                        <p className={styles.valueSub}>High-volume phrases used by competitors that you are missing</p>
                    </div>
                    <div className={styles.keywordGrid}>
                        {data.keywordGaps.map((gap, i) => (
                            <div key={i} className={`glass-panel ${styles.keywordCard} ${gap.isMandatory ? styles.mandatoryCard : ''}`}>
                                <div className={styles.kwHeader}>
                                    <div className={styles.kwBadges}>
                                        <span className={`${styles.importance} ${styles[gap.importance]}`}>
                                            {gap.importance}
                                        </span>
                                        {gap.isMandatory && <span className={styles.mandatoryBadge}>MANDATORY</span>}
                                    </div>
                                    <span className={styles.kwType}>{gap.type}</span>
                                </div>
                                <div className={styles.kwBody}>
                                    <strong className={styles.kwText}>{gap.keyword}</strong>
                                    <div className={styles.kwStats}>
                                        <div className={styles.statItem}>
                                            <TrendingUp size={12} />
                                            <span>{gap.competitorFrequency} Comps</span>
                                        </div>
                                        <div className={styles.statItem}>
                                            <Zap size={12} />
                                            <span>{gap.volume.toLocaleString()} Vol</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* 3. PDP Content Audit Tab */}
            {activeTab === 'audit' && (
                <section className="animate-in">
                    <div className={styles.sectionHeader}>
                        <h3><ShieldCheck size={20} className="gradient-text" /> Professional Content Audit</h3>
                        <p className={styles.valueSub}>A9 Algorithm optimization comparison across listings</p>
                    </div>
                    <div className={styles.auditGrid}>
                        {data.audits.map((audit, i) => (
                            <div key={i} className={`glass-panel ${styles.auditCard} ${audit.isUser ? styles.userAudit : ''}`}>
                                <div className={styles.auditHeader}>
                                    <div>
                                        <strong>{audit.asin}</strong>
                                        <span className={styles.auditBadge}>{audit.isUser ? 'YOUR PDP' : 'COMPETITOR'}</span>
                                    </div>
                                    <div className={styles.auditScore}>
                                        <span className={audit.score > 80 ? "text-success" : "text-warning"}>{audit.score}%</span>
                                        <span className={styles.valueSub}>A9 Score</span>
                                    </div>
                                </div>
                                <div className={styles.auditStats}>
                                    <div className={styles.auditStatRow}>
                                        <span>Title Length</span>
                                        <span className={audit.titleLength > 140 ? "text-success" : "text-warning"}>
                                            {audit.titleLength} chars
                                        </span>
                                    </div>
                                    <div className={styles.auditStatRow}>
                                        <span>Feature Bullets</span>
                                        <span className={audit.bulletCount >= 5 ? "text-success" : "text-warning"}>
                                            {audit.bulletCount}/5 Count
                                        </span>
                                    </div>
                                    <div className={styles.auditStatRow}>
                                        <span>Brand in Title</span>
                                        <span className={audit.hasBrandInTitle ? "text-success" : "text-error"}>
                                            {audit.hasBrandInTitle ? "YES" : "NO"}
                                        </span>
                                    </div>
                                    <div className={styles.auditStatRow}>
                                        <span>Content Quality</span>
                                        <span className={styles[`quality${audit.bulletsQuality}`]}>
                                            {audit.bulletsQuality}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
