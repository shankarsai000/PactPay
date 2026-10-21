# PactPay 3-Minute Video Demo Script
**Event:** PayPal AI Hackathon 2026  
**Target Duration:** 3:00 (180 seconds)  
**Tone:** Confident, technical, high-energy enterprise fintech engineering.

---

## ⏱️ Timeline Overview

| Timecode | Section | Key Visual Focus | Core Message |
| :--- | :--- | :--- | :--- |
| **0:00 - 0:30** | The Hook & The Problem | Slide / UI Hero banner with live metrics | Why LLMs cannot be trusted with autonomous enterprise wallets |
| **0:30 - 1:15** | Architecture & AG Grid Auction | AG Grid trading floor + Channel3 BATNA | Reverse Dutch auction & real-time Z3 invariant enforcement |
| **1:15 - 1:45** | "Break-It" Red-Team Attack | Break-It console in UI | Prompt injection & budget tampering caught in 11.9ms |
| **1:45 - 2:25** | PayPal Live Sandbox Settlement | PayPal approval modal & Capture button | Live order creation, authorization, and capture with FedEx tracking |
| **2:25 - 3:00** | Standalone Audit & Conclusion | Terminal running `pactpay_verify.py` | Ed25519 mathematical proof & zero-dependency auditability |

---

## 🎬 Second-by-Second Script

### 0:00 - 0:30 | The Hook: Why LLMs Need a Mathematical Firewall

**Screen Action:**
- Open browser at `http://localhost:3000`.
- Mouse hovers over the top status bar: **Enterprise CFO Budget: $4,600.00**, **Market BATNA: $4,746.90**, **SMT Status: Active**.

**Speaker Narration:**
> *"Autonomous AI agents are beginning to negotiate multi-million dollar supply chains and corporate procurement. But here is the multi-billion dollar problem: Large Language Models hallucinate, fail at multi-variable integer arithmetic, and are vulnerable to prompt injection.*
> 
> *If an agent gets tricked into overpaying by just 1% across enterprise spend, that's catastrophic.*
> 
> *Welcome to **PactPay**: the world's first formal spend firewall for autonomous agent-to-agent commerce. Our core principle is simple: **LLMs can negotiate, but only formal mathematical solvers are allowed to sign and execute payments.**"*

---

### 0:30 - 1:15 | AG Grid Auction & Z3 Constraint Guidance

**Screen Action:**
- Click **"Scenario A: Enterprise Workstations Bundle"**.
- Point out the **Channel3 Real-Time Unbundled BATNA** column ($4,746.90) dynamically pulled from distributed retail feeds.
- Click **"Run Autonomous Procurement"**.
- Watch the AG Grid matrix illuminate as 3 vendor agents enter a reverse Dutch auction.
- Show the Z3 solver status badge turning green (`SAT - 11.9ms`).
- Highlight the negotiated landed spend: **$4,271.33**, generating **$475.57 in net savings (10.02%)**.

**Speaker Narration:**
> *"Here in our trading floor—built with AG Grid Enterprise—our CFO has set an AP2-style Intent Mandate: buy 10 AI workstations under a hard $4,600 budget with at least 5% savings below market retail.*
> 
> *PactPay first calls the **Channel3 API** to establish our unbundled BATNA baseline at $4,746.90. Then, our autonomous buyer agent initiates a multi-supplier reverse Dutch auction.*
> 
> *Behind every tick of this grid, the **Microsoft Z3 SMT solver** checks every candidate bundle down to the integer cent. When an agent submits a candidate bundle, Z3 solves the constraints in under 12 milliseconds.*
> 
> *Notice our winning bundle: $4,271.33 landed cost, locking in $475.57 in hard net savings—strictly within CFO policy."*

---

### 1:15 - 1:45 | The "Break-It" Box: Adversarial Defense

**Screen Action:**
- Scroll down to the **"Break-It" Red-Team Console**.
- Select **Attack 1: Budget Overflow (+$1.00 tampering)**.
- Click **"Execute Injection Attack"**.
- Show the instant crimson rejection banner: `[Z3 UNSAT] Violation: BudgetExceeded (Landed cost $4,601.00 > $4,600.00 cap)`.
- Highlight the `nearest_compliant()` suggestion displayed beneath the alert.

**Speaker Narration:**
> *"Now let's put our firewall to the test in the Break-It red-team console.*
> 
> *What if an adversarial agent tries a prompt injection or sneaks in a hidden surcharge that pushes the total spend to $4,601.00—just one single dollar over the CFO cap?*
> 
> *Watch what happens: Instant rejection. Z3 flags an unsat core violation: 'BudgetExceeded'. But more than that, Z3's optimizer computes the `nearest_compliant()` counter-offer, allowing our agent to converge to a compliant deal in just 2 negotiation rounds instead of failing."*

---

### 1:45 - 2:25 | Live PayPal Sandbox Settlement & Capture

**Screen Action:**
- Click **"Settle via PayPal"** on the compliant bundle.
- The **PayPal MCP Settlement Modal** opens, displaying:
  - Ed25519 Clearance Signature
  - Random Nonce: `nonce_7a8f...`
  - Order ID: `02136085R...`
- Click **"Open PayPal Sandbox Approval Link"**.
- Show the PayPal Sandbox checkout page with the exact **$4,271.33** total.
- Click **"Agree & Pay Now"**.
- Switch back to PactPay, click **"Capture Authorized Order"**.
- Show the modal updating to **Status: COMPLETED** with **FedEx Tracking Number: 794829103847**.

**Speaker Narration:**
> *"Once Z3 signs off, the firewall issues an Ed25519-signed clearance certificate with an RFC 8785 canonical digest and high-entropy cryptographic nonce.*
> 
> *The clearance certificate is handed to our air-gapped PayPal MCP Settlement Gate. Notice that the negotiating agents have zero access to API keys—only this isolated gate can talk to PayPal.*
> 
> *The gate calls PayPal's Orders v2 API via our APIMatic-modeled SDK. We click into the live PayPal Sandbox approval flow—authorized by the buyer—and hit Capture.*
> 
> *PayPal settles the transaction for the exact authorized amount, and automatically registers the carrier tracking number via PayPal Tracking v2."*

---

### 2:25 - 3:00 | Standalone CLI Verification & Wrap-Up

**Screen Action:**
- Switch to the terminal.
- Run: `python pactpay_verify.py receipt.json`
- Terminal outputs:
  ```text
  [PASS] Ed25519 Signature Verified (RFC 8032)
  [PASS] RFC 8785 Canonical JSON Hash Match
  [PASS] Budget Invariant Valid ($4,271.33 <= $4,600.00)
  [PASS] BATNA Savings Valid (10.02% >= 5.00%)
  STATUS: VERIFIED INDEPENDENTLY (0 external dependencies)
  ```
- Return to the browser UI summary.

**Speaker Narration:**
> *"Finally, zero-trust means independent verification. Anyone—auditors, CFOs, or hackathon judges—can take any PactPay receipt and run our standalone verifier script.*
> 
> *With zero external dependencies, it independently verifies the Ed25519 signature and re-computes the constraint arithmetic.*
> 
> *Across 120 benchmark evaluation runs, PactPay achieved a 0.00% False Acceptance Rate with a median 11.9-millisecond solve latency.*
> 
> *Plus, with our native FastMCP server, any external agent in Claude Desktop or Postman can invoke our BATNA discovery, Z3 firewall, and PayPal settlement directly over standard Model Context Protocol.*
> 
> *By bridging formal SMT logic, AP2 mandates, and PayPal's global payments rail, PactPay provides the ironclad foundation for the autonomous economy. Thank you!"*

---

## 💡 Quick Tips for Recording
1. **Screen Resolution:** Record at 1920x1080 (1080p).
2. **Audio:** Use a clean microphone with noise cancellation.
3. **Cursor:** Smooth mouse movements; keep the cursor near what is being discussed.
4. **Pacing:** Practice once before recording to hit the exact ~2m55s mark comfortably.
