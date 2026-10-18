"""Google AP2-Aligned Buyer Agent for PactPay.

Formulates CFO Intent Mandates and evaluates Merchant Cart Mandates against
Channel3 BATNA and Z3 SMT guidance bounds.
"""

from __future__ import annotations

import time
import uuid
from typing import Any, Dict, Optional

from guardrails.crypto_utils import canonicalize_json, generate_keypair, hash_payload, sign_bytes


class BuyerAgent:
    """Enterprise Buyer Agent operating under a CFO Intent Mandate."""

    def __init__(self, cfo_private_key: Optional[bytes] = None) -> None:
        if cfo_private_key:
            self._sk = cfo_private_key
            from guardrails.crypto_utils import public_key_from_private
            self._pk = public_key_from_private(self._sk)
        else:
            self._sk, self._pk = generate_keypair()

    @property
    def public_key_hex(self) -> str:
        return self._pk.hex()

    def create_intent_mandate(
        self,
        *,
        query: str,
        max_budget_dollars: float = 4600.0,
        max_freight_ratio: float = 0.08,
        min_warranty_months: int = 12,
        destination_zip: str = "78701",
        quantity_monitors: int = 10,
        quantity_cables: int = 10,
        ttl_seconds: int = 3600,
    ) -> Dict[str, Any]:
        """Issues an AP2 Intent Mandate cryptographically signed by the corporate CFO."""
        now = int(time.time())
        mandate_id = f"MANDATE-CFO-{uuid.uuid4().hex[:6].upper()}"
        budget_cents = int(round(max_budget_dollars * 100))

        payload = {
            "mandate_id": mandate_id,
            "query": query,
            "destination_zip": destination_zip,
            "quantity_monitors": quantity_monitors,
            "quantity_cables": quantity_cables,
            "policy": {
                "max_budget_cents": budget_cents,
                "max_budget_dollars": max_budget_dollars,
                "max_freight_ratio": max_freight_ratio,
                "min_warranty_months": min_warranty_months,
                "payment_rail": "PAY_BY_BANK",
                "pay_by_bank_rebate_bps": 150,  # 1.5%
            },
            "created_at": now,
            "expires_at": now + ttl_seconds,
            "cfo_public_key": self.public_key_hex,
        }

        canonical_bytes = canonicalize_json(payload)
        sig = sign_bytes(self._sk, canonical_bytes)

        return {
            "mandate_payload": payload,
            "mandate_hash": hash_payload(payload),
            "signature": sig.hex(),
            "cfo_public_key": self.public_key_hex,
        }
