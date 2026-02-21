"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BarChart3,
    Search,
    Globe,
    PenTool,
    Settings,
    HelpCircle,
    LayoutDashboard,
    Target
} from "lucide-react";
import styles from "./Sidebar.module.css";

const NAV_ITEMS = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Listing Builder", icon: PenTool, path: "/listing-builder" },
    { name: "Keyword Finder", icon: Search, path: "/keyword-finder" },
    { name: "Keyword Tracker", icon: Target, path: "/keyword-tracker" },
    { name: "Product Intelligence", icon: Globe, path: "/bulk-scraper" },
    { name: "Ads Optimizer", icon: BarChart3, path: "/ads-optimizer" },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className={styles.sidebar}>
            <div className={styles.brand}>
                <div className={styles.logo}>
                    <div className={styles.logoIcon} />
                </div>
                <span className="brand-font">SellerPilot <span className="gradient-text">AI</span></span>
            </div>

            <nav className={styles.nav}>
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`${styles.navItem} ${isActive ? styles.active : ""}`}
                        >
                            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className={styles.footer}>
                <button className={styles.footerItem}>
                    <HelpCircle size={20} />
                    <span>Support</span>
                </button>
                <button className={styles.footerItem}>
                    <Settings size={20} />
                    <span>Settings</span>
                </button>
            </div>
        </aside>
    );
}
