"use client";

import { Shield, ExternalLink, Terminal, Cpu, Database, Globe } from "lucide-react";

interface TopNavProps {
  onOpenInfra: () => void;
  apiBase: string;
}

export function TopNav({ onOpenInfra, apiBase }: TopNavProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#030712]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-indigo-600 shadow-[0_0_16px_rgba(56,189,248,0.4)]">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-black tracking-tight text-white">PACTPAY</span>
            <span className="hidden rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-400 sm:inline-block">
              AP2 · Z3 FIREWALL
            </span>
          </div>
        </div>

        {/* Live Telemetry Heartbeat Ticker */}
        <div className="hidden items-center gap-4 lg:flex">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse" />
            <span className="text-slate-300 font-semibold">PayPal REST v2</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <Cpu className="h-3.5 w-3.5 text-indigo-400" />
            <span>Microsoft Z3 SMT</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <Globe className="h-3.5 w-3.5 text-sky-400" />
            <span>KERNEL Browser</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <span className="text-amber-400 font-semibold">Channel3</span>
            <span>BATNA Locked</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <Database className="h-3.5 w-3.5 text-emerald-400" />
            <span>Elastic ES|QL</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            suppressHydrationWarning
            type="button"
            onClick={onOpenInfra}
            className="flex items-center gap-1.5 rounded-lg border border-sky-500/40 bg-gradient-to-r from-sky-500/20 to-indigo-500/20 px-3 py-1.5 text-xs font-semibold text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.2)] transition hover:border-sky-400 hover:text-white hover:shadow-[0_0_18px_rgba(56,189,248,0.35)]"
          >
            <span>🏛️ 4 Sponsor Pools & Arch</span>
          </button>
          <a
            href="https://github.com/shankarsai000/PactPay"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <span>GitHub</span>
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </a>
        </div>
      </div>
    </header>
  );
}

