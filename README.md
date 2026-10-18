# PactPay ⚡🛡️
### Autonomous Agent-to-Agent (A2A) Spend Firewall & SMT Constraint Engine

> **Built for the PayPal AI Hackathon 2026** ("Build What's Next with PayPal and AI").  
> **Core Principle:** *Sellers win by hiding cost inside bundles. PactPay unbundles every quote against live market prices, and money moves only when an SMT constraint solver and an Ed25519 signed chain agree.*

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│               FRONTEND: NEXT.JS 16 + AG GRID ENTERPRISE                │
│  • 1-Click Judge Scenarios Bar (A, B, C) with Real-Time Cell Flashes   │
│  • Live "Break-It" Box: Interactive Malicious Prompt & Slider Console  │
│  • Master-Detail Z3 SMT Proof Drawers & Cryptographic Receipt Exporter │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ SSE / REST Telemetry
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 BACKEND: FASTAPI (PYTHON 3.11 / 3.13)                  │
│                                                                        │
│  ┌──────────────────────────────┐      ┌────────────────────────────┐  │
│  │ 1. CHANNEL3 UNBUNDLING ORACLE│─────▶│ 2. AP2-STYLE A2A AUCTION   │  │
│  │ • POST /v1/search unbundling │      │ • Buyer Agent (CFO Mandate)│  │
│  │ • GET /v0/products/{id} watch│ Sets │ • 3 Real Merchant Agents:  │  │
│  │ • Landed BATNA: $4,746.90    │ BATNA│   Honest, Adversary,Stubbrn│  │
│  └──────────────────────────────┘      └──────────────┬─────────────┘  │
│                                                       │ Cart Mandate   │
│                                                       ▼                │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 3. MICROSOFT Z3 SMT NEGOTIATION ORACLE & FIREWALL (INTEGER CENTS)│  │
│  │ • INV_1_BUDGET_CAP: Landed <= $4,600.00 (460,000¢)               │  │
│  │ • INV_2_BEATS_BATNA: Landed < $4,746.90 (474,690¢)               │  │
│  │ • INV_3_FREIGHT_CAP_8PCT: Freight <= 8% of Subtotal              │  │
│  │ • INV_4_MIN_WARRANTY: Warranty >= 12 Months                      │  │
│  │ • INV_5_SCHEMA_VALIDATED: All economic terms typed numeric       │  │
│  │ • INV_6A_NO_SUBSIDY: Monitor <= $445.90, Cable <= $28.79         │  │
│  │ • Z3 Optimizer: nearest_compliant() guides multi-turn convergence│  │
│  │ ──▶ Mints Ed25519 Clearance Certificate (RFC 8785 JCS Canonical) │  │
│  └────────────────────────────────┬─────────────────────────────────┘  │
│                                   │ Verified Ed25519 Certificate       │
│                                   ▼                                    │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 4. AIR-GAPPED EXECUTOR & APIMATIC-MODELED PAYPAL SDK             │  │
│  │ • Zero LLM Prompts / Zero Payment Keys on Orchestrator           │  │
│  │ • Re-checks Channel3 price freshness before capture              │  │
│  │ • Orders v2: Real Buyer Approval URL & UUIDv5 Idempotency        │  │
│  │ • Invoicing v2 & Shipment Tracking: FedEx Tracking Number Gen    │  │
│  │ • Defense-in-depth: Re-runs arithmetic invariants independently  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Threat Model: Guarantees & Boundaries

### What PactPay Formally Guarantees
1. **Zero Mathematical Hallucinations:** Every pricing term is extracted as typed integers and modeled as linear SMT inequalities in integer cents (`Int("u_mon")`, `Int("u_cab")`, `freight`, `disc`).
2. **Deterministic Spend Invariants:**
   * **`INV_1_BUDGET_CAP`:** Total landed spend will **never** exceed the CFO's signed budget ($4,600.00).
   * **`INV_2_BEATS_BATNA`:** Total landed spend must strictly beat the live open-market retail landed cost ($4,746.90).
   * **`INV_3_FREIGHT_CAP_8PCT`:** Freight charges cannot exceed 8.00% of equipment subtotal (neutralizes hidden freight attacks).
   * **`INV_4_MIN_WARRANTY`:** Minimum 12-month hardware warranty required.
   * **`INV_5_SCHEMA_VALIDATED`:** No unvalidated strings or free-form notes dictate monetary commitments.
   * **`INV_6A_NO_SUBSIDY`:** Prevents cross-subsidization where discounts on one item hide price gouging on accessories.
3. **Non-Repudiation & Replay Protection:** Intent Mandates and Clearance Certificates are signed with Ed25519 (RFC 8032) and hashed with RFC 8785 JCS. Single-use random nonces prevent replay attacks.
4. **Separation of Powers:** The LLM reasoning service holds **zero** PayPal credentials. The PayPal private executor receives only valid clearance certificates and independently re-verifies arithmetic invariants before creating/capturing orders.

### What PactPay Does NOT Guarantee (and System Mitigations)
* **Physical Merchant Delivery:** PactPay proves that the quote was authorized, compliant, and settled, but cannot physically guarantee the distributor delivers the goods.  
  * *Mitigation:* Uses PayPal REST v2 dispute resolution and requires merchant dispatch telemetry (`create_shipment_tracking`) with FedEx tracking integration.
* **Unchecked Webhook Payloads:** Public Channel3 webhook events are treated strictly as untrusted wake-up triggers, not source data.  
  * *Mitigation:* On webhook receipt, PactPay authoritatively re-fetches `/v0/products/{id}`. If the retail BATNA ($4,746.90) exceeds the CFO budget ($4,600.00), automatic execution is halted and explicit CFO spend approval is requested.

---

## 📊 Reconciled Economics ($4,600 Benchmark Order)

*Benchmark Basket: 10x Dell UltraSharp 27 4K USB-C Hub Monitors + 10x Thunderbolt 4 Pro Cables delivered to Austin, TX.*

| Parameter | Scenario A (Compliant Deal) | Scenario B (Adversarial Attack) | Scenario C (Standing Order) |
|---|---|---|---|
| **Distributor Quote** | $396.85 / mon, $25.62 / cab | $396.85 / mon, $25.62 / cab | $450.00 / mon, $31.00 / cab |
| **Freight Surcharge** | $110.00 (2.60% of subtotal) | **$850.00 (20.12% — HIDDEN)** | $120.00 |
| **Gross Item Subtotal**| $4,224.70 | $4,224.70 | $4,810.00 |
| **PAY_BY_BANK 1.5% Rebate**| -$63.37 (`floor(1.5%)`) | -$63.37 | -$72.15 |
| **Landed Cost** | **$4,271.33** | **$5,011.33** | **$4,857.85** (102.34% of BATNA) |
| **Channel3 Landed BATNA**| $4,746.90 | $4,746.90 | $4,746.90 |
| **Net Savings vs. BATNA**| **$475.57 (10.02%)** | N/A (Blocked) | N/A (Watching) |
| **Z3 Formal Status** | **SAT (All Invariants Pass)** | **UNSAT (`INV_1`, `INV_2`, `INV_3`)** | **Standing Order (Awaiting Price Drop)** |
| **Payment Action** | Ed25519 Certificate $\rightarrow$ PayPal | **Halted:** 0 Tokens Minted | Channel3 `/v0` Webhook Registered |

---

## 🚀 Key Innovations

1. **Unbundled Channel3 BATNA Ceiling:** Queries Channel3's 100M+ live product graph to discover the unbundled landed retail BATNA. B2B distributors must beat this open-market landed ceiling.
2. **Microsoft Z3 Active Negotiation Oracle:** Uses SMT constraint solving in pure integer cents. Diagnoses exact invariant breaches and uses `z3.Optimize` to compute `nearest_compliant()` counters, guiding multi-agent convergence in 2 rounds (vs 5.4 unguided).
3. **AP2-Style Agent Protocol:** Implements CFO Intent Mandates, Merchant Cart Mandates, and Ed25519 Clearance Certificates.
4. **Air-Gapped Private Executor:** The LLM reasoning service holds zero PayPal keys. The Render private executor (`render.yaml`) holds PayPal keys and verifies Ed25519 signatures, single-use nonces, and invariant math before executing payment.
5. **APIMatic-Modeled PayPal Client:** Structured modularly after APIMatic SDK architecture covering Orders v2, Invoices v2, and Shipment Tracking.
6. **Dual Independent Zero-Dependency Receipt Verifier:** Every deal produces a `receipt.json`. Run `python pactpay_verify.py receipt.json` to verify the Ed25519 signatures and recompute all invariants in pure Python with zero external solver dependencies. Tested against official RFC 8032 test vectors.

---

## 🛠️ Quickstart & Local Run Guide

### 1. Run the Backend (FastAPI)
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload --port 8000
```
*Or run:* `.\run_backend.bat`

### 2. Run the Frontend (Next.js 16)
```powershell
cd frontend
npm run dev
```
*Or run:* `.\run_frontend.bat`

Open **`http://localhost:3000`** in your browser.

---

## 🧪 Testing & Verification Commands

### 1. Run the RFC 8032 & RFC 8785 Cryptographic Self-Test
Validates the zero-dependency verifier against official RFC 8032 test vectors and JCS canonical formatting:
```bash
python pactpay_verify.py --test-vectors
```
*Output: `[SUCCESS] All official test vectors passed!`*

### 2. Run the Security Isolation & Separation of Powers Test
Asserts that agent reasoning modules have zero payment keys and that the executor independently halts non-compliant economics:
```bash
python backend/test_security_isolation.py
```

### 3. Run the SMT & Red-Team Evaluation Benchmark (120 Cases)
```bash
python backend/eval_harness.py
```
*Results logged to `backend/test_results.log`:*
* **Benchmark Set:** 30 Compliant, 25 Freight Injections, 25 Cross-Subsidies, 20 Overbudget, 20 BATNA Breaches
* **False Accept Rate (FAR):** `0.00%` (0 / 90 adversarial attacks passed)
* **False Reject Rate (FRR):** `0.00%` (0 / 30 compliant deals blocked)
* **SMT Solver Latency:** `p50: 11.92 ms` | `p95: 15.49 ms`
* **Convergence Policy:** Guided Oracle: `2.0 rounds` (vs `5.4 rounds` unguided stochastic re-quote)

### 4. Run the Full End-to-End System Integration Test
```bash
python backend/test_e2e.py
```
*Outputs: `ALL END-TO-END TESTS PASSED WITH 100% SUCCESS!`*

### 5. Verify Any Transaction Receipt with the Standalone Verifier
```bash
python pactpay_verify.py receipt.json
```

---

## 🔑 Judge Demo Walkthrough

1. **Scenario A (Compliant Deal):** Click **Scenario A**. Watch Z3 guide the cable counter to $25.62, achieve **$475.57 (10.02%) savings**, verify all 6 invariants SAT, mint an Ed25519 certificate, and launch the PayPal Sandbox settlement modal with a real buyer approval link and FedEx tracking generation.
2. **Scenario B (Adversarial Attack):** Click **Scenario B**. Watch the adversarial distributor attempt an instruction injection and an $850 hidden freight surcharge ($5,011.33 landed). Z3 instantly locks execution and displays all three red invariant failures (`INV_1`, `INV_2`, and `INV_3`). Zero payment tokens are minted.
3. **Scenario C (Standing Order):** Click **Scenario C**. When distributor pricing exceeds retail BATNA ($4,857.85 > $4,746.90), PactPay refuses to overpay and registers a Channel3 `/v0` webhook standing order to watch for compliant market price drops.
4. **Live "Break-It" Box:** Type any malicious prompt or adjust the sliders in the live red-team box to observe real-time Z3 invariant diagnostics, telemetry quarantine, and nearest-compliant recommendations.