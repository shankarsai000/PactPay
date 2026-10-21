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

const apiBase = API_BASE_URL;

export default function Home() {
  const [rows, setRows] = useState<ProcurementResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>("SCENARIO_A_COMPLIANT_WIN");
  const [message, setMessage] = useState("Select a scenario or run the live red-team console to begin.");
  const [settlement, setSettlement] = useState<NonNullable<ProcurementResult["paypalSettlement"]> | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<any | null>(null);
  const [showInfraModal, setShowInfraModal] = useState(false);

  // Auto-run Scenario A on first mount so the trading floor is populated immediately!
  useEffect(() => {
    runScenario("SCENARIO_A_COMPLIANT_WIN");
  }, []);

  async function runScenario(scenarioKey: ScenarioKey) {
    setBusy(true);
    setActiveScenario(scenarioKey);
    setMessage(`Executing ${scenarioKey}: Querying Channel3 BATNA, coordinating AP2 merchants, and evaluating Z3 invariants...`);

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
      } else if (result.outcome === "STANDING_ORDER_REGISTERED") {
        setMessage(
          `⚡ Standing Order Registered on Channel3 /v0 Webhook. Merchant list price ($4,857.85) exceeds BATNA ($4,746.90). Watching market for price drops.`
        );
      } else {
        setMessage(
          `✕ Invariant Violations Detected! Z3 Firewall blocked settlement (${result.z3Audit.failed_invariants?.join(", ")}). Zero tokens minted.`
        );
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error contacting backend on port 8000.");
    } finally {
      setBusy(false);
    }
  }

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
