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
    Crosshair,
    Printer,
    FileSearch,
    Wrench
} from "lucide-react";
import * as XLSX from "xlsx";
import styles from "./AdsOptimizer.module.css";

interface MatchTypeData {
    exact: { spend: number, sales: number, roas: number },
    phrase: { spend: number, sales: number, roas: number },
    broad: { spend: number, sales: number, roas: number },
    auto: { spend: number, sales: number, roas: number }
}

interface TargetingData {
    keyword: { spend: number, sales: number, cpc: number, clicks: number },
    product: { spend: number, sales: number, cpc: number, clicks: number },
    audience: { spend: number, sales: number, cpc: number, clicks: number }
}

interface AgencyReport {
    currentStructure: string[];
    proposedStructure: string[];
    pitchSummary: string;
}

interface DeepAnalysisResult {
    summary: {
        totalSpend: number;
        sales: number;
        acos: number;
        roas: number;
        avgCpc: number;
        sourceFiles: string[];
        sheetsParsed: number;
    };
    matchTypes: MatchTypeData;
    targeting: TargetingData;
    agencyReport: AgencyReport;
}

export default function AdsOptimizer() {
    const [bulkFile, setBulkFile] = useState<File | null>(null);
    const [structureFile, setStructureFile] = useState<File | null>(null);
    const [targetFile, setTargetFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<DeepAnalysisResult | null>(null);
    
    const bulkInputRef = useRef<HTMLInputElement>(null);
    const structureInputRef = useRef<HTMLInputElement>(null);
    const targetInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'bulk' | 'structure' | 'target') => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && (selectedFile.name.endsWith(".xlsx") || selectedFile.name.endsWith(".xls") || selectedFile.name.endsWith(".csv"))) {
            if (type === 'bulk') setBulkFile(selectedFile);
            else if (type === 'structure') setStructureFile(selectedFile);
            else setTargetFile(selectedFile);
            setAnalysis(null);
        } else {
            alert("Please upload a valid Excel or CSV file.");
        }
    };

    const processFiles = () => {
        if (!bulkFile && !structureFile && !targetFile) {
            alert("Please upload at least one file to run the deep analysis.");
            return;
        }
        setLoading(true);

        const primaryFile = targetFile || structureFile || bulkFile;

        const sources: string[] = [];
        if (bulkFile) sources.push('Bulk Operations');
        if (structureFile) sources.push('Ad Structure');
        if (targetFile) sources.push('Targeting Data');

        if (primaryFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const dataBuffer = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(dataBuffer, { type: "array" });
                    
                    let totalSpend = 0;
                    let totalSales = 0;
                    let totalClicks = 0;
                    let sheetsParsedCount = 0;

                    const matchTypes: MatchTypeData = {
                        exact: { spend: 0, sales: 0, roas: 0 },
                        phrase: { spend: 0, sales: 0, roas: 0 },
                        broad: { spend: 0, sales: 0, roas: 0 },
                        auto: { spend: 0, sales: 0, roas: 0 }
                    };

                    const targeting: TargetingData = {
                        keyword: { spend: 0, sales: 0, cpc: 0, clicks: 0 },
                        product: { spend: 0, sales: 0, cpc: 0, clicks: 0 },
                        audience: { spend: 0, sales: 0, cpc: 0, clicks: 0 }
                    };

                    workbook.SheetNames.forEach(sheetName => {
                        const worksheet = workbook.Sheets[sheetName];
                        const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" }) as Array<Record<string, string | number | boolean | undefined>>;
                        
                        if (rows.length > 0) {
                            sheetsParsedCount++;
                            
                            rows.forEach(rawRow => {
                                const row: Record<string, string | number | boolean | undefined> = {};
                                Object.keys(rawRow).forEach(k => {
                                    if (k) row[k.trim().toLowerCase()] = rawRow[k];
                                });

                                // Extremely Aggressive Fuzzy Column Matching
                                const scanKey = (keyword: string) => {
                                    const match = Object.keys(row).find(k => k.includes(keyword));
                                    return match ? String(row[match]) : "";
                                };

                                const spendStr = scanKey('spend').replace(/[^0-9.-]+/g,"");
                                const salesStr = scanKey('sale').replace(/[^0-9.-]+/g,"");
                                const clicksStr = scanKey('click').replace(/[^0-9.-]+/g,"");

                                const spend = Number(spendStr) || 0;
                                const sales = Number(salesStr) || 0;
                                const clicks = Number(clicksStr) || 0;

                                const matchType = scanKey('match').toLowerCase();
                                const targetingExp1 = scanKey('target').toLowerCase();
                                const targetingExp2 = scanKey('keyword').toLowerCase();
                                const targetingExp = targetingExp1 || targetingExp2;

                                totalSpend += spend;
                                totalSales += sales;
                                totalClicks += clicks;

                                if (matchType.includes('exact')) {
                                    matchTypes.exact.spend += spend;
                                    matchTypes.exact.sales += sales;
                                } else if (matchType.includes('phrase')) {
                                    matchTypes.phrase.spend += spend;
                                    matchTypes.phrase.sales += sales;
                                } else if (matchType.includes('broad')) {
                                    matchTypes.broad.spend += spend;
                                    matchTypes.broad.sales += sales;
                                } else if (matchType.includes('auto') || matchType.includes('-') || (spend > 0 && !matchType)) { 
                                    matchTypes.auto.spend += spend;
                                    matchTypes.auto.sales += sales;
                                }

                                if (targetingExp.includes('asin=') || targetingExp.includes('category=') || targetingExp.includes('product')) {
                                    targeting.product.spend += spend;
                                    targeting.product.sales += sales;
                                    targeting.product.clicks += clicks;
                                } else if (targetingExp.includes('audience') || targetingExp.includes('view') || targetingExp.includes('purchase')) {
                                    targeting.audience.spend += spend;
                                    targeting.audience.sales += sales;
                                    targeting.audience.clicks += clicks;
                                } else if (targetingExp) {
                                    targeting.keyword.spend += spend;
                                    targeting.keyword.sales += sales;
                                    targeting.keyword.clicks += clicks;
                                }
                            });
                        }
                    });

                    // Avoid UI Infinity or NaN
                    const calcRoas = (sales: number, spend: number) => spend > 0 ? parseFloat((sales / spend).toFixed(2)) : 0;
                    const calcCpc = (spend: number, clicks: number) => clicks > 0 ? parseFloat((spend / clicks).toFixed(2)) : 0;

                    const globalRoas = calcRoas(totalSales, totalSpend);
                    const globalCpc = calcCpc(totalSpend, totalClicks);
                    const globalAcos = totalSales > 0 ? Math.round((totalSpend / totalSales) * 100) : 0;

                    matchTypes.exact.roas = calcRoas(matchTypes.exact.sales, matchTypes.exact.spend);
                    matchTypes.phrase.roas = calcRoas(matchTypes.phrase.sales, matchTypes.phrase.spend);
                    matchTypes.broad.roas = calcRoas(matchTypes.broad.sales, matchTypes.broad.spend);
                    matchTypes.auto.roas = calcRoas(matchTypes.auto.sales, matchTypes.auto.spend);

                    targeting.keyword.cpc = calcCpc(targeting.keyword.spend, targeting.keyword.clicks);
                    targeting.product.cpc = calcCpc(targeting.product.spend, targeting.product.clicks);
                    targeting.audience.cpc = calcCpc(targeting.audience.spend, targeting.audience.clicks);

                    // Context-Aware Agency Generator Logic
                    const exactRatio = totalSpend > 0 ? Math.round((matchTypes.exact.spend / totalSpend) * 100) : 0;
                    const broadRatio = totalSpend > 0 ? Math.round((matchTypes.broad.spend / totalSpend) * 100) : 0;

                    const report: AgencyReport = {
                        currentStructure: [
                            `Account is tracking ₹${totalSpend.toLocaleString()} in ad spend driving a global ACOS of ${globalAcos}%.`,
                            `Keyword topology shows ${exactRatio}% locked in Exact Match vs ${broadRatio}% in Broad Match discovery.`,
                            `Actual Exact Match ROAS is sitting at ${matchTypes.exact.roas}x, compared to Broad Match at ${matchTypes.broad.roas}x.`,
                            `Product (ASIN) Targeting CPC averages ₹${targeting.product.cpc} vs Keyword CPC at ₹${targeting.keyword.cpc}.`
                        ],
                        proposedStructure: [],
                        pitchSummary: ''
                    };

                    if (sources.includes('Ad Structure')) {
                        report.proposedStructure = [
                            `Restructure instantly: Extract the top performing search terms and migrate into isolated Single Keyword Ad Groups (SKAGs).`,
                            `Pause all Broad campaigns currently exceeding ${globalAcos + 5}% ACOS to instantly trap bleeding margins.`,
                            `Apply a 20% 'Top of Search' placement modifier uniquely to your Exact match campaigns to block competitors capturing highest intent clicks.`
                        ];
                        report.pitchSummary = `The current ad architecture has significant structural bleed. By migrating to a heavily controlled SKAG setup and choking the Broad-match budget drain, we can re-route those exact funds into your high-ROAS (${matchTypes.exact.roas}x) Exact tiers. This structurally guarantees an immediate lift in global profitability.`;
                    } else if (sources.includes('Bulk Operations')) {
                         report.proposedStructure = [
                            `Halt under-performing portfolio bleed: Run a Pivot block across Sponsored Products vs Sponsored Brands.`,
                            `Implement an aggressive 15% downward bid automation on the worst-performing ad format.`,
                            `Launch Defense nodes: Bid strictly on your own top 3 ASINs to prevent the ${globalAcos}% ACOS from leaking to cheaper competitor substitutions.`
                        ];
                        report.pitchSummary = `Multi-format cannibalization is visible across the ${sheetsParsedCount} parsed sub-sheets. Instead of managing individual targets, the macro-strategy requires shifting total budget caps between Sponsored Products and Sponsored Brands to favor whichever format possesses cheaper acquisition costs presently.`;
                    } else {
                        // Targeting Logic
                         report.proposedStructure = [
                            `Exploit Targeting Arbitrage: Your Product Targeting (PT) is running at ₹${targeting.product.cpc} CPC. Expand ASIN conquesting immediately on competitors priced 5%+ higher.`,
                            `Extract Exact Match dominance: Pull raw Search Term reports and filter exclusively for 3-word long-tail queries.`,
                            `Establish Audience Defense: Allocate 10% budget entirely to remarketing views to guarantee conversions on the 2nd touchpoint.`
                        ];
                        report.pitchSummary = `Your placement density displays actionable arbitrage. We must isolate those highly efficient Product Targets and rapidly expand ASIN-conquesting logic before competitors bid up the defensive real estate.`;
                    }

                    setAnalysis({
                        summary: {
                            totalSpend,
                            sales: totalSales,
                            acos: globalAcos,
                            roas: globalRoas,
                            avgCpc: globalCpc,
                            sourceFiles: sources,
                            sheetsParsed: sheetsParsedCount
                        },
                        matchTypes: matchTypes,
                        targeting: targeting,
                        agencyReport: report
                    });

                } catch (error) {
                    console.error("Parsing error:", error);
                    alert("Error parsing file. Please ensure it is a valid Amazon Ads Export.");
                } finally {
                    setLoading(false);
                }
            };
            reader.readAsArrayBuffer(primaryFile);
        }
    };

    const MetricBox = ({ label, spend, sales, roas, cpc }: { label: string, spend: number, sales: number, roas?: number, cpc?: number }) => (
        <div className={styles.metricBox}>
            <div className={styles.metHeader}>{label}</div>
            <div className={styles.metData}>Spend: <span>₹{spend.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
            <div className={styles.metData}>Sales: <span>₹{sales.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
            {roas !== undefined && <div className={styles.metDataHighlight}>ROAS: <span>{roas}x</span></div>}
            {cpc !== undefined && <div className={styles.metDataHighlight}>CPC: <span>₹{cpc}</span></div>}
        </div>
    );

    return (
        <div className={styles.container}>
            <header className={`${styles.header} ${styles.hideOnPrint}`}>
                <div className={styles.headerIcon}>
                    <BarChart3 size={28} className="gradient-text" />
                </div>
                <div>
                    <h2 className={styles.title}>Deep Intelligence Ads Optimizer</h2>
                    <p className={styles.subtitle}>Fuzzy Column extraction and Agency Client Output reporting.</p>
                </div>
            </header>

            {!analysis && !loading && (
                <div className={`${styles.uploadSection} ${styles.hideOnPrint}`}>
                    <div className={styles.tripleUploadGrid}>
                        <div className={`glass-panel ${styles.uploadZone}`} onClick={() => bulkInputRef.current?.click()}>
                            <input type="file" ref={bulkInputRef} className={styles.hiddenInput} onChange={(e) => handleFileUpload(e, 'bulk')} accept=".xlsx, .xls, .csv" />
                            <Upload size={32} className="gradient-text" style={{marginBottom: 16}} />
                            <h3 style={{fontSize: '1.2rem'}}>1. Bulk Operations File</h3>
                            {bulkFile ? (
                                <div className={styles.fileSelected}>
                                    <FileType size={16} /> <span style={{fontSize: '0.8rem'}}>{bulkFile.name.substring(0,20)}..</span>
                                    <button className={styles.removeFile} onClick={(e) => { e.stopPropagation(); setBulkFile(null); }}><X size={14} /></button>
                                </div>
                            ) : (
                                <p style={{fontSize: '0.8rem'}}>Upload your multi-sheet Bulk file</p>
                            )}
                        </div>

                        <div className={`glass-panel ${styles.uploadZone}`} onClick={() => structureInputRef.current?.click()}>
                            <input type="file" ref={structureInputRef} className={styles.hiddenInput} onChange={(e) => handleFileUpload(e, 'structure')} accept=".xlsx, .xls, .csv" />
                            <FileType size={32} className="gradient-text" style={{marginBottom: 16}} />
                            <h3 style={{fontSize: '1.2rem'}}>2. Ad Structure Matrix</h3>
                            {structureFile ? (
                                <div className={styles.fileSelected}>
                                    <FileType size={16} /> <span style={{fontSize: '0.8rem'}}>{structureFile.name.substring(0,20)}..</span>
                                    <button className={styles.removeFile} onClick={(e) => { e.stopPropagation(); setStructureFile(null); }}><X size={14} /></button>
                                </div>
                            ) : (
                                <p style={{fontSize: '0.8rem'}}>Upload Campaign Matrix</p>
                            )}
                        </div>

                        <div className={`glass-panel ${styles.uploadZone}`} onClick={() => targetInputRef.current?.click()}>
                            <input type="file" ref={targetInputRef} className={styles.hiddenInput} onChange={(e) => handleFileUpload(e, 'target')} accept=".xlsx, .xls, .csv" />
                            <Target size={32} className="gradient-text" style={{marginBottom: 16}} />
                            <h3 style={{fontSize: '1.2rem'}}>3. Targeted Report</h3>
                            {targetFile ? (
                                <div className={styles.fileSelected}>
                                    <FileType size={16} /> <span style={{fontSize: '0.8rem'}}>{targetFile.name.substring(0,20)}..</span>
                                    <button className={styles.removeFile} onClick={(e) => { e.stopPropagation(); setTargetFile(null); }}><X size={14} /></button>
                                </div>
                            ) : (
                                <p style={{fontSize: '0.8rem'}}>Upload Targeting File</p>
                            )}
                        </div>
                    </div>

                    <div className={styles.actionRow}>
                        <button className={styles.analyzeBtn} onClick={processFiles} disabled={!bulkFile && !structureFile && !targetFile}>
                            Run Deep Intelligence Analysis <Zap size={18} />
                        </button>
                    </div>
                </div>
            )}

            {loading && (
                <div className={`glass-panel ${styles.loadingState}`}>
                    <Zap size={48} className={styles.pulseIcon} />
                    <h3>Extracting Real Data Rows...</h3>
                    <p>Fuzzy-scanning thousands of cells to calculate True Metrics.</p>
                </div>
            )}

            {analysis && (
                <div className="animate-fade-in">
                    <section className={`${styles.summaryGrid} ${styles.hideOnPrint}`}>
                        <div className={`glass-panel ${styles.summaryCard}`}>
                            <DollarSign size={20} color="var(--accent-primary)" />
                            <span className={styles.sumLabel}>Total Spend ({analysis.summary.sheetsParsed} Sheets Parsed)</span>
                            <h3 className={styles.sumValue}>₹{analysis.summary.totalSpend.toLocaleString(undefined, {maximumFractionDigits: 0})}</h3>
                        </div>
                        <div className={`glass-panel ${styles.summaryCard}`}>
                            <TrendingUp size={20} color="var(--success)" />
                            <span className={styles.sumLabel}>Total Sales</span>
                            <h3 className={styles.sumValue}>₹{analysis.summary.sales.toLocaleString(undefined, {maximumFractionDigits: 0})}</h3>
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

                    <div className={`${styles.deepMetricsGrid} ${styles.hideOnPrint}`}>
                        <div className={`glass-panel ${styles.breakdownPanel}`}>
                            <div className={styles.panelHeader}>
                                <h3><PieChart size={18} /> Parsed Match Type Topology</h3>
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
                                <h3><Crosshair size={18} /> Parsed Targeting Stratification</h3>
                            </div>
                            <div className={styles.metricsBoxGrid}>
                                <MetricBox label="KEYWORD TARGETING" spend={analysis.targeting.keyword.spend} sales={analysis.targeting.keyword.sales} cpc={analysis.targeting.keyword.cpc} />
                                <MetricBox label="PRODUCT TARGETING" spend={analysis.targeting.product.spend} sales={analysis.targeting.product.sales} cpc={analysis.targeting.product.cpc} />
                                <MetricBox label="AUDIENCE TARGETING" spend={analysis.targeting.audience.spend} sales={analysis.targeting.audience.sales} cpc={analysis.targeting.audience.cpc} />
                            </div>
                        </div>
                    </div>

                    {/* NEW: Agency Client Report Output */}
                    <div className={styles.agencyReportPanel}>
                        <div className={styles.reportHeader}>
                            <h3><Lightbulb size={24} className="gradient-text" /> Professional Agency Strategy Report</h3>
                            <button className={styles.printBtn} onClick={() => window.print()}>
                                <Printer size={16} /> Export to PDF
                            </button>
                        </div>
                        
                        <div className={styles.reportGrid}>
                            <div className={styles.reportCol}>
                                <h4><FileSearch size={18} /> Current Client Setup</h4>
                                <ul>
                                    {analysis.agencyReport.currentStructure.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className={styles.reportCol}>
                                <h4><Wrench size={18} /> Proposed Campaign Architecture</h4>
                                <ul>
                                    {analysis.agencyReport.proposedStructure.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className={styles.pitchSummary}>
                            <h4>⚡ Strategic Pitch Summary for Client</h4>
                            <p>{analysis.agencyReport.pitchSummary}</p>
                        </div>
                    </div>
                    
                    <button className={`${styles.resetBtn} ${styles.hideOnPrint}`} onClick={() => setAnalysis(null)} style={{marginTop: '32px'}}>
                        Upload New Files
                    </button>
                </div>
            )}
        </div>
    );
}
