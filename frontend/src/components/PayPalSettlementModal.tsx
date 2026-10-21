"use client";

import { useState } from "react";
import { API_BASE_URL } from "../lib/api";

interface Settlement {
  order_id: string;
  invoice_id: string;
  amount: number;
  currency: string;
  mode: "paypal_sandbox" | "local_demo";
  approval_url?: string | null;
  tracking_number?: string | null;
  browser_live_view_url?: string | null;
}

interface Props {
  settlement: Settlement;
  apiBase?: string;
  onClose: () => void;
}

export function PayPalSettlementModal({ settlement, apiBase = API_BASE_URL, onClose }: Props) {
  const [status, setStatus] = useState<string>("");
  const [trackingNumber, setTrackingNumber] = useState<string | null>(settlement.tracking_number || null);
  const [busy, setBusy] = useState(false);
  const isSandbox = settlement.mode === "paypal_sandbox";

  async function capture() {
    setBusy(true);
    setStatus("");
    try {
      const response = await fetch(`${apiBase}/api/paypal/capture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: settlement.order_id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Settlement could not be captured");

      setStatus("Payment successfully captured and authorized on PayPal REST v2.");
      if (data.tracking_number) {
        setTrackingNumber(data.tracking_number);
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Settlement could not be completed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal settlement-modal" role="dialog" aria-modal="true" aria-labelledby="settlement-title">
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>

        <div className="modal-top">
          <span className="live-badge paypal-badge">
            {isSandbox ? "PAYPAL SANDBOX REST v2" : "SANDBOX SIMULATION RAIL"}
          </span>
          <h2 id="settlement-title">Execute Settlement via PayPal Gate</h2>
          <p className="modal-sub">
            Formally cleared by Z3 SMT solver and signed with Ed25519.
          </p>
        </div>

        <div className="settlement-summary-cards">
          <div className="summary-stat">
            <span className="stat-label">Order ID</span>
            <code className="stat-val">{settlement.order_id}</code>
          </div>
          <div className="summary-stat">
            <span className="stat-label">Invoice Number</span>
            <code className="stat-val">{settlement.invoice_id}</code>
          </div>
          <div className="summary-stat">
            <span className="stat-label">Landed Settlement Amount</span>
            <span className="stat-val amount-highlight">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: settlement.currency }).format(settlement.amount)}
            </span>
          </div>
        </div>

        <div className="approval-action-box">
          <p className="step-desc">
            <strong>Step 1: Real Buyer Approval</strong><br />
            {isSandbox
              ? "Open the official PayPal Sandbox checkout portal to authenticate and authorize this corporate spend."
              : "Launch sandbox checkout link to authenticate as the enterprise procurement buyer."}
          </p>

          {settlement.approval_url && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              <a
                className="button paypal-auth-btn"
                href={settlement.approval_url}
                target="_blank"
                rel="noreferrer"
              >
                🔐 Open PayPal Sandbox Approval Link ↗
              </a>
              {settlement.browser_live_view_url && (
                <a
                  className="button ghost"
                  href={settlement.browser_live_view_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ borderColor: "#a855f7", color: "#c084fc" }}
                >
                  🖥️ KERNEL Live Cloud Browser Stream ↗
                </a>
              )}
            </div>
          )}
        </div>

        <div className="capture-action-box">
          <p className="step-desc">
            <strong>Step 2: Capture Authorized Order & Dispatch Tracking</strong><br />
            Once approved by the buyer, the private executor captures the funds and registers fulfillment tracking.
          </p>

          {trackingNumber && (
            <div className="tracking-success-box">
              <span className="tracking-icon">📦</span>
              <div>
                <strong>Shipment Tracking Registered:</strong>
                <code className="tracking-code">{trackingNumber} (FedEx Express)</code>
              </div>
            </div>
          )}

          {status && <p className="capture-status">{status}</p>}

          <div className="modal-actions">
            <button className="button ghost" onClick={onClose}>Done / Close</button>
            <button
              className="button capture-btn"
              onClick={capture}
              disabled={busy || Boolean(trackingNumber)}
            >
              {busy ? "Capturing on PayPal..." : trackingNumber ? "✓ Order Captured & Dispatched" : "Capture Authorized Order"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
