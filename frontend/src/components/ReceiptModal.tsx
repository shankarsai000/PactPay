"use client";

import { useState } from "react";

interface Props {
  receipt: any;
  apiBase: string;
  onClose: () => void;
}

export function ReceiptModal({ receipt, apiBase, onClose }: Props) {
  const [verifyStatus, setVerifyStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleVerify() {
    setBusy(true);
    try {
      const res = await fetch(`${apiBase}/api/receipt/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(receipt),
      });
      const data = await res.json();
      if (data.verified) {
        setVerifyStatus("✓ VERIFIED: Ed25519 signature verified & all 6 invariants confirmed SAT in independent Python.");
      } else {
        setVerifyStatus("✕ FAILED: Signature or invariant recomputation failed.");
      }
    } catch (e) {
      setVerifyStatus("Error contacting verifier endpoint.");
    } finally {
      setBusy(false);
    }
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pactpay_receipt_${receipt.receipt_id || "demo"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal receipt-modal" role="dialog" aria-modal="true">
        <button suppressHydrationWarning className="modal-close" onClick={onClose} aria-label="Close">×</button>

        <div className="modal-top">
          <span className="live-badge">AUDIT EVIDENCE ARTIFACT</span>
          <h2>Cryptographic Transaction Receipt</h2>
          <p className="modal-sub">
            Self-contained verification record with Ed25519 signatures, RFC 8785 hashes, and full transcript.
          </p>
        </div>

        <div className="receipt-actions-bar">
          <button suppressHydrationWarning className="button" onClick={handleVerify} disabled={busy}>
            {busy ? "Running Verifier..." : "🛡️ Run Standalone Python Verifier"}
          </button>
          <button suppressHydrationWarning className="button ghost" onClick={downloadJson}>
            💾 Download receipt.json
          </button>
        </div>

        {verifyStatus && (
          <div className={`verify-alert ${verifyStatus.startsWith("✓") ? "alert-pass" : "alert-fail"}`}>
            {verifyStatus}
          </div>
        )}

        <div className="receipt-json-viewer">
          <pre>{JSON.stringify(receipt, null, 2)}</pre>
        </div>

        <div className="modal-actions">
          <button suppressHydrationWarning className="button ghost" onClick={onClose}>Close</button>
        </div>
      </section>
    </div>
  );
}
