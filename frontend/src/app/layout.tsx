import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PactPay | Autonomous A2A Procurement & Z3 Spend Firewall",
  description: "Built for the PayPal AI Hackathon 2026 with PayPal Agent Toolkit, Channel3, KERNEL, Elastic, and AG Grid.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased bg-slate-950 text-slate-100" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
