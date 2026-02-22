import { Zap, Target, ShieldCheck, AlertCircle, TrendingUp, Info } from "lucide-react";
import styles from "./ComparisonTable.module.css";
import { GapAnalysisResult } from "../../lib/gap-analysis";

interface ComparisonTableProps {
    data: GapAnalysisResult;
}

export default function ComparisonTable({ data }: ComparisonTableProps) {
    return (
        <div className={styles.container}>
            {/* 1. Core Metrics Comparison */}
            <section>
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

            {/* 2. Keyword Gap Engine */}
            <section>
                <div className={styles.sectionHeader}>
                    <h3><Target size={20} className="gradient-text" /> Missing Keyword Opportunities</h3>
                    <p className={styles.valueSub}>Keywords used by competitors that you are missing</p>
                </div>
                <div className={styles.keywordGrid}>
                    {data.keywordGaps.map((gap, i) => (
                        <div key={i} className={`glass-panel ${styles.keywordCard}`}>
                            <div className={styles.kwHeader}>
                                <span className={styles.importance} style={{
                                    backgroundColor: gap.importance === 'high' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                    color: gap.importance === 'high' ? '#ef4444' : '#f59e0b'
                                }}>
                                    {gap.importance}
                                </span>
                                <div className={styles.freqBadge}>
                                    <TrendingUp size={12} /> {gap.competitorFrequency} Comps
                                </div>
                            </div>
                            <strong>{gap.keyword}</strong>
                        </div>
                    ))}
                    {data.keywordGaps.length === 0 && (
                        <div className="glass-panel" style={{ padding: '2rem', gridColumn: '1/-1', textAlign: 'center' }}>
                            <ShieldCheck size={24} color="var(--success)" />
                            <p>Excellent! You are using all the key terms your competitors are using.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* 3. A9 SEO Health Check */}
            <section>
                <div className={styles.sectionHeader}>
                    <h3><ShieldCheck size={20} className="gradient-text" /> A9 Algorithm Health</h3>
                </div>
                <div className={styles.healthGrid}>
                    {data.a9Check.map((check, i) => (
                        <div key={i} className={`glass-panel ${styles.healthCard}`}>
                            <div className={styles.healthHeader}>
                                <strong>{check.label}</strong>
                                <span className={check.passed ? "text-success" : "text-warning"}>
                                    {check.score}%
                                </span>
                            </div>
                            <div className={styles.scoreBar}>
                                <div className={styles.scoreFill} style={{ width: `${check.score}%` }} />
                            </div>
                            <div className={styles.healthTip}>
                                <Info size={14} /> {check.tip}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
