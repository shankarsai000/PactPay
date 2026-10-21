"""APIMatic PayPal Validator and Idempotency Generator."""
from __future__ import annotations

import uuid
from typing import Any, Dict, List, Optional


class APIMaticPayPalValidator:
    """Validates PayPal v2 breakdown arithmetic and builds deterministic idempotency headers."""

    @staticmethod
    def build_idempotency_headers(entropy_seed: str) -> Dict[str, str]:
        """Derives a deterministic RFC 9562 UUIDv5 idempotency key for PayPal-Request-Id."""
        key = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"pactpay:paypal:{entropy_seed}"))
        return {
            "PayPal-Request-Id": key,
            "Content-Type": "application/json",
        }

    @staticmethod
    def validate_and_format_order_payload(
        line_items: List[Dict[str, Any]],
        shipping_fee: float,
        tax_estimate: float = 0.0,
        bank_discount_pct: float = 0.0,
        currency: str = "USD",
    ) -> Dict[str, Any]:
        """Strictly enforces item_total + shipping + tax_total - discount == value in 2 decimal places."""
        item_total_cents = 0
        items_payload = []

        for it in line_items:
            unit_price = float(it.get("offered_unit_price") or it.get("unit_price_dollars") or it.get("unit_price_cents", 0) / 100.0)
            qty = int(it.get("offered_qty") or it.get("quantity") or 1)
            item_total_cents += int(round(unit_price * 100)) * qty
            items_payload.append({
                "name": it.get("sku_name") or it.get("title") or "Enterprise SKU",
                "quantity": str(qty),
                "unit_amount": {
                    "currency_code": currency,
                    "value": f"{unit_price:.2f}",
                },
            })

        item_total = round(item_total_cents / 100.0, 2)
        shipping = round(shipping_fee, 2)
        tax = round(tax_estimate, 2)
        
        # Calculate discount
        discount = 0.0
        if bank_discount_pct > 0:
            discount = round((item_total * bank_discount_pct) / 100.0, 2)

        # grand total must satisfy PayPal strict breakdown rule:
        # value == item_total + shipping + tax_total - discount
        grand_total = round(item_total + shipping + tax - discount, 2)

        return {
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "reference_id": "default",
                    "amount": {
                        "currency_code": currency,
                        "value": f"{grand_total:.2f}",
                        "breakdown": {
                            "item_total": {
                                "currency_code": currency,
                                "value": f"{item_total:.2f}",
                            },
                            "shipping": {
                                "currency_code": currency,
                                "value": f"{shipping:.2f}",
                            },
                            "tax_total": {
                                "currency_code": currency,
                                "value": f"{tax:.2f}",
                            },
                            "discount": {
                                "currency_code": currency,
                                "value": f"{discount:.2f}",
                            },
                        },
                    },
                    "items": items_payload,
                }
            ],
        }
