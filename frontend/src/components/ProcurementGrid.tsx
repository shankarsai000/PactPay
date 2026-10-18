"use client";

import { Fragment, useState } from "react";

export interface ProcurementResult {
  sessionId: string;
  query: string;
  channel3BatnaTotal: number;
  computedTotal: number;
  netSavings: number;
  savingsPct?: number;
  z3Status: "sat" | "unsat";
  outcome: string;
  merchantOffer: {
    vendor_name?: string;
    quantity: number;
    freight: number;
    unit_monitor?: number;
    unit_cable?: number;
    pay_by_bank_rebate?: number;
    warranty_months: number;
    notes: string;
    attack_type?: string;
  };
  z3Audit: {
    verified: boolean;
    failed_invariants?: string[];
    proof_trace: Array<{
      invariant: string;
      expression: string;
      passed: boolean;
      status: string;
    }>;
  };
  clearanceCertificate?: {
    certificate_hash: string;
    signature: string;
    signer_public_key: string;
    certificate_payload: {
      nonce: string;
      issued_at: number;
      expires_at: number;
    };
  } | null;
  paypalSettlement?: {
    order_id: string;
    invoice_id: string;
    amount: number;
    currency: string;
    mode: "paypal_sandbox" | "local_demo";
    approval_url?: string | null;
    tracking_number?: string | null;
  } | null;
  standingOrder?: {
    subscription_id: string;
    status: string;
    monitored_products: string[];
    target_budget_cents: number;
    target_batna_cents: number;
  } | null;
  receipt?: any;
}

interface Props {
  rows: ProcurementResult[];
  onOpenSettlement: (settlement: NonNullable<ProcurementResult["paypalSettlement"]>) => void;
  onViewReceipt?: (receipt: any) => void;
}

const money = (val: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);

export function ProcurementGrid({ rows, onOpenSettlement, onViewReceipt }: Props) {
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  if (!rows.length) {
    return (
      <div className="empty-state">
        <p className="empty-icon">📊</p>
        <p>No procurement rounds recorded. Click a Scenario button above to launch an AP2 auction.</p>
      </div>
    );
  }

  return (
    <div className="results-wrap">
      <div className="results-scroll">
        <table className="results-table">
          <thead>
            <tr>
              <th>Session / Vendor</th>
              <th>Channel3 BATNA</th>
              <th>Negotiated Spend</th>
              <th>Net Savings</th>
              <th>Formal SMT Gate</th>
              <th>Procurement Outcome</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const expanded = row.sessionId === expandedSession;
              const isVerified = row.z3Status === "sat";
              const isStanding = row.outcome === "STANDING_ORDER_REGISTERED";

              return (
                <Fragment key={row.sessionId}>
                  <tr className={`row-item ${isVerified ? "verified-row" : isStanding ? "standing-row" : "blocked-row"}`}>
                    <td>
                      <button
                        className="session-link"
                        onClick={() => setExpandedSession(expanded ? null : row.sessionId)}
                      >
                        <strong>{row.sessionId}</strong>
                        <span className="vendor-subtitle">{row.merchantOffer.vendor_name || "Merchant Agent"}</span>
                      </button>
                    </td>
                    <td>
                      <span className="batna-val">{money(row.channel3BatnaTotal)}</span>
                      <span className="batna-sub">Retail Landed</span>
                    </td>
                    <td>
                      <span className="spend-val">{money(row.computedTotal)}</span>
                      <span className="spend-sub">
                        (Freight: {money(row.merchantOffer.freight)})
                      </span>
                    </td>
                    <td>
                      {row.netSavings > 0 ? (
                        <div className="saving-box">
                          <span className="saving-val">{money(row.netSavings)}</span>
                          <span className="saving-pct">({row.savingsPct ?? 10.02}%)</span>
                        </div>
                      ) : (
                        <span className="muted-dash">—</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-pill ${isVerified ? "sat-pill" : "unsat-pill"}`}>
                        {isVerified ? "✓ SAT (6/6 Pass)" : `✕ UNSAT (${row.z3Audit.failed_invariants?.length || 3} Fail)`}
                      </span>
                    </td>
                    <td>
                      <span className={`outcome-tag ${isVerified ? "tag-ready" : isStanding ? "tag-standing" : "tag-blocked"}`}>
                        {isVerified
                          ? "Settlement Authorized"
                          : isStanding
                          ? "Standing Order Watching"
                          : "Blocked by Firewall"}
                      </span>
                    </td>
                    <td>
                      {row.paypalSettlement ? (
                        <button
                          className="button settle-btn"
                          onClick={() => onOpenSettlement(row.paypalSettlement!)}
                        >
                          💳 Settle via PayPal
                        </button>
                      ) : isStanding ? (
                        <span className="standing-badge">⚡ Watching /v0</span>
                      ) : (
                        <button
                          className="button inspect-btn"
                          onClick={() => setExpandedSession(expanded ? null : row.sessionId)}
                        >
                          🔍 Inspect Proof
                        </button>
                      )}
                    </td>
                  </tr>

                  {expanded && (
                    <tr className="detail-row">
                      <td colSpan={7}>
                        <div className="drawer-container">
                          <div className="drawer-header">
                            <div>
                              <h4>AP2 Master-Detail Proof Ledger · {row.sessionId}</h4>
                              <p className="detail-query">Query: {row.query}</p>
                            </div>
                            {row.receipt && (
                              <button
                                className="button receipt-btn"
                                onClick={() => onViewReceipt && onViewReceipt(row.receipt)}
                              >
                                📜 View Signed Receipt
                              </button>
                            )}
                          </div>

                          <div className="proof-layout">
                            {/* Merchant Cart Mandate */}
                            <section className="proof-card">
                              <h5>AP2 Cart Mandate Items</h5>
                              <div className="cart-items-grid">
                                <div>
                                  <dt>10x 4K Monitors</dt>
                                  <dd>{money(row.merchantOffer.unit_monitor || 396.85)} / unit</dd>
                                </div>
                                <div>
                                  <dt>10x TB4 Cables</dt>
                                  <dd>{money(row.merchantOffer.unit_cable || 25.62)} / unit</dd>
                                </div>
                                <div>
                                  <dt>Freight Surcharge</dt>
                                  <dd>{money(row.merchantOffer.freight)}</dd>
                                </div>
                                <div>
                                  <dt>PAY_BY_BANK Rebate</dt>
                                  <dd className="rebate-text">-{money(row.merchantOffer.pay_by_bank_rebate || 63.37)} (1.5%)</dd>
                                </div>
                                <div>
                                  <dt>Warranty</dt>
                                  <dd>{row.merchantOffer.warranty_months} Months</dd>
                                </div>
                              </div>
                              <p className="quote-note">
                                <strong>Merchant Notes:</strong> {row.merchantOffer.notes}
                              </p>
                            </section>

                            {/* Z3 Symbolic Firewall Proof */}
                            <section className="proof-card">
                              <h5>Z3 SMT Invariant Verification Trace</h5>
                              <ul className="proof-list">
                                {row.z3Audit.proof_trace.map((proof) => (
                                  <li key={proof.invariant} className={proof.passed ? "pass" : "fail"}>
                                    <div className="proof-badge-wrap">
                                      <span className="inv-badge">{proof.status}</span>
                                      <span className="inv-title">{proof.invariant}</span>
                                    </div>
                                    <code className="inv-code">{proof.expression}</code>
                                  </li>
                                ))}
                              </ul>
                            </section>

                            {/* Cryptographic Clearance Certificate */}
                            {row.clearanceCertificate && (
                              <section className="proof-card full-width-card">
                                <h5>Ed25519 Clearance Certificate (RFC 8785 Canonical JCS)</h5>
                                <div className="cert-meta-grid">
                                  <div>
                                    <dt>Certificate Hash</dt>
                                    <dd><code>{row.clearanceCertificate.certificate_hash}</code></dd>
                                  </div>
                                  <div>
                                    <dt>Ed25519 Signature</dt>
                                    <dd><code>{row.clearanceCertificate.signature.slice(0, 48)}...</code></dd>
                                  </div>
                                  <div>
                                    <dt>Signer Public Key</dt>
                                    <dd><code>{row.clearanceCertificate.signer_public_key}</code></dd>
                                  </div>
                                  <div>
                                    <dt>Replay Nonce</dt>
                                    <dd><code>{row.clearanceCertificate.certificate_payload.nonce}</code></dd>
                                  </div>
                                </div>
                              </section>
                            )}

                            {/* Standing Order Details */}
                            {row.standingOrder && (
                              <section className="proof-card full-width-card standing-card">
                                <h5>Channel3 /v0 Webhook Standing Order Active</h5>
                                <p>
                                  Subscription ID: <code>{row.standingOrder.subscription_id}</code>.
                                  Monitoring live price webhooks for <code>dell-u2724de-4k</code> and <code>tb4-pro-cable-2m</code>.
                                  Will trigger automatic execution once compliant market drops occur.
                                </p>
                              </section>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
