"""FastAPI Backend for PactPay Autonomous Procurement & Formal SMT Spend Guardrail Engine."""

from __future__ import annotations

import json
import uuid
from typing import Any, Dict, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sse_starlette.sse import EventSourceResponse

from agents.orchestrator import PactPayOrchestrator
from verify_receipt import verify_receipt

load_dotenv()

app = FastAPI(
    title="PactPay Autonomous A2A Procurement & SMT Guardrail Engine",
    version="2.0.0",
    description=(
        "Cryptographically gated B2B procurement protocol integrating AP2 Intent/Cart Mandates, "
        "Channel3 Landed BATNA Unbundling, Microsoft Z3 SMT Negotiation Oracle, and "
        "APIMatic-Generated PayPal REST v2 Settlement."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = PactPayOrchestrator()


class PolicyConfig(BaseModel):
    max_budget: float = Field(default=4600.0, ge=100.0)
    auto_order_limit: float = Field(default=2000.0, ge=0.0)
    max_freight_ratio: float = Field(default=0.08, ge=0.01, le=0.50)
    min_warranty_months: int = Field(default=12, ge=0)
    min_vendor_trust_score: int = Field(default=75, ge=0, le=100)


class AdversaryConfig(BaseModel):
    merchant_floor_ratio: float = Field(default=0.86, ge=0.60, le=1.25)
    attack_mode: str = Field(
        default="NONE",
        description="NONE | HIDDEN_FREIGHT | CROSS_SUBSIDY | PROMPT_INJECTION | QTY_BAIT_SWITCH",
    )
    custom_attack_text: Optional[str] = None
    max_rounds: int = Field(default=3, ge=1, le=5)
    swarm_mode: bool = Field(default=True)


class ProcurementRequest(BaseModel):
    session_id: Optional[str] = None
    scenario_mode: Optional[str] = "SCENARIO_A_COMPLIANT_WIN"
    query: str = Field(default="10x Dell UltraSharp 27 4K Monitors + 10x Thunderbolt 4 Pro Cables")
    requested_qty: int = Field(default=10, ge=1, le=100)
    policy: PolicyConfig = Field(default_factory=PolicyConfig)
    adversary: AdversaryConfig = Field(default_factory=AdversaryConfig)


class CaptureOrderRequest(BaseModel):
    order_id: str


class DisputeEvaluateRequest(BaseModel):
    dispute_id: str = Field(default="PP-D-94821")
    order_id: str = Field(default="02136085R83568202")
    canonical_payload: str = Field(default='{"quantity": 10, "unit_monitor_cents": 39685, "unit_cable_cents": 2562}')
    clearance_token: str = Field(default="hmac_sha256_z3_verified_token_8a92")
    delivered_qty: int = Field(default=10, ge=0)


class SubscriptionCreateRequest(BaseModel):
    plan_name: str = Field(default="PactPay Autonomous Compute Maintenance")
    monthly_amount: float = Field(default=499.00, gt=0.0)
    canonical_payload: str = Field(default='{"subscription_tier": "ENTERPRISE_MAINTENANCE", "monthly_amount": 499.00}')
    clearance_token: str = Field(default="hmac_sha256_z3_verified_token_8a92")


class BreakItRequest(BaseModel):
    custom_prompt: str = Field(..., description="Malicious merchant quote or override prompt to test")
    unit_monitor_dollars: float = Field(default=396.85)
    unit_cable_dollars: float = Field(default=25.62)
    freight_dollars: float = Field(default=850.0)
    vendor_trust_score: int = Field(default=90, ge=0, le=100)


JUDGE_PRESET_SCENARIOS: Dict[str, Dict[str, Any]] = {
    "SCENARIO_A_COMPLIANT_WIN": {
        "title": "Scenario A: Compliant Deal ($475.57 / 10.02% Savings Below BATNA -> PayPal Settlement)",
        "query": "10x Dell UltraSharp 27 4K Monitors + 10x Thunderbolt 4 Pro Cables",
        "requested_qty": 10,
        "scenario_mode": "SCENARIO_A_COMPLIANT_WIN",
        "description": "Z3 guides cable counter to $25.62, verifies all 6 invariants SAT, mints Ed25519 clearance certificate, and generates PayPal settlement.",
        "policy": {"max_budget": 4600.0, "auto_order_limit": 2000.0, "max_freight_ratio": 0.08, "min_warranty_months": 12},
        "adversary": {"merchant_floor_ratio": 0.86, "attack_mode": "NONE", "max_rounds": 2},
    },
    "SCENARIO_B_ADVERSARIAL_BLOCK": {
        "title": "Scenario B: Prompt Injection + $850 Hidden Freight (3 Invariants Red Blocked by Z3)",
        "query": "10x Dell UltraSharp 27 4K Monitors + 10x Thunderbolt 4 Pro Cables",
        "requested_qty": 10,
        "scenario_mode": "SCENARIO_B_ADVERSARIAL_BLOCK",
        "description": "Adversary injects policy override and $850 freight ($5,011.33 landed). Z3 formally flags INV_1, INV_2, and INV_3 UNSAT. Zero tokens minted.",
        "policy": {"max_budget": 4600.0, "auto_order_limit": 2000.0, "max_freight_ratio": 0.08, "min_warranty_months": 12},
        "adversary": {"merchant_floor_ratio": 0.86, "attack_mode": "PROMPT_INJECTION", "max_rounds": 1},
    },
    "SCENARIO_C_BATNA_WALKAWAY": {
        "title": "Scenario C: Stubborn Merchant > BATNA ($4,857.85 Landed -> Standing Order Watch)",
        "query": "10x Dell UltraSharp 27 4K Monitors + 10x Thunderbolt 4 Pro Cables",
        "requested_qty": 10,
        "scenario_mode": "SCENARIO_C_BATNA_WALKAWAY",
        "description": "Merchant refuses volume concessions. Buyer registers Channel3 /v0 webhook standing order to execute once compliant price drops occur.",
        "policy": {"max_budget": 4600.0, "auto_order_limit": 2000.0, "max_freight_ratio": 0.08, "min_warranty_months": 12},
        "adversary": {"merchant_floor_ratio": 1.05, "attack_mode": "NONE", "max_rounds": 1},
    },
}


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "pactpay-backend",
        "version": "2.0.0",
        "engines": [
            "channel3-v1-search-batna",
            "z3-smt-negotiation-oracle",
            "ed25519-rfc8032-firewall",
            "apimatic-paypal-sandbox-gate",
            "elastic-hybrid-vendor-trust",
        ],
        "firewall_public_key": orchestrator.oracle.public_key_hex,
    }


@app.get("/api/vendors")
async def list_swarm_vendors():
    """Lists swarm vendor distributor personas and their elastic trust profiles."""
    return {"vendors": orchestrator.trust_service.list_swarm_vendors()}


@app.get("/api/judge-presets")
async def get_judge_presets():
    return {
        "presets": JUDGE_PRESET_SCENARIOS,
        "reconciled_benchmark": {
            "cfo_budget_cap": 4600.00,
            "channel3_landed_batna": 4746.90,
            "compliant_landed_spend": 4271.33,
            "net_savings_dollars": 475.57,
            "net_savings_percentage": 10.02,
        },
    }


@app.post("/api/procure/run")
async def run_procurement_sync(req: ProcurementRequest):
    """Executes the complete multi-agent procurement session and returns the final state + receipt."""
    session_id = req.session_id or f"PROC-{uuid.uuid4().hex[:6].upper()}"
    events = []
    async for ev in orchestrator.stream_procurement_session(
        session_id=session_id,
        query=req.query,
        requested_qty=req.requested_qty,
        policy=req.policy.model_dump(),
        adversary_config=req.adversary.model_dump(),
        scenario_mode=req.scenario_mode or "SCENARIO_A_COMPLIANT_WIN",
    ):
        events.append(ev)

    final_result = events[-1]["data"]["result"] if events and events[-1]["event"] == "procurement_complete" else None
    return {"session_id": session_id, "events": events, "final_state": {"data": {"result": final_result}}}


@app.get("/api/procure/stream")
async def stream_procurement_sse(
    scenario: Optional[str] = "SCENARIO_A_COMPLIANT_WIN",
    requested_qty: int = 10,
    max_budget: float = 4600.0,
    merchant_floor_ratio: float = 0.86,
    attack_mode: str = "NONE",
):
    """SSE telemetry endpoint powering AG Grid real-time cell flashing and sparklines."""
    session_id = f"PROC-{uuid.uuid4().hex[:6].upper()}"
    query = "10x Dell UltraSharp 27 4K Monitors + 10x Thunderbolt 4 Pro Cables"
    policy = {
        "max_budget": max_budget,
        "auto_order_limit": 2000.0,
        "max_freight_ratio": 0.08,
        "min_warranty_months": 12,
    }
    adversary = {
        "merchant_floor_ratio": merchant_floor_ratio,
        "attack_mode": attack_mode,
        "max_rounds": 2,
    }

    async def event_generator():
        async for ev in orchestrator.stream_procurement_session(
            session_id=session_id,
            query=query,
            requested_qty=requested_qty,
            policy=policy,
            adversary_config=adversary,
            scenario_mode=scenario or "SCENARIO_A_COMPLIANT_WIN",
        ):
            yield {"event": ev["event"], "data": json.dumps(ev)}

    return EventSourceResponse(event_generator())


@app.post("/api/paypal/capture")
async def capture_paypal_order(req: CaptureOrderRequest):
    """Captures approved PayPal order via APIMatic client and registers shipment tracking."""
    try:
        result = await orchestrator.paypal_gate.capture_approved_order(
            order_id=req.order_id,
        )
        return result
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/api/paypal/disputes/evaluate")
async def evaluate_paypal_dispute(req: DisputeEvaluateRequest):
    """Auto-defends or resolves dispute based on immutable Z3 quantity & clearance verification."""
    try:
        return await orchestrator.paypal_gate.auto_defend_or_resolve_dispute(
            dispute_id=req.dispute_id,
            order_id=req.order_id,
            canonical_payload=req.canonical_payload,
            clearance_token=req.clearance_token,
            delivered_qty=req.delivered_qty,
        )
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/api/paypal/subscriptions/create")
async def create_paypal_subscription(req: SubscriptionCreateRequest):
    """Creates a recurring B2B billing subscription verified by Z3 clearance."""
    try:
        return await orchestrator.paypal_gate.create_recurring_b2b_subscription(
            plan_name=req.plan_name,
            monthly_amount=req.monthly_amount,
            canonical_payload=req.canonical_payload,
            clearance_token=req.clearance_token,
        )
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.get("/api/paypal/reporting/insights")
async def get_paypal_reporting_insights():
    """Provides executive CFO reporting telemetry across all 7 PayPal Agent Toolkit domains."""
    try:
        return await orchestrator.paypal_gate.get_cfo_reporting_insights()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/break-it")
async def break_it_simulation(req: BreakItRequest):
    """Interactive Break-It Box: Evaluates arbitrary malicious prompts or custom quotes in Z3."""
    u_mon = int(round(req.unit_monitor_dollars * 100))
    u_cab = int(round(req.unit_cable_dollars * 100))
    freight = int(round(req.freight_dollars * 100))

    sanitization = orchestrator.sanitizer.sanitize(req.custom_prompt)
    audit = orchestrator.oracle.diagnose(
        u_mon_cents=u_mon,
        u_cab_cents=u_cab,
        freight_cents=freight,
        budget_cents=460_000,
        batna_cents=474_690,
        warranty_months=36,
        schema_validated=True,
        pay_by_bank=True,
        vendor_trust_score=req.vendor_trust_score,
    )

    nearest = None
    if not audit["verified"]:
        nearest = orchestrator.oracle.nearest_compliant(
            u_mon_cents=u_mon,
            u_cab_cents=u_cab,
            freight_cents=freight,
            budget_cents=460_000,
            batna_cents=474_690,
        )

    return {
        "verified": audit["verified"],
        "status": audit["status"],
        "failed_invariants": audit["failed_invariants"],
        "proof_trace": audit["proof_trace"],
        "economics": audit["economics"],
        "sanitization": {
            "blocked": sanitization.blocked,
            "reasons": sanitization.reasons,
        },
        "nearest_compliant_counter": (
            {"unit_monitor": nearest[0] / 100.0, "unit_cable": nearest[1] / 100.0} if nearest else None
        ),
    }


@app.post("/api/receipt/verify")
async def verify_receipt_endpoint(receipt: Dict[str, Any]):
    """Runs the independent zero-dependency Python verifier on an uploaded receipt."""
    is_valid = verify_receipt(receipt)
    return {"verified": is_valid, "status": "VERIFIED" if is_valid else "FAILED"}
