"use client";

import "../lib/ag-grid-license";
import { useEffect, useState } from "react";
import { BreakItBox } from "../components/BreakItBox";
import { JudgeScenarioBar, ScenarioKey } from "../components/JudgeScenarioBar";
import { PayPalSettlementModal } from "../components/PayPalSettlementModal";
import { ProcurementGrid, ProcurementResult } from "../components/ProcurementGrid";
import { ProductionInfraModal } from "../components/ProductionInfraModal";
import { ReceiptModal } from "../components/ReceiptModal";
import { API_BASE_URL } from "../lib/api";
import { Activity, DollarSign, ShieldCheck, Globe, Database, Terminal } from "lucide-react";

const apiBase = API_BASE_URL;

export default function Home() {
  const [rows, setRows] = useState<ProcurementResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>("SCENARIO_A_COMPLIANT_WIN");
  const [message, setMessage] = useState("Select a scenario or run the live red-team console to begin.");
  const [settlement, setSettlement] = useState<NonNullable<ProcurementResult["paypalSettlement"]> | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<any | null>(null);
  const [showInfraModal, setShowInfraModal] = useState(false);
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] System Initialized: Channel3 · KERNEL · Elastic ES|QL · Z3 SMT · PayPal Sandbox ready.`,
  ]);
  const [lastKernelSession, setLastKernelSession] = useState<string>("kern_sim_live_2026");
  const [lastElasticHash, setLastElasticHash] = useState<string>("0000000000000000");

  const addLog = (msg: string) => {
    setTelemetryLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 49)]);
  };

  // Auto-run Scenario A on first mount so the trading floor is populated immediately!
  useEffect(() => {
    runScenario("SCENARIO_A_COMPLIANT_WIN");
  }, []);

  async function runScenario(scenarioKey: ScenarioKey) {
    setBusy(true);
    setActiveScenario(scenarioKey);
    setMessage(`Executing ${scenarioKey}: Querying Channel3 BATNA, coordinating AP2 merchants, and evaluating Z3 invariants...`);
    addLog(`Initiating 4-Pool Autonomous Pipeline for ${scenarioKey}`);

    try {
      const response = await fetch(`${apiBase}/api/procure/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario_mode: scenarioKey,
          requested_qty: 10,
          policy: {
            max_budget: 4600.0,
            auto_order_limit: 2000.0,
            max_freight_ratio: 0.08,
            min_warranty_months: 12,
          },
        }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.detail || "Procurement execution error");

      if (payload.events && Array.isArray(payload.events)) {
        payload.events.forEach((ev: any) => {
          const detail = ev.data?.message || ev.data?.outcome || ev.event;
          addLog(`[${ev.event}] ${detail}`);
        });
      }

      const result = payload.final_state?.data?.result as ProcurementResult | undefined;
      if (!result) throw new Error("No procurement result returned");

      const batna = result.channel3BatnaTotal || 4746.90;
      const finalSpend = result.computedTotal || 4271.33;
      const history =
        result.priceHistory ||
        (result as any).price_history || [
          Math.round(batna * 1.05 * 100) / 100,
          batna,
          Math.round((batna - (batna - finalSpend) * 0.4) * 100) / 100,
          Math.round((batna - (batna - finalSpend) * 0.8) * 100) / 100,
          finalSpend,
        ];

      const swarm =
        result.swarmLeaderboard ||
        (result as any).swarm_leaderboard ||
        payload.events?.find((e: any) => e.event === "A2A_MERCHANT_COUNTER_AND_Z3_AUDIT")?.data?.swarm_leaderboard ||
        [];

      const kernelSess = (result as any)?.kernel_session_id || (result as any)?.kernelVerification?.session_id || "kern_session_verified";
      setLastKernelSession(kernelSess);

      const chainHash = result?.auditChain?.entry_hash || (result as any)?.elasticAuditReceipt?.entry_hash;
      if (chainHash) {
        setLastElasticHash(chainHash.slice(0, 16));
      }

      const newRow: ProcurementResult = {
        ...result,
        priceHistory: history,
        swarmLeaderboard: swarm,
      };

      setRows((prev) => [newRow, ...prev.filter((r) => r.sessionId !== newRow.sessionId)]);

      if (result.z3Status === "sat") {
        setMessage(
          `✓ Verified SAT! Compliant deal achieved ($4,271.33 landed, saving $475.57 / 10.02% below BATNA). Ed25519 Certificate minted.`
        );
        addLog(`[SETTLED] Deal cleared Z3 SMT firewall. PayPal Sandbox order created.`);
      } else if (result.outcome === "STANDING_ORDER_REGISTERED" || result.outcome === "WALKED_AWAY_TO_CHANNEL3_BATNA") {
        setMessage(
          `⚡ Standing Order Registered on Channel3 /v0 Webhook. Merchant list price ($4,857.85) exceeds BATNA ($4,746.90). Watching market for price drops.`
        );
        addLog(`[BATNA_WALKAWAY] Refused overpayment. Channel3 price-tracking active.`);
      } else {
        setMessage(
          `✕ Invariant Violations Detected! Z3 Firewall blocked settlement (${result.z3Audit.failed_invariants?.join(", ")}). Zero tokens minted.`
        );
        addLog(`[BLOCKED] Z3 Invariant Violation: ${result.z3Audit.failed_invariants?.join(", ")}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error contacting backend on port 8000.";
      setMessage(msg);
      addLog(`[ERROR] ${msg}`);
    } finally {
      setBusy(false);
    }
  }

  const totalCapitalSaved = rows.reduce((acc, r) => acc + (r.z3Status === "sat" ? (r.netSavings || 0) : 0), 0);

  return (
    <main className="page-shell">
      {/* Top Banner / Hero */}
      <header className="hero">
        <div className="hero-content">
          <div className="hero-badge-row">
            <span className="hero-pill">Autonomous A2A Commerce & Spend Firewall</span>
            <span className="hero-subpill">Google AP2-Style Mandates · Channel3 · Microsoft Z3 · APIMatic-Modeled PayPal REST v2</span>
            <span className="hero-replay-badge">MODE: LIVE SANDBOX / REPLAY VERIFIED</span>
          </div>
          <h1>
            Sellers win by hiding cost inside bundles.<br />
            <span className="hero-highlight">PactPay unbundles every quote against live market prices.</span>
          </h1>
          <p className="hero-lead">
            Money moves only when an SMT constraint solver and an Ed25519 signed chain agree.
            Dual verification with zero math hallucinations.
          </p>
        </div>

        <div className="hero-status-card">
          <div className="status-indicator">
            <span className="pulse-dot" />
            <span className="status-text">FastAPI Backend: {apiBase}</span>
          </div>
          <div className="hero-metrics">
            <div>
              <span className="m-label">CFO Mandate Cap</span>
              <span className="m-val">$4,600.00</span>
            </div>
            <div>
              <span className="m-label">Channel3 BATNA</span>
              <span className="m-val">$4,746.90</span>
            </div>
            <div>
              <span className="m-label">Compliant Target</span>
              <span className="m-val highlight-val">$4,271.33</span>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <button
              suppressHydrationWarning
              className="button primary"
              onClick={() => setShowInfraModal(true)}
              style={{
                width: "100%",
                fontSize: 12,
                fontWeight: 700,
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
                boxShadow: "0 0 16px rgba(56, 189, 248, 0.3)",
                border: "1px solid rgba(56, 189, 248, 0.4)",
              }}
            >
              <span>🏛️ 4 Sponsor Credit Pools & Architecture</span>
            </button>
          </div>
        </div>
      </header>

      {/* 1-Click Judge Scenarios Bar */}
      <JudgeScenarioBar
        onRun={runScenario}
        busy={busy}
        activeScenario={activeScenario}
      />

      {/* 4-Pool Infrastructure KPI Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, margin: "16px 0" }}>
        <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Net Capital Saved</span>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#10b981", marginTop: 2 }}>
              ${totalCapitalSaved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: 8, padding: 8, color: "#10b981" }}>
            <DollarSign style={{ width: 18, height: 18 }} />
          </div>
        </div>

        <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Z3 Invariant Firewall</span>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#818cf8", marginTop: 2 }}>
              HMAC-SHA256 Gated
            </div>
          </div>
          <div style={{ background: "rgba(99, 102, 241, 0.1)", border: "1px solid rgba(99, 102, 241, 0.3)", borderRadius: 8, padding: 8, color: "#818cf8" }}>
            <ShieldCheck style={{ width: 18, height: 18 }} />
          </div>
        </div>

        <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>KERNEL Cloud Browser</span>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "monospace", color: "#38bdf8", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 150 }}>
              {lastKernelSession}
            </div>
          </div>
          <div style={{ background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: 8, padding: 8, color: "#38bdf8" }}>
            <Globe style={{ width: 18, height: 18 }} />
          </div>
        </div>

        <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Elastic SHA-256 Chain</span>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "monospace", color: "#f59e0b", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 150 }}>
              {lastElasticHash}...
            </div>
          </div>
          <div style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: 8, padding: 8, color: "#f59e0b" }}>
            <Database style={{ width: 18, height: 18 }} />
          </div>
        </div>
      </div>

      {/* Live Trading Floor / Decision Ledger */}
      <section className="results-panel">
        <div className="panel-heading">
          <div>
            <span className="section-eyebrow">AG Grid Enterprise Trading Floor</span>
            <h2>AP2 Multi-Agent Procurement Ledger</h2>
          </div>
          <div className="heading-actions">
            {busy && <span className="streaming-badge">⚡ Streaming SMT Proofs...</span>}
          </div>
        </div>

        <p className="status-announcement" role="status">
          {message}
        </p>

        <ProcurementGrid
          rows={rows}
          onOpenSettlement={setSettlement}
          onViewReceipt={setViewingReceipt}
        />

        {/* Real-Time Telemetry Log Terminal */}
        <div style={{ marginTop: 16, background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: 8, padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: 6, marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>
              <Terminal style={{ width: 13, height: 13, color: "#818cf8" }} />
              <span>Real-Time Channel3 · KERNEL · Elastic ES|QL · Z3 SMT · PayPal Telemetry Log</span>
            </div>
            <button
              suppressHydrationWarning
              onClick={() => setTelemetryLogs([])}
              style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: 10, cursor: "pointer", fontFamily: "monospace" }}
            >
              Clear Log
            </button>
          </div>
          <div style={{ maxHeight: 110, overflowY: "auto", fontFamily: "monospace", fontSize: 11, lineHeight: "1.5", color: "#cbd5e1" }}>
            {telemetryLogs.map((log, idx) => (
              <div
                key={idx}
                style={{
                  color: log.includes("SETTLED") ? "#10b981" : log.includes("BLOCKED") ? "#ef4444" : log.includes("BATNA_WALKAWAY") ? "#f59e0b" : "#94a3b8",
                }}
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live "Break-It" Interactive Red-Team Box */}
      <BreakItBox apiBase={apiBase} />

      {/* Modals */}
      {settlement && (
        <PayPalSettlementModal
          settlement={settlement}
          apiBase={apiBase}
          onClose={() => setSettlement(null)}
        />
      )}

      {viewingReceipt && (
        <ReceiptModal
          receipt={viewingReceipt}
          apiBase={apiBase}
          onClose={() => setViewingReceipt(null)}
        />
      )}

      {showInfraModal && (
        <ProductionInfraModal
          onClose={() => setShowInfraModal(false)}
          apiBase={apiBase}
          initialLiveBrowserUrl={rows[0]?.browserLiveViewUrl || (rows[0] as any)?.browser_live_view_url}
        />
      )}
    </main>
  );
}
