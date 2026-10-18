"""Microsoft Z3 SMT Constraint Solver & Negotiation Oracle for PactPay.

Models procurement economics strictly in integer cents with formal SMT invariants,
detailed per-invariant diagnosis, and optimal nearest-compliant counter calculation.
When verified SAT, mints an Ed25519-signed clearance certificate with RFC 8785 canonicalization.
"""

from __future__ import annotations

import secrets
import time
import uuid
from typing import Any, Dict, List, Optional, Tuple
from z3 import Int, Optimize, Solver, sat, unsat

from guardrails.crypto_utils import (
    canonicalize_json,
    generate_keypair,
    hash_payload,
    sign_bytes,
)


class Z3ProcurementOracle:
    """Z3 Formal SMT solver acting as the spend firewall and negotiation oracle."""

    def __init__(self, private_key: Optional[bytes] = None) -> None:
        if private_key:
            self._sk = private_key
            from guardrails.crypto_utils import public_key_from_private
            self._pk = public_key_from_private(self._sk)
        else:
            self._sk, self._pk = generate_keypair()

    @property
    def public_key_hex(self) -> str:
        return self._pk.hex()

    @staticmethod
    def _floor_discount_constraints(disc, sub, rate_numerator=15, rate_denominator=1000):
        """disc = floor(1.5% of sub) in integer cents."""
        # disc <= sub * 15 / 1000 < disc + 1
        return [
            disc * rate_denominator <= sub * rate_numerator,
            sub * rate_numerator < disc * rate_denominator + rate_denominator,
        ]

    def build_symbolic_system(
        self,
        *,
        budget_cents: int,
        batna_cents: int,
        monitor_cap_cents: int = 44_590,
        cable_cap_cents: int = 2_879,
        qty_mon: int = 10,
        qty_cab: int = 10,
        freight_cap_pct: int = 8,
        pay_by_bank: bool = True,
    ):
        """Constructs Z3 symbolic variables, subtotal, landed cost, and named invariant rules."""
        u_mon = Int("u_mon")
        u_cab = Int("u_cab")
        freight = Int("freight")
        disc = Int("disc")

        sub = qty_mon * u_mon + qty_cab * u_cab
        landed = sub - disc + freight

        floor_rules = self._floor_discount_constraints(disc, sub) if pay_by_bank else [disc == 0]

        rules = {
            "INV_1_BUDGET_CAP": landed <= budget_cents,
            "INV_2_BEATS_BATNA": landed < batna_cents,
            "INV_3_FREIGHT_CAP_8PCT": freight * 100 <= sub * freight_cap_pct,
            "INV_6A_MONITOR_NO_SUBSIDY": u_mon <= monitor_cap_cents,
            "INV_6A_CABLE_NO_SUBSIDY": u_cab <= cable_cap_cents,
        }

        return {
            "u_mon": u_mon,
            "u_cab": u_cab,
            "freight": freight,
            "disc": disc,
            "sub": sub,
            "landed": landed,
            "floor_rules": floor_rules,
            "rules": rules,
        }

    def diagnose(
        self,
        *,
        u_mon_cents: int,
        u_cab_cents: int,
        freight_cents: int,
        budget_cents: int = 460_000,
        batna_cents: int = 474_690,
        monitor_cap_cents: int = 44_590,
        cable_cap_cents: int = 2_879,
        qty_mon: int = 10,
        qty_cab: int = 10,
        warranty_months: int = 36,
        min_warranty_months: int = 12,
        schema_validated: bool = True,
        pay_by_bank: bool = True,
    ) -> Dict[str, Any]:
        """Formally evaluates every invariant in SMT logic. Returns pass/fail and expressions."""
        sys = self.build_symbolic_system(
            budget_cents=budget_cents,
            batna_cents=batna_cents,
            monitor_cap_cents=monitor_cap_cents,
            cable_cap_cents=cable_cap_cents,
            qty_mon=qty_mon,
            qty_cab=qty_cab,
            pay_by_bank=pay_by_bank,
        )

        proof_trace = []
        failed_invariants = []

        # 1. Evaluate Z3 arithmetic rules
        for name, rule in sys["rules"].items():
            s = Solver()
            s.add(
                *sys["floor_rules"],
                sys["u_mon"] == u_mon_cents,
                sys["u_cab"] == u_cab_cents,
                sys["freight"] == freight_cents,
                rule,
            )
            passed = s.check() == sat
            status = "SAT" if passed else "UNSAT"
            if not passed:
                failed_invariants.append(name)

            sub_val = qty_mon * u_mon_cents + qty_cab * u_cab_cents
            disc_val = (sub_val * 15 // 1000) if pay_by_bank else 0
            landed_val = sub_val - disc_val + freight_cents

            # Readable expression for proof trace
            expr = ""
            if name == "INV_1_BUDGET_CAP":
                expr = f"${landed_val/100:.2f} <= ${budget_cents/100:.2f}"
            elif name == "INV_2_BEATS_BATNA":
                expr = f"${landed_val/100:.2f} < ${batna_cents/100:.2f}"
            elif name == "INV_3_FREIGHT_CAP_8PCT":
                ratio = (freight_cents / sub_val * 100) if sub_val else 100
                expr = f"{ratio:.2f}% <= 8.00% (freight ${freight_cents/100:.2f} / subtotal ${sub_val/100:.2f})"
            elif name == "INV_6A_MONITOR_NO_SUBSIDY":
                expr = f"${u_mon_cents/100:.2f} <= ${monitor_cap_cents/100:.2f}"
            elif name == "INV_6A_CABLE_NO_SUBSIDY":
                expr = f"${u_cab_cents/100:.2f} <= ${cable_cap_cents/100:.2f}"

            proof_trace.append({
                "invariant": name,
                "expression": expr,
                "passed": passed,
                "status": status,
            })

        # 2. Non-arithmetic formal checks: Warranty & Schema Validation
        warranty_passed = warranty_months >= min_warranty_months
        if not warranty_passed:
            failed_invariants.append("INV_4_MIN_WARRANTY")
        proof_trace.append({
            "invariant": "INV_4_MIN_WARRANTY",
            "expression": f"{warranty_months} mos >= {min_warranty_months} mos required",
            "passed": warranty_passed,
            "status": "SAT" if warranty_passed else "UNSAT",
        })

        schema_passed = bool(schema_validated)
        if not schema_passed:
            failed_invariants.append("INV_5_SCHEMA_VALIDATED_FIELDS")
        proof_trace.append({
            "invariant": "INV_5_SCHEMA_VALIDATED_FIELDS",
            "expression": "All pricing terms extracted from typed schema-validated numeric fields",
            "passed": schema_passed,
            "status": "SAT" if schema_passed else "UNSAT",
        })

        all_passed = len(failed_invariants) == 0

        # Exact dollar and savings calculations
        sub_cents = qty_mon * u_mon_cents + qty_cab * u_cab_cents
        rebate_cents = (sub_cents * 15 // 1000) if pay_by_bank else 0
        landed_cents = sub_cents - rebate_cents + freight_cents
        savings_cents = max(0, batna_cents - landed_cents) if all_passed else 0

        return {
            "verified": all_passed,
            "status": "sat" if all_passed else "unsat",
            "failed_invariants": failed_invariants,
            "proof_trace": proof_trace,
            "economics": {
                "unit_monitor_cents": u_mon_cents,
                "unit_cable_cents": u_cab_cents,
                "freight_cents": freight_cents,
                "subtotal_cents": sub_cents,
                "pay_by_bank_rebate_cents": rebate_cents,
                "landed_cents": landed_cents,
                "savings_cents": savings_cents,
                "savings_dollars": round(savings_cents / 100, 2),
                "savings_pct": round(savings_cents / batna_cents * 100, 2) if batna_cents else 0.0,
            },
        }

    def nearest_compliant(
        self,
        *,
        u_mon_cents: int,
        u_cab_cents: int,
        freight_cents: int,
        budget_cents: int = 460_000,
        batna_cents: int = 474_690,
        monitor_cap_cents: int = 44_590,
        cable_cap_cents: int = 2_879,
        qty_mon: int = 10,
        qty_cab: int = 10,
        pay_by_bank: bool = True,
    ) -> Optional[Tuple[int, int]]:
        """Smallest total unit-price L1 adjustment that satisfies all invariants."""
        sys = self.build_symbolic_system(
            budget_cents=budget_cents,
            batna_cents=batna_cents,
            monitor_cap_cents=monitor_cap_cents,
            cable_cap_cents=cable_cap_cents,
            qty_mon=qty_mon,
            qty_cab=qty_cab,
            pay_by_bank=pay_by_bank,
        )

        dm, dc = Int("dm"), Int("dc")
        opt = Optimize()
        opt.add(*sys["floor_rules"], *sys["rules"].values(), sys["freight"] == freight_cents)
        opt.add(
            dm >= sys["u_mon"] - u_mon_cents,
            dm >= u_mon_cents - sys["u_mon"],
            dc >= sys["u_cab"] - u_cab_cents,
            dc >= u_cab_cents - sys["u_cab"],
        )
        opt.minimize(dm + dc)
        if opt.check() != sat:
            return None
        model = opt.model()
        return model[sys["u_mon"]].as_long(), model[sys["u_cab"]].as_long()

    def mint_clearance_certificate(
        self,
        *,
        mandate_id: str,
        mandate_hash: str,
        deal_hash: str,
        channel3_snapshot_hash: str,
        audit_diagnosis: Dict[str, Any],
        vendor_id: str,
        ttl_seconds: int = 900,
    ) -> Dict[str, Any]:
        """Mints an Ed25519-signed clearance certificate if and only if Z3 status is SAT."""
        if not audit_diagnosis["verified"]:
            raise ValueError("Cannot mint clearance certificate for UNSAT audit")

        now = int(time.time())
        nonce = f"nonce_{secrets.token_hex(16)}"

        payload = {
            "mandate_id": mandate_id,
            "mandate_hash": mandate_hash,
            "deal_hash": deal_hash,
            "channel3_snapshot_hash": channel3_snapshot_hash,
            "vendor_id": vendor_id,
            "economics": audit_diagnosis["economics"],
            "invariants_passed": [p["invariant"] for p in audit_diagnosis["proof_trace"] if p["passed"]],
            "nonce": nonce,
            "issued_at": now,
            "expires_at": now + ttl_seconds,
            "signer_public_key": self.public_key_hex,
        }

        canonical_bytes = canonicalize_json(payload)
        sig = sign_bytes(self._sk, canonical_bytes)

        return {
            "certificate_payload": payload,
            "certificate_hash": hash_payload(payload),
            "signature": sig.hex(),
            "signer_public_key": self.public_key_hex,
        }
