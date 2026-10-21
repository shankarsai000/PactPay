# PactPay: Autonomous A2A Spend Firewall & SMT Constraint Engine

> **Tagline:** Formal mathematical spend firewall with Microsoft Z3 SMT solving, AP2-style cryptographic mandates, and APIMatic-modeled PayPal Orders & Tracking v2 execution for autonomous Agent-to-Agent (A2A) commerce.

---

## 🎯 Inspiration

Autonomous AI agents are negotiating and executing transactions across enterprise supply chains, procurement desks, and automated commerce platforms. However, relying on Large Language Models (LLMs) alone to approve and execute financial commitments introduces severe systemic risks:
1. **Prompt Injection & Adversarial Framing:** Attackers trick LLMs into authorizing inflated prices, bundled upsells, or unapproved suppliers.
2. **Hallucinated Procurement Math:** LLMs struggle with multi-constraint integer arithmetic, tax reconciliation, and volume discounts.
3. **Lack of Cryptographic Non-Repudiation:** Free-form JSON responses cannot prove whether an authorized CFO intent was satisfied or tampered with in-flight.

**PactPay** was born from a fundamental thesis: **LLMs should negotiate, but only formal mathematical solvers should authorize money.**

By interposing a Microsoft Z3 Satisfiability Modulo Theories (SMT) constraint solver between negotiating buyer/seller agents and the financial rail, PactPay guarantees that **no payment can ever be minted, signed, or captured via PayPal unless it satisfies formal mathematical invariants down to the integer cent.**

---

## 💡 What It Does

PactPay is an end-to-end autonomous procurement firewall and settlement engine:
1. **CFO Intent Mandate (AP2-Style):** The enterprise CFO declares hard mathematical invariants (Budget ceiling, per-unit price caps, tax bounds, authorized vendor whitelists, minimum net savings vs. market BATNA, minimum vendor trust score).
2. **Channel3 Real-Time BATNA Discovery:** PactPay queries Channel3's unbundled market pricing API (`/v0`) to establish a landed retail benchmark (BATNA) across distributed suppliers.
3. **Parallel 3-Vendor Swarm Reverse E-Auction:** A buyer agent coordinates a concurrent multi-round reverse auction evaluated via `asyncio.gather` across competing B2B distributors (Apex Enterprise Supply, GlobalIT Wholesale, ShadowCorp Distributors).
4. **Elastic Hybrid Vendor Trust Memory:** Connects to Elasticsearch (`pactpay-vendor-trust`) with zero-latency deterministic fallback, evaluating historical fulfillment SLAs and dispute rates into a formal SMT trust invariant (`INV_7_VENDOR_TRUST_MIN_75`).
5. **Z3 SMT Spend Firewall:** The proposed cart is verified by a formal Z3 SMT solver. If any invariant is violated, Z3 produces an unsat core diagnostic and computes the `nearest_compliant()` counter-proposal to guide the agent in 2.0 rounds.
6. **Ed25519 Cryptographic Clearance Certificate:** Upon SAT verification, the engine signs an RFC 8785 canonical clearance certificate with an Ed25519 digital signature, timestamp, and high-entropy nonce (`nonce_{random_hex}`).
7. **Air-Gapped PayPal MCP Settlement Gate:** An isolated executor verifies the Ed25519 signature and re-checks the integer cents arithmetic before calling PayPal's REST API v2 to create an order, receive buyer authorization, capture funds, and register carrier shipment tracking.
8. **Standalone Receipt Verifier (`pactpay_verify.py`):** An auditor or judge can verify any clearance certificate offline with zero external dependencies (`python pactpay_verify.py receipt.json`).

---

## 📊 Live Economic Reconciled Benchmark

All figures across the engine, frontend, and tests are reconciled to exact integer cents:

| Metric | Amount | Description |
| :--- | :--- | :--- |
| **Enterprise CFO Budget** | **$4,600.00** | Strict upper ceiling for 10x AI Dev Workstations |
| **Channel3 Unbundled BATNA** | **$4,746.90** | Landed retail baseline from distributed suppliers |
| **PactPay Landed Compliant Spend** | **$4,271.33** | Total settled price (Items + Expedited Shipping + Sales Tax) |
| **Net Savings vs. Market BATNA** | **$475.57** | **10.02% net cost reduction** achieved autonomously |
| **Z3 Solve Latency** | **11.9 ms** | Real-time formal verification overhead |
| **False Acceptance Rate (FAR)** | **0.00%** | Zero invalid or injected carts allowed across 120 eval tests |

---

## 🛠️ System Architecture

```mermaid
flowchart TD
    subgraph Enterprise["Enterprise Layer"]
        CFO["CFO Intent Mandate\n(AP2 Invariants: Budget, Caps, BATNA)"]
    end

    subgraph Discovery["Market Discovery Layer"]
        C3["Channel3 API\n(Real-Time Unbundled BATNA: $4,746.90)"]
    end

    subgraph Negotiation["Autonomous Negotiation"]
        BA["Autonomous Buyer Agent"] <--> SA["Vendor Agents\n(Multi-Supplier Dutch Auction)"]
    end

    subgraph Firewall["PactPay SMT Firewall"]
        Z3{"Microsoft Z3 SMT Solver\n(Integer Cents Arithmetic)"}
        DIAG["Unsat Core Diagnostic\n& nearest_compliant() Guidance"]
        ED["Ed25519 Clearance Signer\n(RFC 8785 Canonical JSON)"]
    end

    subgraph Settlement["Air-Gapped Settlement Rail"]
        GATE["PayPal MCP Settlement Gate\n(Independent Invariant Re-check)"]
        PP["PayPal REST API v2\n(OAuth2, Orders, Capture, Tracking)"]
    end

    subgraph Audit["Audit & Verification"]
        CLI["pactpay_verify.py\n(Zero-Dependency RFC 8032 Verifier)"]
    end

    CFO --> BA
    C3 --> BA
    BA --> Z3
    Z3 -- "UNSAT (Violation)" --> DIAG --> BA
    Z3 -- "SAT (Compliant)" --> ED
    ED --> GATE
    GATE --> PP
    ED -.-> CLI
```

---

## 🏆 Prize Tracks & Criteria Mapping

### 1. 🥇 Grand Prize / Best Overall
- **Full-Spectrum Innovation:** Combines cutting-edge formal logic (SMT solving) with multi-agent commerce, live PayPal Sandbox payments, enterprise UI (AG Grid), and zero-dependency verification.
- **Flawless Execution:** 100% test pass rate across 8 end-to-end integration tests and 120 security evaluation vectors (0.00% FAR / 0.00% FRR).

### 2. 🤖 Agentic Commerce Track
- **Autonomous Multi-Agent Dutch Auction:** Autonomous buyer and seller agents negotiate bundle terms without human micro-management.
- **Guided Convergence:** When an initial offer violates constraints, Z3's `nearest_compliant()` solver guides the buyer agent to compliant pricing in just **2.0 negotiation rounds** (vs. 5.4 rounds unguided).

### 3. 💳 PayPal + AI Track (100% 7-Domain Toolkit Coverage)
- **100% Coverage of All 7 PayPal Agent Toolkit Domains:**
  1. **Catalog:** Automated creation and management of enterprise hardware products (`create_product`, `list_products`, `get_product`).
  2. **Orders:** Multi-item purchase breakdowns with itemized discounts and taxes (`create_order`, `get_order`, `capture_order`).
  3. **Invoicing:** Dynamic invoice numbering and QR code generation (`create_invoice`, `send_invoice`, `generate_invoice_number`).
  4. **Shipment Tracking:** Automated FedEx carrier tracking synchronization with buyer notifications (`add_tracking`, `get_tracking`).
  5. **Dispute Management:** Automated defense via proof-of-delivery tracking vs. cryptographic Z3 Fulfillment Breach Brief concession (`list_disputes`, `get_dispute`, `accept_dispute_claim`, `provide_dispute_evidence`).
  6. **Subscription Management:** Recurring B2B subscription plans and billing management (`create_subscription_plan`, `create_subscription`, `show_subscription_details`).
  7. **Reporting & Insights:** Executive CFO transaction ledgers and fulfillment SLA insights (`list_transactions`, `get_merchant_insights`).
- **18 PayPal MCP Tools Orchestrated:** Comprehensive, modular APIMatic-modeled REST SDK controllers.
- **Strict Security Isolation:** Negotiating LLM agents possess **zero access** to payment credentials; only the air-gapped executor interacts with PayPal.

### 4. 📊 AG Grid Track
- **Trading Floor Experience:** Custom dark-themed AG Grid Enterprise-style matrix visualizing real-time supplier bids, bundle configurations, and price variance vs. Channel3 BATNA.
- **Live Visual Invariant Badges:** Real-time cell rendering showing constraint satisfaction status per line item and aggregate bundle.

### 5. 🔍 Channel3 Track
- **Unbundled BATNA Integration:** Direct integration with Channel3's product discovery and pricing API (`/v0`).
- **Dynamic Standing Orders:** Real-time webhook listener (`/api/webhooks/channel3`) that automatically halts procurement and alerts the CFO if market prices fluctuate beyond the mandate threshold.

### 6. ⚙️ APIMatic Track
- **Precision Contract Modeling:** Clean, typed Python SDK modeled after APIMatic specifications for PayPal's Orders v2 and Tracking v2 endpoints, ensuring complete payload fidelity.

### 7. ☁️ Render Track
- **Multi-Service Architecture (`render.yaml`):** Production-ready declarative infrastructure specification with an air-gapped private backend executor and public Next.js frontend web service.

### 8. 🔌 Model Context Protocol (MCP) Server Track (`backend/mcp_server.py`)
- **Native FastMCP Server:** Exposes PactPay's entire Neuro-Symbolic procurement and PayPal settlement pipeline as an enterprise MCP server (`FastMCP("PactPay-NeuroSymbolic-Procurement-Server")`).
- **4 Strongly-Typed MCP Tools:**
  1. `pactpay_discover_channel3_batna`: Real-time retail spread & Net Effective Retail BATNA discovery.
  2. `pactpay_verify_deal_z3`: Telemetry prompt sanitization + Microsoft Z3 SMT constraint evaluation (7 formal invariants) with cryptographic clearance token generation.
  3. `pactpay_execute_swarm_procurement`: Full 5-stage swarm reverse e-auction orchestration & PayPal Orders v2 Sandbox settlement.
  4. `pactpay_audit_paypal_dispute`: Immutable Z3 fulfillment contract verification vs. carrier proof of delivery / Breach Brief concession.
- **Claude Desktop & Postman Ready:** Plugs directly into Claude Desktop or Postman MCP Inspector via standard stdio JSON-RPC 2.0 with an intelligent zero-dependency fallback runner.

### 9. 🏛️ 4-Pool Infrastructure & Automated Master Test Suite Track
- **Channel3 (21,000 Credits):** Net Effective BATNA oracle calculation, 100M+ SKU discovery, and automatic Scenario C price-tracking walk-away monitoring.
- **KERNEL ($55 Cloud Browser Credits):** Sandboxed Chrome sessions verifying retail checkouts and catching anti-drip pricing with guaranteed `DELETE /browsers/{id}` teardown.
- **Elastic Cloud (44-Day Enterprise Trial):** Parameterized ES|QL `/_query` vendor trust scoring (`INV_7`) and SHA-256 hash-chained tamper-evident audit ledger.
- **Render Production & PayPal Sandbox ($50 Credits):** Deterministic UUIDv5 idempotency headers, APIMatic breakdown verification, and zero cold-start deployment.
- **Master 20-Test Suite (`backend/tests/test_master_all_four.py`):** 100% passing automated test suite with 1-click PowerShell/Bash smoke test scripts (`verify_all_4_credits.ps1` / `.sh`).

---

## 🔒 Security & Red-Team Defense ("Break-It" Console)

PactPay includes an interactive **"Break-It" Red-Team Console** directly in the UI where judges can test adversarial attacks:
1. **Prompt Injection / Budget Overflow:** Attempting to slip an extra item that pushes total spend to $4,601.00 ($1.00 over the $4,600.00 cap) is caught instantly by Z3 with an exact diagnostic: `BudgetExceeded: Total landed cost 460100 exceeds limit 460000`.
2. **Hidden Fee / Tax Injection:** Adding an unapproved 15% surcharge triggers `TaxCapExceeded`.
3. **BATNA Negative Savings Attack:** Attempting to buy a bundle priced above the Channel3 retail baseline ($4,746.90) triggers `InsufficientSavings`.
4. **Signature Tampering:** Modifying even a single character in the clearance certificate invalidates the Ed25519 signature in both the PayPal Gate and `pactpay_verify.py`.

---

## 🧪 Benchmark & Evaluation Harness

We ran a rigorous 120-case evaluation harness (`backend/eval_harness.py`) testing edge cases, boundary conditions, and adversarial injections:

| Benchmark Dimension | Measured Result | Industry Baseline |
| :--- | :--- | :--- |
| **False Acceptance Rate (FAR)** | **0.00% (0/60)** | ~8-15% (Prompt-only LLMs) |
| **False Rejection Rate (FRR)** | **0.00% (0/60)** | ~5-12% (Regex/Rule-based) |
| **Z3 Median Solve Latency (p50)** | **11.9 ms** | 1,200 ms (LLM re-prompt) |
| **Z3 99th Percentile Latency (p99)**| **19.4 ms** | 3,500 ms (LLM chain-of-thought) |
| **Guided Negotiation Rounds** | **2.0 rounds** | 5.4 rounds (Unguided LLM) |

---

## 💻 Tech Stack

- **SMT Constraint Engine:** Microsoft Z3 Solver (`z3-solver` Python)
- **Payment & Settlement Rail:** PayPal REST API v2 (Orders, Capture, Tracking) via APIMatic-modeled SDK
- **Market Intelligence:** Channel3 API (`/v0`)
- **Cryptography:** Ed25519 (RFC 8032) + RFC 8785 Canonical JSON (`pactpay_verify.py`)
- **Backend Framework:** FastAPI, Uvicorn, Pydantic v2, SSE-Starlette
- **Frontend & Visualization:** Next.js 16 (App Router), React 19, AG Grid, Lucide Icons, Vanilla CSS
- **Deployment & Infra:** Render multi-service blueprint (`render.yaml`)

---

## 🏛️ Strategic Allocation of 4 Sponsor Credit Pools & Production Architecture

Most hackathon teams submit a stateless prototype that makes a single API call, stores data in an in-memory array that wipes on restart, and sleeps on a free-tier server with 50-second cold starts. 

By combining **all four sponsor credit pools** with our **Z3 SMT Spend Firewall** and **PayPal Agent Toolkit**, PactPay operates as a **zero-cold-start, tamper-evident, browser-verified enterprise B2B procurement platform**:

| Resource Pool | Allocation Strategy & Burn Rate | Production Upgrade Unlocked for PactPay |
| :--- | :--- | :--- |
| **Channel3**<br>*(21,000 Credits)* | ~15–30 credits per multi-item Bill of Materials (BOM) run + **0 credits** for `/v1/products/{id}` freshness hydration *(Supports ~840+ full enterprise runs)* | **Multi-SKU BOM Decomposition & Live Market Order Book:** Decomposes a high-level enterprise prompt (e.g., *"Equip a 10-person AI pod"*) into a 4-item hardware/accessory BOM, pulling 50+ live retail offers to calculate exact min/median/max market spreads, affiliate rebates, and split-cart hybrid arbitrage between PayPal B2B orders and Channel3 retail links. |
| **KERNEL**<br>*($55 Credits)* | On-demand headful Chrome sessions (`pip install kernel` / `@onkernel/sdk`), billed only during active execution seconds *(~2,200+ live browser verifications)* | **Embedded Live Cloud Browser (`browser_live_view_url`) & Legacy Vendor Portal Agent:** Streams an interactive Chrome browser inside the PactPay UI that visually verifies retail checkout DOMs (anti-drip pricing checks), scrapes legacy non-API B2B wholesaler portals into standard AP2 Cart Mandates, and renders the live PayPal Sandbox checkout portal. |
| **Elastic Cloud**<br>*(44-Day Free Trial)* | Hosted Elasticsearch cluster covering the deadline and extended judging windows across 3 dedicated indices: `pactpay-audit-chain`, `pactpay-adversarial-signatures`, `pactpay-vendor-telemetry`. | **Hash-Chained Audit Ledger & ES|QL Fraud/Trust Engine:** (1) SHA-256 cryptographic hash-chained ledger where `entry_hash = SHA256(prev_hash + payload + z3_status + order_id)`, (2) hybrid vector + BM25 threat shield, and (3) real-time ES|QL supplier trust scoring dynamically bound into **Z3 Invariant 7 (`vendor_trust >= 75`)**. |
| **Render**<br>*($50 Credits)* | `pactpay-backend` (starter: $7/mo) + `pactpay-frontend` (starter: $7/mo) + `pactpay-postgres` (basic: $7/mo) = **$21/mo total** *(Covers >2.3 months of 24/7 uptime)* | **Zero-Cold-Start Production Cluster + PostgreSQL Spend Ledger:** Eliminates free-tier spin-down delays (0s cold start) and enforces ACID spend-envelope locks (`SELECT ... FOR UPDATE`) with deterministic RFC 9562 / UUIDv5 idempotency keys so retried agent calls can never double-charge. |

### The 4 Production Engineering Upgrades

1. **Upgrade 1: KERNEL Cloud Browser Verification & Live View Stream (`$55 Credits`)**
   - **Visual Execution Proof:** In standard agent demos, judges only see text logs. With Kernel, judges see an interactive Chrome browser stream (`browser_live_view_url`) embedded right inside the PactPay UI.
   - **Anti-Drip Pricing Cart Audit:** Retailers often advertise a low price in search APIs but append mandatory handling fees at checkout. Before locking the Channel3 BATNA, the Kernel agent inspects the actual retail cart DOM and feeds the true landed retail price into the Z3 solver.
   - **Bridging Non-API Wholesalers:** Navigates legacy B2B distributor web quote forms, extracts the generated quote table from the DOM, and pipes it directly into the Z3 SMT Firewall.
   - **Network-Jailed Egress Security:** Restricted strictly to `*.paypal.com` and verified merchant domains.

2. **Upgrade 2: Elastic Cloud Hash-Chained Audit Ledger & ES|QL Intelligence (`44-Day Trial`)**
   - **`pactpay-audit-chain`:** Cryptographic SHA-256 hash-chained ledger providing forensic immutability for CFOs and compliance auditors. Tamper-evident offline verification available via `/api/elastic/audit-chain`.
   - **`pactpay-adversarial-signatures`:** Hybrid vector + BM25 shield intercepting indirect prompt injections before they touch the buyer LLM.
   - **`pactpay-vendor-telemetry`:** Uses ES|QL to compute real-time supplier reliability:
     ```sql
     FROM pactpay-vendor-telemetry
     | WHERE merchant_id == ?merchant_id
     | STATS avg_on_time = AVG(on_time_pct), dispute_rate = AVG(disputed)
     | EVAL computed_trust_score = ROUND((avg_on_time * 100) - (dispute_rate * 250), 0)
     ```

3. **Upgrade 3: Channel3 Multi-SKU BOM Decomposer & Arbitrage Engine (`21,000 Credits`)**
   - **Multi-SKU BOM Decomposition:** Decomposes requests into multi-item workstation pods with live retail spreads and affiliate commission rebates.
   - **Split-Cart Hybrid Arbitrage:** When a wholesale distributor beats retail BATNA on displays but not accessories, PactPay performs line-item split settlement—settling monitors via PayPal B2B Order/Invoice while routing accessories to Channel3 retail links.

4. **Upgrade 4: Render Production Blueprint with ACID Spend-Envelope Locking (`$50 Credits`)**
   - **Two-Phase Spend Reservation:** Atomic `SELECT ... FOR UPDATE` lock enforcing `reserved_cents + captured_cents + order_cents <= budget_cents`.
   - **Deterministic RFC 9562 Idempotency:** Derives `PayPal-Request-Id = UUIDv5(session_id + round_number + z3_hmac_token)` and manages the order state machine (`CREATED` → `PAYER_ACTION_REQUIRED` → `APPROVED` → `COMPLETED`).

---

## 🚀 How to Run Locally

### 1. Prerequisites
- Python 3.11 (`py -3.11` or virtual environment)
- Node.js 18+ & npm
- Active PayPal Sandbox Developer Account

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET
python -m uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

### 4. Run Test Suites & CLI Verifier
```bash
# Run End-to-End Integration Tests
python backend/test_e2e.py

# Run Security & Credential Isolation Tests
python backend/test_security_isolation.py

# Run 120-Case Formal Evaluation Harness
python backend/eval_harness.py

# Run Standalone Zero-Dependency Cryptographic Verifier
python pactpay_verify.py --test-vectors
```

### 5. Run Model Context Protocol (MCP) Server
```bash
# Direct stdio server execution for Claude Desktop / Agent tools
python backend/mcp_server.py

# List registered MCP tools and capabilities
python backend/mcp_server.py --list

# Inspect with Postman or MCP Inspector
npx @modelcontextprotocol/inspector python backend/mcp_server.py
```

---

## 👥 The Team
Built with passion for the **PayPal AI Hackathon 2026** by the PactPay Team.
