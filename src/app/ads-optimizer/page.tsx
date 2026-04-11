"use client";

import { useState, useRef } from "react";
import {
    BarChart3,
    Upload,
    FileType,
    X,
    TrendingUp,
    Zap,
    Target,
    DollarSign,
    Lightbulb,
    PieChart,
    Crosshair
} from "lucide-react";
import styles from "./AdsOptimizer.module.css";

interface Campaign {
    name: string;
    type: string;
    spend: number;
    sales: number;
    acos: number;
    roas: number;
    status: string;
    action: string;
}

interface MatchTypeData {
    exact: { spend: number, sales: number, roas: number },
    phrase: { spend: number, sales: number, roas: number },
    broad: { spend: number, sales: number, roas: number },
    auto: { spend: number, sales: number, roas: number }
}

interface TargetingData {
    keyword: { spend: number, sales: number, cpc: number },
    product: { spend: number, sales: number, cpc: number },
    audience: { spend: number, sales: number, cpc: number }
}

interface HighConfidenceSuggestion {
    title: string;
    description: string;
    impact: 'High' | 'Medium';
    confidence: number;
    dataPoint: string;
}

interface DeepAnalysisResult {
    summary: {
        totalSpend: number;
        sales: number;
        acos: number;
        roas: number;
        avgCpc: number;
    };
    campaigns: Campaign[];
    matchTypes: MatchTypeData;
    targeting: TargetingData;
    suggestions: HighConfidenceSuggestion[];
}

export default function AdsOptimizer() {
    const [bulkFile, setBulkFile] = useState<File | null>(null);
    const [structureFile, setStructureFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<DeepAnalysisResult | null>(null);
    
    const bulkInputRef = useRef<HTMLInputElement>(null);
    const structureInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'bulk' | 'structure') => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && (selectedFile.name.endsWith(".xlsx") || selectedFile.name.endsWith(".xls") || selectedFile.name.endsWith(".csv"))) {
            if (type === 'bulk') setBulkFile(selectedFile);
            else setStructureFile(selectedFile);
            setAnalysis(null);
        } else {
            alert("Please upload a valid Excel or CSV file.");
        }
    };

    const processFiles = () => {
        if (!bulkFile && !structureFile) {
            alert("Please upload at least one file to run the deep analysis.");
            return;
        }
        setLoading(true);

        // Simulated Deep Extraction
        setTimeout(() => {
            setAnalysis({
                summary: {
                    totalSpend: 15420,
                    sales: 82500,
                    acos: 18.69,
                    roas: 5.35,
                    avgCpc: 12.4
                },
                matchTypes: {
                    exact: { spend: 6500, sales: 42000, roas: 6.46 },
                    phrase: { spend: 4200, sales: 18000, roas: 4.28 },
                    broad: { spend: 2500, sales: 9500, roas: 3.8 },
                    auto: { spend: 2220, sales: 13000, roas: 5.85 }
                },
                targeting: {
                    keyword: { spend: 9500, sales: 55000, cpc: 14.5 },
                    product: { spend: 3800, sales: 18500, cpc: 9.8 },
                    audience: { spend: 2120, sales: 9000, cpc: 11.2 }
                },
                campaigns: [
                    { name: "SP_Exact_Top20_Kwds", type: "Sponsored Product", spend: 4500, sales: 32000, acos: 14.06, roas: 7.11, status: "Scale", action: "Increase bids 15% on top 3 converting keywords." },
                    { name: "SD_Product_Targeting_Defensive", type: "Sponsored Display", spend: 1200, sales: 4400, acos: 27.27, roas: 3.66, status: "Optimize", action: "Pause targets under 2.0 ROAS." },
                    { name: "SB_Video_Broad_Discovery", type: "Sponsored Brand", spend: 3200, sales: 11500, acos: 27.82, roas: 3.59, status: "Stop", action: "Harvest converting search terms and pause Broad match." },
                    { name: "SP_Auto_CatchAll", type: "Auto", spend: 2220, sales: 13000, acos: 17.07, roas: 5.85, status: "Keep", action: "Add 15 negative exact terms bleeding spend." }
                ],
                suggestions: [
                    { 
                        title: "Shift Spend to Exact Match", 
                        description: "Your Exact match campaigns have a 6.46 ROAS compared to 3.8 ROAS on Broad. Shifting 30% of your Broad budget to Exact could yield an estimated ₹14k in additional monthly sales.", 
                        impact: 'High', 
                        confidence: 94,
                        dataPoint: "ROAS Gap: Exact (6.46) vs Broad (3.8)" 
                    },
                    { 
                        title: "Product Targeting Opportunity", 
                        description: "Product targeting shows a low CPC (₹9.8) but generates significant revenue. Expanding defensive product targeting against weaker competitors is highly recommended.", 
                        impact: 'Medium', 
                        confidence: 91,
                        dataPoint: "CPC Efficiency: PT (₹9.8) vs Kwd (₹14.5)" 
                    },
                    { 
                        title: "Harvest Auto Campaign Winners", 
                        description: "Auto campaign generated ₹13,000 at a healthy 5.85 ROAS. Extract the top 10 long-tail search queries into a manual Exact campaign with a 20% bid premium.", 
                        impact: 'High', 
                        confidence: 97,
                        dataPoint: "Hidden Gems Found: 14 High-converting terms" 
                    }
                ]
            });
            setLoading(false);
        }, 3000);
    };

    const MetricBox = ({ label, spend, sales, roas, cpc }: { label: string, spend: number, sales: number, roas?: number, cpc?: number }) => (
        <div className={styles.metricBox}>
            <div className={styles.metHeader}>{label}</div>
            <div className={styles.metData}>Spend: <span>₹{spend.toLocaleString()}</span></div>
            <div className={styles.metData}>Sales: <span>₹{sales.toLocaleString()}</span></div>
            {roas && <div className={styles.metDataHighlight}>ROAS: <span>{roas}x</span></div>}
            {cpc && <div className={styles.metDataHighlight}>CPC: <span>₹{cpc}</span></div>}
        </div>
    );

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerIcon}>
                    <BarChart3 size={28} className="gradient-text" />
                </div>
                <div>
                    <h2 className={styles.title}>Deep Intelligence Ads Optimizer</h2>
                    <p className={styles.subtitle}>Upload your Bulk & Structure excel files for extreme precision multi-layered campaign analysis.</p>
                </div>
            </header>

            {!analysis && !loading && (
                <div className={styles.uploadSection}>
                    <div className={styles.dualUploadGrid}>
                        <div className={`glass-panel ${styles.uploadZone}`} onClick={() => bulkInputRef.current?.click()}>
                            <input type="file" ref={bulkInputRef} className={styles.hiddenInput} onChange={(e) => handleFileUpload(e, 'bulk')} accept=".xlsx, .xls, .csv" />
                            <Upload size={32} className="gradient-text" style={{marginBottom: 16}} />
                            <h3>1. Bulk Operations File</h3>
                            {bulkFile ? (
                                <div className={styles.fileSelected}>
                                    <FileType size={16} /> <span>{bulkFile.name}</span>
                                    <button className={styles.removeFile} onClick={(e) => { e.stopPropagation(); setBulkFile(null); }}><X size={14} /></button>
                                </div>
                            ) : (
                                <p>Upload your 60-day Bulk file (.xlsx)</p>
                            )}
                        </div>

                        <div className={`glass-panel ${styles.uploadZone}`} onClick={() => structureInputRef.current?.click()}>
                            <input type="file" ref={structureInputRef} className={styles.hiddenInput} onChange={(e) => handleFileUpload(e, 'structure')} accept=".xlsx, .xls, .csv" />
                            <FileType size={32} className="gradient-text" style={{marginBottom: 16}} />
                            <h3>2. Structure / Search Term File</h3>
                            {structureFile ? (
                                <div className={styles.fileSelected}>
                                    <FileType size={16} /> <span>{structureFile.name}</span>
                                    <button className={styles.removeFile} onClick={(e) => { e.stopPropagation(); setStructureFile(null); }}><X size={14} /></button>
                                </div>
                            ) : (
                                <p>Upload Ad Campaign/Search Term report</p>
                            )}
                        </div>
                    </div>

                    <div className={styles.actionRow}>
                        <button className={styles.analyzeBtn} onClick={processFiles} disabled={!bulkFile && !structureFile}>
                            Run Deep Intelligence Analysis <Zap size={18} />
                        </button>
                    </div>
                </div>
            )}

            {loading && (
                <div className={`glass-panel ${styles.loadingState}`}>
                    <Zap size={48} className={styles.pulseIcon} />
                    <h3>Cross-Referencing Files...</h3>
                    <p>Understanding ROAS, extracting Keyword topologies, and mapping CPC data.</p>
                </div>
            )}

            {analysis && (
                <div className="animate-fade-in">
                    <section className={styles.summaryGrid}>
                        <div className={`glass-panel ${styles.summaryCard}`}>
                            <DollarSign size={20} color="var(--accent-primary)" />
                            <span className={styles.sumLabel}>Total Spend</span>
                            <h3 className={styles.sumValue}>₹{analysis.summary.totalSpend.toLocaleString()}</h3>
                        </div>
                        <div className={`glass-panel ${styles.summaryCard}`}>
                            <TrendingUp size={20} color="var(--success)" />
                            <span className={styles.sumLabel}>Total Sales</span>
                            <h3 className={styles.sumValue}>₹{analysis.summary.sales.toLocaleString()}</h3>
                        </div>
                        <div className={`glass-panel ${styles.summaryCard}`}>
                            <Target size={20} color="var(--warning)" />
                            <span className={styles.sumLabel}>Global ROAS</span>
                            <h3 className={styles.sumValue}>{analysis.summary.roas}x</h3>
                        </div>
                        <div className={`glass-panel ${styles.summaryCard}`}>
                            <Crosshair size={20} color="#8b5cf6" />
                            <span className={styles.sumLabel}>Avg CPC</span>
                            <h3 className={styles.sumValue}>₹{analysis.summary.avgCpc}</h3>
                        </div>
                    </section>

                    <div className={styles.deepMetricsGrid}>
                        <div className={`glass-panel ${styles.breakdownPanel}`}>
                            <div className={styles.panelHeader}>
                                <h3><PieChart size={18} /> Match Type Topology</h3>
                            </div>
                            <div className={styles.metricsBoxGrid}>
                                <MetricBox label="EXACT MATCH" spend={analysis.matchTypes.exact.spend} sales={analysis.matchTypes.exact.sales} roas={analysis.matchTypes.exact.roas} />
                                <MetricBox label="PHRASE MATCH" spend={analysis.matchTypes.phrase.spend} sales={analysis.matchTypes.phrase.sales} roas={analysis.matchTypes.phrase.roas} />
                                <MetricBox label="BROAD MATCH" spend={analysis.matchTypes.broad.spend} sales={analysis.matchTypes.broad.sales} roas={analysis.matchTypes.broad.roas} />
                                <MetricBox label="AUTO CAMPAIGNS" spend={analysis.matchTypes.auto.spend} sales={analysis.matchTypes.auto.sales} roas={analysis.matchTypes.auto.roas} />
                            </div>
                        </div>

                        <div className={`glass-panel ${styles.breakdownPanel}`}>
                            <div className={styles.panelHeader}>
                                <h3><Crosshair size={18} /> Targeting Stratification</h3>
                            </div>
                            <div className={styles.metricsBoxGrid}>
                                <MetricBox label="KEYWORD TARGETING" spend={analysis.targeting.keyword.spend} sales={analysis.targeting.keyword.sales} cpc={analysis.targeting.keyword.cpc} />
                                <MetricBox label="PRODUCT TARGETING" spend={analysis.targeting.product.spend} sales={analysis.targeting.product.sales} cpc={analysis.targeting.product.cpc} />
                                <MetricBox label="AUDIENCE TARGETING" spend={analysis.targeting.audience.spend} sales={analysis.targeting.audience.sales} cpc={analysis.targeting.audience.cpc} />
                            </div>
                        </div>
                    </div>

                    <div className={`glass-panel ${styles.suggestionsPanel}`}>
                        <div className={styles.suggHeader}>
                            <Lightbulb size={24} className="gradient-text" />
                            <div>
                                <h3>AI Sales Growth Suggestions</h3>
                                <span className={styles.accuracyTag}>90%+ Confidence Execution Plans</span>
                            </div>
                        </div>
                        <div className={styles.suggGrid}>
                            {analysis.suggestions.map((sugg, i) => (
                                <div key={i} className={styles.suggCard}>
                                    <div className={styles.suggTop}>
                                        <span className={`${styles.impactBadge} ${styles[sugg.impact.toLowerCase()]}`}>{sugg.impact} Impact</span>
                                        <span className={styles.confBadge}>{sugg.confidence}% Confidence</span>
                                    </div>
                                    <h4>{sugg.title}</h4>
                                    <p>{sugg.description}</p>
                                    <div className={styles.dataPointBadge}>{sugg.dataPoint}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`glass-panel ${styles.campaignList}`}>
                        <div className={styles.tableHeader}>
                            <h3>Campaign Level Action Plan</h3>
                        </div>
                        <div style={{overflowX: 'auto'}}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Campaign Details</th>
                                        <th>ROAS</th>
                                        <th>Status</th>
                                        <th>Deep Intelligence Recommendation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analysis.campaigns.map((camp: Campaign, i: number) => (
                                        <tr key={i}>
                                            <td>
                                                <div className={styles.campCell}>
                                                    <span className={styles.campName}>{camp.name}</span>
                                                    <span className={styles.campType}>{camp.type} • Spend: ₹{camp.spend}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={styles.roasText} style={{ color: camp.roas < 4.0 ? 'var(--error)' : 'var(--success)' }}>
                                                    {camp.roas}x
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${styles[camp.status.toLowerCase()]}`}>
                                                    {camp.status}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={styles.actionText}>{camp.action}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <button className={styles.resetBtn} onClick={() => setAnalysis(null)} style={{marginTop: 20}}>
                        Run New Analysis
                    </button>
                </div>
            )}
        </div>
    );
}
