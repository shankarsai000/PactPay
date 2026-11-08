"use client";

import { useEffect, useState, useRef } from "react";
import {
  Search,
  Zap,
  ShieldAlert,
  Layers,
  Terminal,
  ExternalLink,
  Cpu,
  ArrowRight,
  X,
} from "lucide-react";
import { ScenarioKey } from "./JudgeScenarioBar";

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onRunScenario: (scenario: ScenarioKey) => void;
  onOpenInfra: () => void;
  onJumpToSection: (sectionId: string) => void;
}

interface CommandItem {
  id: string;
  category: "Scenarios" | "Adversarial Attacks" | "Navigation" | "Architecture";
  title: string;
  subtitle: string;
  icon: any;
  action: () => void;
  badge?: string;
  badgeColor?: string;
}

export function CommandMenu({
  isOpen,
  onClose,
  onRunScenario,
  onOpenInfra,
  onJumpToSection,
}: CommandMenuProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or window listener
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const commands: CommandItem[] = [
    {
      id: "scen-a",
      category: "Scenarios",
      title: "Run Scenario A: Compliant Deal",
      subtitle: "Z3 verifies 6 invariants SAT, settles landed $4,271.33 with 10.02% net savings",
      icon: Zap,
      badge: "10.02% SAVINGS",
      badgeColor: "#10b981",
      action: () => {
        onRunScenario("SCENARIO_A_COMPLIANT_WIN");
        onJumpToSection("trading-floor");
        onClose();
      },
    },
    {
      id: "scen-b",
      category: "Scenarios",
      title: "Run Scenario B: Adversarial Injection + $850 Freight",
      subtitle: "Adversary injects policy override and hidden freight surcharge; Z3 blocks 3 invariants",
      icon: ShieldAlert,
      badge: "Z3 BLOCKED",
      badgeColor: "#f43f5e",
      action: () => {
        onRunScenario("SCENARIO_B_ADVERSARIAL_BLOCK");
        onJumpToSection("trading-floor");
        onClose();
      },
    },
    {
      id: "scen-c",
      category: "Scenarios",
      title: "Run Scenario C: Standing Order Watch (BATNA Walkaway)",
      subtitle: "Merchant overprices quote; registers Channel3 /v0 webhook standing order",
      icon: Zap,
      badge: "CHANNEL3 STANDING",
      badgeColor: "#f59e0b",
      action: () => {
        onRunScenario("SCENARIO_C_BATNA_WALKAWAY");
        onJumpToSection("trading-floor");
        onClose();
      },
    },
    {
      id: "nav-floor",
      category: "Navigation",
      title: "Jump to AG Grid Trading Floor",
      subtitle: "AP2 multi-agent ledger, landed cost breakdowns, and live Ed25519 proof receipts",
      icon: Layers,
      action: () => {
        onJumpToSection("trading-floor");
        onClose();
      },
    },
    {
      id: "nav-break-it",
      category: "Navigation",
      title: "Jump to Live 'Break-It' Red-Team Box",
      subtitle: "Interactive adversarial testing console with prompt injection and cross-subsidy sliders",
      icon: ShieldAlert,
      action: () => {
        onJumpToSection("break-it");
        onClose();
      },
    },
    {
      id: "nav-telemetry",
      category: "Navigation",
      title: "Jump to Real-Time Telemetry Terminal",
      subtitle: "Streaming Channel3, KERNEL, Elastic ES|QL, and Z3 SMT event log",
      icon: Terminal,
      action: () => {
        onJumpToSection("telemetry-log");
        onClose();
      },
    },
    {
      id: "infra-modal",
      category: "Architecture",
      title: "View 4 Sponsor Credit Pools & Architecture",
      subtitle: "Channel3 ($21k pool), KERNEL ($55 pool), Elastic (44-day trial), PayPal Sandbox REST v2",
      icon: Cpu,
      badge: "SPONSORS",
      badgeColor: "#38bdf8",
      action: () => {
        onOpenInfra();
        onClose();
      },
    },
  ];

  const filtered = commands.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDownInput = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      filtered[selectedIndex].action();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/75 backdrop-blur-md"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f17] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_30px_rgba(56,189,248,0.15)]"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5 bg-slate-900/40">
          <Search className="h-4 w-4 text-sky-400" />
          <input
            ref={inputRef}
            suppressHydrationWarning
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownInput}
            placeholder="Type a command, scenario, or jump to section (e.g. 'Scenario A', 'Break-It', 'Ledger')..."
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block rounded border border-white/15 bg-white/5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
            ESC
          </kbd>
          <button
            suppressHydrationWarning
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Command List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching commands found for "{query}".
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  suppressHydrationWarning
                  type="button"
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition ${
                    isSelected
                      ? "bg-sky-500/15 border border-sky-500/30 text-white"
                      : "text-slate-300 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        isSelected ? "bg-sky-500/20 text-sky-300" : "bg-white/5 text-slate-400"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold truncate">{item.title}</span>
                        {item.badge && (
                          <span
                            className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                            style={{
                              background: `${item.badgeColor}20`,
                              color: item.badgeColor,
                              border: `1px solid ${item.badgeColor}40`,
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    className={`h-3.5 w-3.5 shrink-0 transition ${
                      isSelected ? "text-sky-400 translate-x-0.5" : "text-transparent"
                    }`}
                  />
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 bg-slate-950/60 text-[10px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>Use ↑↓ to navigate</span>
            <span>↵ to select</span>
          </div>
          <span>PactPay AP2 Command Engine</span>
        </div>
      </div>
    </div>
  );
}

