# PactPay ⚡🛡️
### Autonomous Agent-to-Agent (A2A) Spend Firewall & SMT Constraint Engine

> **Built for the PayPal AI Hackathon 2026** ("Build What's Next with PayPal and AI").  
> **Core Principle:** *Sellers win by hiding cost inside bundles. PactPay unbundles every quote against live market prices, and money moves only when an SMT constraint solver and an Ed25519 signed chain agree.*

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐
│  FRONTEND: NEXT.JS 16 + AG GRID      │  │  EXTERNAL AI AGENTS & MCP CLIENTS   │
│  • 1-Click Judge Scenarios (A, B, C) │  │  • Claude Desktop, Postman, Cursor  │
│  • Live "Break-It" Console           │  │  • FastMCP Model Context Protocol    │
│  • Master-Detail Z3 Proof Drawers    │  │  • 4 Strongly-Typed MCP Tools        │
└──────────────────┬───────────────────┘  └──────────────────┬───────────────────┘
                   │ SSE / REST Telemetry                    │ JSON-RPC 2.0 Stdio
                   ▼                                         ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│               BACKEND: FASTAPI + MODEL CONTEXT PROTOCOL (MCP) SERVER           │
│                                                                                │
│  ┌──────────────────────────────┐      ┌────────────────────────────┐          │
│  │ 1. CHANNEL3 UNBUNDLING ORACLE│─────▶│ 2. AP2-STYLE A2A AUCTION   │          │
│  │ • POST /v1/search unbundling │      │ • Buyer Agent (CFO Mandate)│          │
│  │ • GET /v0/products/{id} watch│ Sets │ • 3 Merchant Swarm Personas│          │
│  │ • Landed BATNA: $4,746.90    │ BATNA│ • Elastic Vendor Trust     │          │
│  └──────────────────────────────┘      └──────────────┬─────────────┘          │
│                                                       │ Cart Mandate           │
│                                                       ▼                        │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │ 3. MICROSOFT Z3 SMT NEGOTIATION ORACLE & FIREWALL (7 INVARIANTS)         │  │
│  │ • INV_1_BUDGET_CAP: Landed <= $4,600.00 (460,000¢)                       │  │
│  │ • INV_2_BEATS_BATNA: Landed < $4,746.90 (474,690¢)                       │  │
│  │ • INV_3_FREIGHT_CAP_8PCT: Freight <= 8% of Subtotal                      │  │
│  │ • INV_4_MIN_WARRANTY: Warranty >= 12 Months                              │  │
│  │ • INV_5_SCHEMA_VALIDATED: All economic terms typed numeric               │  │
│  │ • INV_6A_NO_SUBSIDY: Monitor <= $445.90, Cable <= $28.79                 │  │
│  │ • INV_7_VENDOR_TRUST_MIN_75: Elastic Trust SLA >= 75/100                 │  │
│  │ • Z3 Optimizer: nearest_compliant() guides multi-turn convergence        │  │
│  │ ──▶ Mints Ed25519 Clearance Certificate (RFC 8785 JCS Canonical)         │  │
│  └────────────────────────────────────┬─────────────────────────────────────┘  │
│                                       │ Verified Ed25519 Certificate           │
│                                       ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │ 4. AIR-GAPPED EXECUTOR & 100% 7-DOMAIN PAYPAL MCP SETTLEMENT GATE        │  │
│  │ • Catalog, Orders, Invoices, Tracking, Disputes, Subscriptions, Insights │  │
│  │ • Orders v2: Real Buyer Approval URL & UUIDv5 Idempotency                │  │
│  │ • Invoicing v2 & Shipment Tracking: FedEx Tracking Gen                   │  │
│  │ • Dispute Auto-Defense vs. Z3 Fulfillment Breach Brief Concession        │  │
│  │ • Defense-in-depth: Re-runs arithmetic invariants independently          │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────┘
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
7. **Native Model Context Protocol (MCP) Server (`backend/mcp_server.py`):** Exposes the complete Neuro-Symbolic procurement and PayPal settlement pipeline as a standard FastMCP server (`FastMCP("PactPay-NeuroSymbolic-Procurement-Server")`). Exposes 5 strongly-typed tools and 1 audit resource:
   - `pactpay_discover_channel3_batna`: Real-time retail spread & Net Effective Retail BATNA discovery + KERNEL cloud browser checkout verification.
   - `pactpay_query_elastic_vendor_trust`: Parameterized ES|QL query against Elastic Cloud for vendor reliability & dispute scoring (Z3 Invariant 7).
   - `pactpay_verify_deal_z3`: Telemetry prompt sanitization + Z3 SMT constraint evaluation (7 formal invariants) with deterministic HMAC-SHA256 clearance token minting.
   - `pactpay_execute_guarded_procurement`: Full 5-stage end-to-end multi-agent pipeline orchestration, Z3 verification, and PayPal Sandbox order creation.
   - `pactpay_capture_paypal_order`: Captures approved PayPal orders (`pay_order`) and registers FedEx carrier shipment tracking (`create_shipment_tracking`).
   - `pactpay://audit-chain/latest`: Resource returning the tamper-evident SHA-256 hash-chained forensic audit ledger.
   Includes a built-in 1-click CLI self-test (`python mcp_server.py --self-test`) and zero-dependency stdio fallback.

---

## 🛠️ Quickstart & Local Run Guide

### 1. Run the Backend (FastAPI)
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload --port 8000
```
*Or simply run:* `.\run.bat` from repository root (or `.\run_backend.bat`)

### 2. Run the Frontend (Next.js 16)
```powershell
cd frontend
npm run dev
```
*Or run:* `.\run_frontend.bat`

Open **`http://localhost:3000`** in your browser.

### 3. Run the Model Context Protocol (MCP) Server
Connect any MCP-compatible AI agent (Claude Desktop, Cursor, Postman MCP Inspector) directly to PactPay:
```powershell
# Instant CLI Self-Test (verifies all 5 tools + audit resource):
cd backend
python mcp_server.py --self-test

# Inspect interactively via Postman or Official MCP Inspector:
npx @modelcontextprotocol/inspector python backend/mcp_server.py
```

#### Claude Desktop / Cursor IDE Configuration (`claude_desktop_config.json` or `.cursor/mcp.json`)
```json
{
  "mcpServers": {
    "pactpay-guardian": {
      "command": "python",
      "args": ["d:/Pactpay/backend/mcp_server.py"],
      "env": {
        "PAYPAL_API_BASE": "https://api-m.sandbox.paypal.com"
      }
    }
  }
}
```

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

### 6. Run the 20-Test Master 4-Pool Suite (`backend/tests/test_master_all_four.py`)
Executes the comprehensive automated contract and end-to-end verification suite covering all 4 credit-backed infrastructure pools (Channel3, KERNEL, Elastic Cloud, and Render + PayPal Sandbox):
```bash
cd backend
python -m pytest tests/test_master_all_four.py -v
```
*Outputs: `20 passed in 34.18s` (100% pass rate across Net Effective BATNA math, KERNEL headless Playwright anti-drip verification, Elastic ES|QL trust scoring & SHA-256 hash chains, Z3 invariants, and APIMatic PayPal Orders v2 settlement).*

### 7. 1-Click Multi-Pool Infrastructure Smoke Test
Verifies live connectivity to all 4 external credit pools in one shot:
```powershell
# Windows PowerShell:
powershell -ExecutionPolicy Bypass -File backend\scripts\verify_all_4_credits.ps1

# Linux / Render CI (Bash):
bash backend/scripts/verify_all_4_credits.sh
```

### 8. Verify Model Context Protocol (MCP) Server Tool Definitions
```bash
python backend/mcp_server.py --list
```

---

## 🔑 Judge Demo Walkthrough

1. **Scenario A (Compliant Deal):** Click **Scenario A**. Watch Z3 guide the cable counter to $25.62, achieve **$475.57 (10.02%) savings**, verify all 6 invariants SAT, mint an Ed25519 certificate, and launch the PayPal Sandbox settlement modal with a real buyer approval link and FedEx tracking generation.
2. **Scenario B (Adversarial Attack):** Click **Scenario B**. Watch the adversarial distributor attempt an instruction injection and an $850 hidden freight surcharge ($5,011.33 landed). Z3 instantly locks execution and displays all three red invariant failures (`INV_1`, `INV_2`, and `INV_3`). Zero payment tokens are minted.
3. **Scenario C (Standing Order):** Click **Scenario C**. When distributor pricing exceeds retail BATNA ($4,857.85 > $4,746.90), PactPay refuses to overpay and registers a Channel3 `/v0` webhook standing order to watch for compliant market price drops.
4. **Live "Break-It" Box:** Type any malicious prompt or adjust the sliders in the live red-team box to observe real-time Z3 invariant diagnostics, telemetry quarantine, and nearest-compliant recommendations.
5. **Interactive 4-Pool Production Architecture:** Click **🏛️ 4 Sponsor Credit Pools & Architecture** in the top hero to explore our strategic allocation across **21,000 Channel3 Credits** (BOM decomposition & split-cart arbitrage), **$55 in KERNEL Cloud Browsers** (interactive headful Chrome stream & anti-drip cart DOM verifier), **44-Day Elastic Cloud trial** (SHA-256 hash-chained forensic ledger & ES|QL trust query), and **$50 in Render credits** (zero cold starts & PostgreSQL spend envelope locking).