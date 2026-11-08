"use client";

import { useState, useEffect, useRef } from "react";
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
  ChevronDown,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { ScenarioKey } from "./JudgeScenarioBar";

interface TopNavProps {
  onOpenInfra: () => void;
  onOpenCommand: () => void;
  onRunScenario?: (scenario: ScenarioKey) => void;
  apiBase: string;
}

export function TopNav({ onOpenInfra, onOpenCommand, onRunScenario, apiBase }: TopNavProps) {
  const [activeSection, setActiveSection] = useState<string>("scenarios");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false);
  const [scenarioDropdownOpen, setScenarioDropdownOpen] = useState(false);

  const viewMenuRef = useRef<HTMLDivElement>(null);
  const scenarioMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (viewMenuRef.current && !viewMenuRef.current.contains(event.target as Node)) {
        setViewDropdownOpen(false);
      }
      if (scenarioMenuRef.current && !scenarioMenuRef.current.contains(event.target as Node)) {
        setScenarioDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll spy to highlight active section in navbar
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["scenarios", "trading-floor", "break-it", "telemetry-log"];
      const scrollPosition = window.scrollY + 140;

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
    setViewDropdownOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const topOffset = element.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
    }
  };

  const navLinks = [
    { id: "scenarios", label: "Scenarios", subtitle: "1-Click Judge Benchmarks", icon: Zap },
    { id: "trading-floor", label: "Trading Floor", subtitle: "AP2 Multi-Agent Ledger", icon: Layers },
    { id: "break-it", label: "Break-It Red-Team", subtitle: "Live Adversarial Testing", icon: ShieldAlert },
    { id: "telemetry-log", label: "Telemetry Log", subtitle: "Streaming Z3 & ES|QL Proofs", icon: Terminal },
  ];

  const scenariosList: { key: ScenarioKey; label: string; badge: string; badgeColor: string; desc: string }[] = [
    {
      key: "SCENARIO_A_COMPLIANT_WIN",
      label: "Scenario A: Compliant Deal",
      badge: "10.02% SAVINGS",
      badgeColor: "#10b981",
      desc: "Z3 clears all 6 invariants, settles landed $4,271.33 with PayPal Sandbox order.",
    },
    {
      key: "SCENARIO_B_ADVERSARIAL_BLOCK",
      label: "Scenario B: Injection + $850 Freight",
      badge: "Z3 BLOCKED",
      badgeColor: "#f43f5e",
      desc: "Adversary injects policy override and hidden freight; Z3 halts payment.",
    },
    {
      key: "SCENARIO_C_BATNA_WALKAWAY",
      label: "Scenario C: Standing Order Watch",
      badge: "BATNA WALKAWAY",
      badgeColor: "#f59e0b",
      desc: "List price exceeds retail BATNA; registers Channel3 /v0 webhook standing order.",
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.1] bg-[#030712]/90 backdrop-blur-2xl transition-all shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
      <div className="mx-auto flex h-18 max-w-[1440px] items-center justify-between px-4 sm:px-8">
        {/* Left: Brand Logo & Navigation Dropdown */}
        <div className="flex items-center gap-6">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 via-indigo-500 to-indigo-700 shadow-[0_0_20px_rgba(56,189,248,0.45)] transition group-hover:scale-105">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">PACTPAY</span>
                <span className="hidden rounded-full border border-sky-400/40 bg-sky-500/15 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-sky-300 sm:inline-block shadow-[0_0_10px_rgba(56,189,248,0.2)]">
                  AP2 · Z3 FIREWALL
                </span>
              </div>
              <span className="text-[10px] text-slate-400 hidden sm:block font-mono">
                Autonomous B2B Spend Firewall
              </span>
            </div>
          </div>

          {/* Desktop Navigation: Prominent Dropdown + Large Tabs */}
          <nav className="hidden lg:flex items-center gap-2">
            {/* View Selector Dropdown */}
            <div className="relative" ref={viewMenuRef}>
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setViewDropdownOpen(!viewDropdownOpen)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition border ${
                  viewDropdownOpen
                    ? "bg-sky-500/20 text-sky-200 border-sky-500/50 shadow-[0_0_18px_rgba(56,189,248,0.3)]"
                    : "bg-slate-900/80 text-slate-200 border-white/10 hover:border-white/20 hover:bg-slate-800"
                }`}
              >
                <Layers className="h-4 w-4 text-sky-400" />
                <span>Navigate Views</span>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${viewDropdownOpen ? "rotate-180 text-sky-400" : ""}`} />
              </button>

              {/* Views Dropdown Menu */}
              {viewDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 rounded-2xl border border-white/12 bg-[#0b0f17] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(56,189,248,0.15)] backdrop-blur-2xl z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Trading Console Views
                  </div>
                  <div className="flex flex-col gap-1 mt-1">
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      const isActive = activeSection === link.id;
                      return (
                        <button
                          key={link.id}
                          suppressHydrationWarning
                          type="button"
                          onClick={() => scrollToSection(link.id)}
                          className={`flex items-start gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                            isActive
                              ? "bg-sky-500/20 border border-sky-500/40 text-white"
                              : "text-slate-300 hover:bg-white/5 border border-transparent"
                          }`}
                        >
                          <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${isActive ? "bg-sky-500/30 text-sky-300" : "bg-white/5 text-slate-400"}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-100">{link.label}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{link.subtitle}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Scenarios Direct Dropdown */}
            {onRunScenario && (
              <div className="relative" ref={scenarioMenuRef}>
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => setScenarioDropdownOpen(!scenarioDropdownOpen)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition border ${
                    scenarioDropdownOpen
                      ? "bg-amber-500/20 text-amber-200 border-amber-500/50 shadow-[0_0_18px_rgba(245,158,11,0.3)]"
                      : "bg-slate-900/80 text-slate-200 border-white/10 hover:border-white/20 hover:bg-slate-800"
                  }`}
                >
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span>Run Scenarios</span>
                  <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${scenarioDropdownOpen ? "rotate-180 text-amber-400" : ""}`} />
                </button>

                {/* Scenarios Dropdown Menu */}
                {scenarioDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-80 rounded-2xl border border-white/12 bg-[#0b0f17] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.15)] backdrop-blur-2xl z-50">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      1-Click Judge Benchmarks
                    </div>
                    <div className="flex flex-col gap-1 mt-1">
                      {scenariosList.map((sc) => (
                        <button
                          key={sc.key}
                          suppressHydrationWarning
                          type="button"
                          onClick={() => {
                            setScenarioDropdownOpen(false);
                            onRunScenario(sc.key);
                            scrollToSection("trading-floor");
                          }}
                          className="flex flex-col rounded-xl px-3 py-2.5 text-left transition hover:bg-white/5 border border-transparent hover:border-white/10"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-100">{sc.label}</span>
                            <span
                              className="rounded-full px-2 py-0.5 text-[9px] font-extrabold"
                              style={{
                                background: `${sc.badgeColor}20`,
                                color: sc.badgeColor,
                                border: `1px solid ${sc.badgeColor}40`,
                              }}
                            >
                              {sc.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-snug">{sc.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Direct Prominent Shortcut: Break-It Box */}
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => scrollToSection("break-it")}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition border ${
                activeSection === "break-it"
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_16px_rgba(244,63,94,0.3)]"
                  : "text-slate-300 border-transparent hover:bg-white/5 hover:text-white"
              }`}
            >
              <ShieldAlert className="h-4 w-4 text-rose-400" />
              <span>Break-It Red-Team</span>
            </button>
          </nav>
        </div>

        {/* Center/Right: Larger Command Search Bar */}
        <div className="hidden md:flex items-center mx-4">
          <button
            suppressHydrationWarning
            type="button"
            onClick={onOpenCommand}
            className="flex items-center justify-between w-64 lg:w-72 h-10 rounded-xl border border-white/12 bg-slate-900/80 px-3.5 text-sm text-slate-300 transition hover:border-sky-500/50 hover:bg-slate-900 hover:text-white hover:shadow-[0_0_18px_rgba(56,189,248,0.25)]"
          >
            <div className="flex items-center gap-2.5">
              <Search className="h-4 w-4 text-sky-400" />
              <span className="text-slate-400 text-xs font-medium">Quick search or run...</span>
            </div>
            <kbd className="rounded-md border border-white/15 bg-white/10 px-2 py-0.5 text-[11px] font-mono font-semibold text-slate-300 shadow-sm">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Mobile Search Button */}
          <button
            suppressHydrationWarning
            type="button"
            onClick={onOpenCommand}
            className="flex md:hidden h-10 w-10 items-center justify-center rounded-xl border border-white/12 bg-slate-900/80 text-slate-200 hover:border-sky-500/40"
            title="Open Command Palette (⌘K)"
          >
            <Search className="h-4 w-4 text-sky-400" />
          </button>

          {/* 4 Sponsor Credit Pools Launcher - Prominent & Generously Sized */}
          <button
            suppressHydrationWarning
            type="button"
            onClick={onOpenInfra}
            className="flex items-center gap-2 h-10 rounded-xl border border-sky-400/50 bg-gradient-to-r from-sky-500/25 via-blue-600/25 to-indigo-600/25 px-4 text-sm font-bold text-sky-200 shadow-[0_0_18px_rgba(56,189,248,0.25)] transition hover:border-sky-400 hover:bg-sky-500/35 hover:text-white hover:shadow-[0_0_25px_rgba(56,189,248,0.4)]"
          >
            <span className="text-base">🏛️</span>
            <span className="hidden sm:inline">4 Sponsor Pools & Arch</span>
            <span className="sm:hidden">Pools</span>
          </button>

          {/* GitHub Repository */}
          <a
            href="https://github.com/shankarsai000/PactPay"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 h-10 rounded-xl border border-white/12 bg-white/5 px-3.5 text-xs font-bold text-slate-300 transition hover:border-white/25 hover:bg-white/10 hover:text-white"
          >
            <span>GitHub</span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
          </a>

          {/* Mobile Menu Toggle */}
          <button
            suppressHydrationWarning
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex lg:hidden h-10 w-10 items-center justify-center rounded-xl border border-white/12 bg-white/5 text-slate-200"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#070a12]/98 px-5 py-4 backdrop-blur-2xl">
          <div className="flex flex-col gap-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">
              Views & Tools
            </div>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  suppressHydrationWarning
                  type="button"
                  onClick={() => scrollToSection(link.id)}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-bold text-left transition ${
                    isActive
                      ? "bg-sky-500/20 text-sky-200 border border-sky-500/40"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4 text-sky-400" />
                  <div>
                    <div>{link.label}</div>
                    <div className="text-xs text-slate-400 font-normal">{link.subtitle}</div>
                  </div>
                </button>
              );
            })}

            {onRunScenario && (
              <>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono mt-2 mb-1">
                  Run Scenarios
                </div>
                {scenariosList.map((sc) => (
                  <button
                    key={sc.key}
                    suppressHydrationWarning
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onRunScenario(sc.key);
                      scrollToSection("trading-floor");
                    }}
                    className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs font-bold text-slate-300 hover:bg-white/5"
                  >
                    <span>{sc.label}</span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[9px]"
                      style={{ background: `${sc.badgeColor}25`, color: sc.badgeColor }}
                    >
                      {sc.badge}
                    </span>
                  </button>
                ))}
              </>
            )}

            <a
              href="https://github.com/shankarsai000/PactPay"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-semibold text-slate-400 hover:bg-white/5 hover:text-white mt-1 border-t border-white/10"
            >
              <span>GitHub Repository</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
