import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "SellerPilot AI | Advanced Marketplace Intelligence",
  description: "Powerful AI tools for Amazon and marketplace sellers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex' }}>
          <Sidebar />
          <main style={{
            marginLeft: 'var(--sidebar-width)',
            width: 'calc(100% - var(--sidebar-width))',
            height: '100vh',
            overflowY: 'auto'
          }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
