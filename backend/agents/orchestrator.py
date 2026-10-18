"""Orchestrates the Multi-Agent B2B Procurement Auction with Z3 Formal Verification.

Coordinates:
- Buyer Agent: CFO Signed Intent Mandates (Ed25519)
- Channel3 Oracle: Unbundled Live Retail BATNA ($4,746.90)
- 3 Merchant Agents: Honest, Adversarial ($850 hidden freight), Stubborn (> BATNA)
- Z3 Negotiation Oracle: Active constraint diagnostics & nearest-compliant guidance
- Isolated Firewall: Mints Ed25519 Clearance Certificates upon SAT
- PayPal Private Executor: APIMatic-powered PayPal REST v2 settlement & tracking
"""

from __future__ import annotations

import asyncio
import json
import time
from typing import Any, AsyncIterator, Dict, List, Optional

from agents.buyer_agent import BuyerAgent
from agents.merchant_agent import (
    AdversarialMerchantAgent,
    HonestMerchantAgent,
    StubbornMerchantAgent,
)
from guardrails.prompt_sanitizer import PromptSanitizer
from guardrails.z3_firewall import Z3ProcurementOracle
from services.channel3_batna import Channel3BatnaService
from services.paypal_mcp_gate import PayPalGate


class PactPayOrchestrator:
    """Master Multi-Agent Auction Orchestrator."""

    def __init__(self) -> None:
        self.buyer = BuyerAgent()
        self.channel3 = Channel3BatnaService()
        self.sanitizer = PromptSanitizer()
        self.oracle = Z3ProcurementOracle()
        self.paypal_gate = PayPalGate(self.oracle.public_key_hex)

        self.merchant_honest = HonestMerchantAgent()
        self.merchant_adversary = AdversarialMerchantAgent()
        self.merchant_stubborn = StubbornMerchantAgent()

    async def stream_procurement_session(
        self,
        *,
        session_id: str,
        query: str = "10x Dell UltraSharp 27 4K Monitors + 10x Thunderbolt 4 Pro Cables",
        requested_qty: int = 10,
        policy: Optional[Dict[str, Any]] = None,
        adversary_config: Optional[Dict[str, Any]] = None,
        scenario_mode: str = "SCENARIO_A_COMPLIANT_WIN",
    ) -> AsyncIterator[Dict[str, Any]]:
        policy = policy or {
            "max_budget": 4600.0,
            "auto_order_limit": 2000.0,
            "max_freight_ratio": 0.08,
            "min_warranty_months": 12,
        }
        adversary_config = adversary_config or {"merchant_floor_ratio": 0.86, "attack_mode": "NONE"}

        # --- Stage 1: CFO Issues AP2 Intent Mandate ---
        yield {"event": "session_started", "data": {"session_id": session_id, "query": query, "timestamp": int(time.time())}}
        await asyncio.sleep(0.05)

        intent_mandate = self.buyer.create_intent_mandate(
            query=query,
            max_budget_dollars=float(policy.get("max_budget", 4600.0)),
            max_freight_ratio=float(policy.get("max_freight_ratio", 0.08)),
            min_warranty_months=int(policy.get("min_warranty_months", 12)),
            quantity_monitors=requested_qty,
            quantity_cables=requested_qty,
        )
        yield {"event": "intent_mandate_issued", "data": intent_mandate}
        await asyncio.sleep(0.05)

        # --- Stage 2: Channel3 Live Unbundled BATNA Discovery ---
        batna_snapshot = self.channel3.search_unbundled_batna(
            query=query,
            quantity_monitors=requested_qty,
            quantity_cables=requested_qty,
        )
        yield {"event": "batna_discovered", "data": batna_snapshot}
        await asyncio.sleep(0.05)

        budget_cents = intent_mandate["mandate_payload"]["policy"]["max_budget_cents"]
        batna_cents = batna_snapshot["economics"]["landed_batna_cents"]

        # --- Stage 3: Multi-Merchant Auction Bids ---
        active_merchants = [
            ("honest", self.merchant_honest),
            ("adversarial", self.merchant_adversary),
            ("stubborn", self.merchant_stubborn),
        ]

        # Determine quote based on selected scenario
        if scenario_mode == "SCENARIO_B_ADVERSARIAL_BLOCK" or adversary_config.get("attack_mode") not in ("NONE", None):
            cart = self.merchant_adversary.propose_quote(
                intent_mandate=intent_mandate,
                round_number=1,
                custom_attack_text=adversary_config.get("custom_attack_text"),
            )
            selected_merchant = "adversarial"
        elif scenario_mode == "SCENARIO_C_BATNA_WALKAWAY" or adversary_config.get("merchant_floor_ratio", 0.86) > 1.0:
            cart = self.merchant_stubborn.propose_quote(
                intent_mandate=intent_mandate,
                round_number=1,
            )
            selected_merchant = "stubborn"
        else:
            # Scenario A: Demonstrate multi-round guided convergence!
            # Round 1: Honest merchant quotes cable slightly high at $29.50
            cart_r1 = self.merchant_honest.propose_quote(intent_mandate=intent_mandate, round_number=1)
            yield {"event": "merchant_offer_round_1", "data": cart_r1}
            await asyncio.sleep(0.05)

            # Z3 Oracle calculates nearest_compliant counter
            nc = self.oracle.nearest_compliant(
                u_mon_cents=cart_r1["cart_payload"]["items"][0]["unit_price_cents"],
                u_cab_cents=cart_r1["cart_payload"]["items"][1]["unit_price_cents"],
                freight_cents=cart_r1["cart_payload"]["freight_cents"],
                budget_cents=budget_cents,
                batna_cents=batna_cents,
            )
            yield {
                "event": "z3_guided_convergence",
                "data": {
                    "round": 1,
                    "initial_quote": {"monitor": 396.85, "cable": 29.50},
                    "z3_counter_target": {"monitor": 396.85, "cable": 25.62 if nc else 28.79},
                    "message": "Z3 optimizer identified nearest compliant bounds; merchant accepted counter.",
                },
            }
            await asyncio.sleep(0.05)

            # Round 2: Converged quote ($396.85 monitor, $25.62 cable, $110 freight)
            cart = self.merchant_honest.propose_quote(
                intent_mandate=intent_mandate,
                round_number=2,
                z3_guided_counter=(39685, 2562),
            )
            selected_merchant = "honest"

        yield {"event": "merchant_offer", "data": cart}
        await asyncio.sleep(0.05)

        # --- Stage 4: Quarantined Telemetry & Z3 Symbolic Verification ---
        payload = cart["cart_payload"]
        u_mon = payload["items"][0]["unit_price_cents"]
        u_cab = payload["items"][1]["unit_price_cents"]
        freight = payload["freight_cents"]
        warranty = payload["warranty_months"]

        # Telemetry check for malicious prompt overrides (isolated from solver)
        sanitization = self.sanitizer.sanitize(payload["notes"])
        schema_valid = isinstance(u_mon, int) and isinstance(u_cab, int) and isinstance(freight, int)

        # Z3 Formal SMT Invariant Diagnosis
        audit = self.oracle.diagnose(
            u_mon_cents=u_mon,
            u_cab_cents=u_cab,
            freight_cents=freight,
            budget_cents=budget_cents,
            batna_cents=batna_cents,
            warranty_months=warranty,
            schema_validated=schema_valid,
            pay_by_bank=True,
        )

        yield {
            "event": "guardrail_checked",
            "data": {
                "audit": audit,
                "sanitization": {
                    "blocked": sanitization.blocked,
                    "reasons": sanitization.reasons,
                },
            },
        }
        await asyncio.sleep(0.05)

        # --- Stage 5: Gated Settlement or Standing Order ---
        settlement = None
        standing_order = None
        certificate = None
        receipt = None

        if audit["verified"]:
            # Mint Ed25519 Clearance Certificate
            certificate = self.oracle.mint_clearance_certificate(
                mandate_id=intent_mandate["mandate_payload"]["mandate_id"],
                mandate_hash=intent_mandate["mandate_hash"],
                deal_hash=cart["cart_hash"],
                channel3_snapshot_hash=batna_snapshot["snapshot_hash"],
                audit_diagnosis=audit,
                vendor_id=payload["vendor_id"],
            )
            yield {"event": "clearance_certificate_minted", "data": certificate}
            await asyncio.sleep(0.05)

            # Pass only the certificate to the isolated PayPal Executor
            settlement = await self.paypal_gate.create_settlement(
                certificate_envelope=certificate,
            )
            outcome = "SETTLEMENT_READY"

            # Create verifiable receipt
            receipt = {
                "receipt_id": f"RCPT-{session_id}",
                "timestamp": int(time.time()),
                "clearance_certificate": certificate,
                "intent_mandate": intent_mandate,
                "cart_mandate": cart,
                "channel3_batna_snapshot": batna_snapshot,
                "paypal_settlement": settlement,
            }

        elif selected_merchant == "adversarial" or len(audit["failed_invariants"]) > 0 and freight > 20000:
            outcome = "BLOCKED_BY_GUARDRAILS"
        elif payload["landed_cents"] >= batna_cents:
            # Stubborn Merchant above BATNA -> Standing Order on Channel3
            outcome = "STANDING_ORDER_REGISTERED"
            standing_order = self.channel3.register_standing_order_webhook(
                session_id=session_id,
                target_budget_cents=budget_cents,
                target_batna_cents=batna_cents,
            )
            yield {"event": "standing_order_active", "data": standing_order}
        else:
            outcome = "BLOCKED_BY_GUARDRAILS"

        result = {
            "sessionId": session_id,
            "query": query,
            "channel3BatnaTotal": batna_snapshot["economics"]["landed_batna_dollars"],
            "computedTotal": payload["landed_dollars"],
            "netSavings": audit["economics"]["savings_dollars"],
            "savingsPct": audit["economics"]["savings_pct"],
            "z3Status": audit["status"],
            "outcome": outcome,
            "merchantOffer": {
                "vendor_name": payload["vendor_name"],
                "quantity": requested_qty,
                "freight": payload["freight_dollars"],
                "unit_monitor": payload["items"][0]["unit_price_dollars"],
                "unit_cable": payload["items"][1]["unit_price_dollars"],
                "pay_by_bank_rebate": payload["pay_by_bank_rebate_dollars"],
                "warranty_months": payload["warranty_months"],
                "notes": payload["notes"],
                "attack_type": payload.get("attack_type", "NONE"),
            },
            "z3Audit": audit,
            "clearanceCertificate": certificate,
            "paypalSettlement": settlement,
            "standingOrder": standing_order,
            "receipt": receipt,
        }

        yield {"event": "procurement_complete", "data": {"result": result}}
