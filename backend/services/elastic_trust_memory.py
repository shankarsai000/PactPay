"""Elastic Hybrid Vendor Trust Memory for PactPay.

Queries Elasticsearch index 'pactpay-vendor-trust' if ELASTICSEARCH_URL and ELASTIC_API_KEY
are configured. Provides a deterministic, zero-latency fallback dictionary for 3 B2B distributor
personas ensuring offline / demo execution works flawlessly without external API keys.
"""

from __future__ import annotations

import os
from typing import Any, Dict, List, Optional
import httpx


DEFAULT_SWARM_VENDORS: Dict[str, Dict[str, Any]] = {
    "MERCHANT_APEX_01": {
        "merchant_id": "MERCHANT_APEX_01",
        "merchant_name": "Apex Enterprise Supply",
        "trust_score": 94,
        "on_time_delivery_rate": 0.98,
        "dispute_rate": 0.01,
        "default_floor_ratio": 0.88,
        "default_attack": "NONE",
        "description": "Tier-1 Enterprise Hardware Partner with 99% SLA adherence",
    },
    "MERCHANT_GLOBALIT_02": {
        "merchant_id": "MERCHANT_GLOBALIT_02",
        "merchant_name": "GlobalIT Wholesale",
        "trust_score": 89,
        "on_time_delivery_rate": 0.95,
        "dispute_rate": 0.02,
        "default_floor_ratio": 0.84,
        "default_attack": "NONE",
        "description": "High-Volume Global IT Hardware Liquidator",
    },
    "MERCHANT_SHADOW_03": {
        "merchant_id": "MERCHANT_SHADOW_03",
        "merchant_name": "ShadowCorp Distributors",
        "trust_score": 61,
        "on_time_delivery_rate": 0.72,
        "dispute_rate": 0.14,
        "default_floor_ratio": 0.82,
        "default_attack": "HIDDEN_FREIGHT",
        "description": "Gray-Market Liquidator with Low Reputation & Hidden Surcharges",
    },
}

# Alias map for backwards compatibility with legacy vendor IDs
LEGACY_VENDOR_MAP: Dict[str, str] = {
    "VEN-NORTHSTAR-01": "MERCHANT_APEX_01",
    "VEN-APEX-02": "MERCHANT_SHADOW_03",
    "VEN-BEACON-03": "MERCHANT_GLOBALIT_02",
}


class ElasticVendorTrustService:
    """Hybrid Elasticsearch & Deterministic Fallback Vendor Trust Registry."""

    def __init__(
        self,
        elasticsearch_url: Optional[str] = None,
        api_key: Optional[str] = None,
    ) -> None:
        self.es_url = (elasticsearch_url or os.getenv("ELASTICSEARCH_URL", "")).rstrip("/")
        self.api_key = api_key or os.getenv("ELASTIC_API_KEY", "")
        self.index_name = "pactpay-vendor-trust"

    @property
    def is_elastic_configured(self) -> bool:
        return bool(self.es_url and self.api_key)

    def list_swarm_vendors(self) -> List[Dict[str, Any]]:
        """Returns the list of vendor profiles for the swarm auction."""
        return list(DEFAULT_SWARM_VENDORS.values())

    async def list_swarm_vendors_async(self) -> List[Dict[str, Any]]:
        """Asynchronously queries Elasticsearch if configured; falls back to deterministic swarm."""
        if not self.is_elastic_configured:
            return self.list_swarm_vendors()

        headers = {
            "Authorization": f"ApiKey {self.api_key}",
            "Content-Type": "application/json",
        }
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.post(
                    f"{self.es_url}/{self.index_name}/_search",
                    headers=headers,
                    json={"size": 10, "query": {"match_all": {}}},
                )
                if res.status_code == 200:
                    hits = res.json().get("hits", {}).get("hits", [])
                    if hits:
                        return [h["_source"] for h in hits]
        except Exception:
            pass
        return self.list_swarm_vendors()

    def get_vendor_profile(self, merchant_id: str) -> Dict[str, Any]:
        """Synchronously retrieves a vendor profile with zero latency from memory."""
        target_id = LEGACY_VENDOR_MAP.get(merchant_id, merchant_id)
        if target_id in DEFAULT_SWARM_VENDORS:
            return DEFAULT_SWARM_VENDORS[target_id].copy()

        return {
            "merchant_id": merchant_id,
            "merchant_name": f"Distributor {merchant_id}",
            "trust_score": 75,
            "on_time_delivery_rate": 0.90,
            "dispute_rate": 0.05,
            "default_floor_ratio": 0.86,
            "default_attack": "NONE",
            "description": "Unregistered B2B Supplier",
        }

    async def get_vendor_profile_async(self, merchant_id: str) -> Dict[str, Any]:
        """Asynchronously retrieves vendor profile from Elasticsearch, falling back to deterministic memory."""
        if not self.is_elastic_configured:
            return self.get_vendor_profile(merchant_id)

        target_id = LEGACY_VENDOR_MAP.get(merchant_id, merchant_id)
        headers = {
            "Authorization": f"ApiKey {self.api_key}",
            "Content-Type": "application/json",
        }
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.get(
                    f"{self.es_url}/{self.index_name}/_doc/{target_id}",
                    headers=headers,
                )
                if res.status_code == 200:
                    doc = res.json()
                    source = doc.get("_source")
                    if source:
                        return source
        except Exception:
            pass

        return self.get_vendor_profile(merchant_id)
