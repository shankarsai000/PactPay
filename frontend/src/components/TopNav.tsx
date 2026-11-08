"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  ExternalLink,
  Cpu,
  Database,
  Globe,
  Search,
  Menu,
  X,
  Layers,
  Zap,
  ShieldAlert,
  Terminal,
} from "lucide-react";

interface TopNavProps {
  onOpenInfra: () => void;
  onOpenCommand: () => void;
  apiBase: string;
}

export function TopNav({ onOpenInfra, onOpenCommand, apiBase }: TopNavProps) {
  const [activeSection, setActiveSection] = useState<string>("scenarios");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll spy to highlight active section in navbar
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["scenarios", "trading-floor", "break-it", "telemetry-log"];
      const scrollPosition = window.scrollY + 120;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const topOffset = element.getBoundingClientRect().top + window.pageYOffset - 70;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
    }
  };

  const navLinks = [
    { id: "scenarios", label: "Scenarios", icon: Zap },
    { id: "trading-floor", label: "Trading Floor", icon: Layers },
    { id: "break-it", label: "Break-It Red-Team", icon: ShieldAlert },
    { id: "telemetry-log", label: "Telemetry", icon: Terminal },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#030712]/85 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 sm:px-6">
        {/* Left: Brand Logo & Segment Links */}
        <div className="flex items-center gap-6">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-indigo-600 shadow-[0_0_16px_rgba(56,189,248,0.4)]">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-white">PACTPAY</span>
              <span className="hidden rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[9px] font-bold text-sky-400 sm:inline-block">
                AP2 · Z3 FIREWALL
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links with Active Indicator */}
          <nav className="hidden md:flex items-center gap-1 rounded-xl border border-white/5 bg-white/[0.03] p-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  suppressHydrationWarning
                  type="button"
                  onClick={() => scrollToSection(link.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    isActive
                      ? "bg-sky-500/20 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.25)] border border-sky-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Center: Quick Command Palette Trigger (Linear Style) */}
        <div className="hidden lg:flex items-center">
          <button
            suppressHydrationWarning
            type="button"
            onClick={onOpenCommand}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-400 transition hover:border-sky-500/40 hover:bg-slate-900 hover:text-slate-200 hover:shadow-[0_0_14px_rgba(56,189,248,0.2)]"
          >
            <Search className="h-3.5 w-3.5 text-sky-400" />
            <span>Quick Actions & Search</span>
            <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.2 text-[10px] font-mono text-slate-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Architecture Modal & GitHub */}
        <div className="flex items-center gap-2.5">
          {/* Mobile Search Icon */}
          <button
            suppressHydrationWarning
            type="button"
            onClick={onOpenCommand}
            className="flex lg:hidden h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:border-sky-500/40"
            title="Open Command Palette (⌘K)"
          >
            <Search className="h-3.5 w-3.5 text-sky-400" />
          </button>

          {/* 4 Sponsor Credit Pools Launcher */}
          <button
            suppressHydrationWarning
            type="button"
            onClick={onOpenInfra}
            className="flex items-center gap-1.5 rounded-lg border border-sky-500/40 bg-gradient-to-r from-sky-500/20 to-indigo-500/20 px-3 py-1.5 text-xs font-semibold text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.2)] transition hover:border-sky-400 hover:text-white hover:shadow-[0_0_18px_rgba(56,189,248,0.35)]"
          >
            <span className="hidden sm:inline">🏛️ 4 Sponsor Pools & Arch</span>
            <span className="sm:hidden">🏛️ Pools</span>
          </button>

          {/* GitHub Link */}
          <a
            href="https://github.com/shankarsai000/PactPay"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <span>GitHub</span>
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </a>

          {/* Mobile Hamburger Button */}
          <button
            suppressHydrationWarning
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#070a12]/95 px-4 py-3 backdrop-blur-2xl">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  suppressHydrationWarning
                  type="button"
                  onClick={() => scrollToSection(link.id)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-left transition ${
                    isActive
                      ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 text-sky-400" />
                  <span>{link.label}</span>
                </button>
              );
            })}
            <a
              href="https://github.com/shankarsai000/PactPay"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-slate-400 hover:bg-white/5 hover:text-white"
            >
              <span>GitHub Repository</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
