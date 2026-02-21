"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  PenTool,
  Search,
  Globe,
  BarChart3,
  Zap,
  TrendingUp,
  ShieldCheck,
  Target
} from "lucide-react";
import styles from "./page.module.css";

const QUICK_STATS = [
  { label: "Active Listings", value: "124", icon: ShieldCheck, color: "#3b82f6" },
  { label: "Top Rank Keywords", value: "42", icon: TrendingUp, color: "#8b5cf6" },
  { label: "Avg. ACOS", value: "18.2%", icon: Zap, color: "#10b981" },
];

const MODULES = [
  {
    title: "AI Listing Builder",
    desc: "Create SEO-optimized listings in seconds using Amazon's A9 algorithm insights.",
    icon: PenTool,
    path: "/listing-builder"
  },
  {
    title: "Keyword Finder",
    desc: "Find high-volume keywords and analyze search trends for your niche.",
    icon: Search,
    path: "/keyword-finder"
  },
  {
    title: "Keyword Tracker",
    desc: "Track your ASIN's ranking across multiple pages for specific keywords.",
    icon: Target,
    path: "/keyword-tracker"
  },
  {
    title: "Product Intelligence",
    desc: "Bulk extract product data, pricing, and BSR history for market analysis.",
    icon: Globe,
    path: "/bulk-scraper"
  },
  {
    title: "Ads Optimizer",
    desc: "Analyze your Amazon Ads XLSX files and get 100% accurate bid and campaign suggestions.",
    icon: BarChart3,
    path: "/ads-optimizer"
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

export default function Home() {
  return (
    <div className={styles.container}>
      <motion.header
        className={styles.header}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className={styles.title}>Welcome back, <span className="gradient-text">Seller</span></h1>
        <p className={styles.subtitle}>Supercharge your marketplace performance with AI-driven insights.</p>
      </motion.header>

      <motion.section
        className={styles.statsGrid}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {QUICK_STATS.map((stat, i) => (
          <motion.div key={i} className={`glass-panel ${styles.statCard}`} variants={itemVariants}>
            <div className={styles.statIcon} style={{ background: `${stat.color}15`, color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className={styles.statLabel}>{stat.label}</p>
              <h3 className={styles.statValue}>{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </motion.section>

      <section className={styles.modulesSection}>
        <motion.h2
          className={styles.sectionTitle}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Powerful AI Tools
        </motion.h2>
        <motion.div
          className={styles.modulesGrid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {MODULES.map((module, i) => (
            <motion.div key={i} className={`glass-panel ${styles.moduleCard}`} variants={itemVariants}>
              <div className={styles.moduleHeader}>
                <div className={styles.moduleIcon}>
                  <module.icon size={24} className="gradient-text" />
                </div>
                <h3 className={styles.moduleTitle}>{module.title}</h3>
              </div>
              <p className={styles.moduleDesc}>{module.desc}</p>
              <Link href={module.path} className={styles.moduleButton}>
                Launch Tool
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
