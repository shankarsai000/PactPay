import asyncio
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

ES_URL = os.getenv("ELASTICSEARCH_URL", "").rstrip("/")
ES_KEY = os.getenv("ELASTIC_API_KEY", "")

VENDOR_TELEMETRY_DOCS = [
    {"merchant_id": "MERCHANT_B2B_01", "merchant_name": "Apex Enterprise Supply", "on_time_pct": 0.98, "dispute_rate": 0.01, "category": "IT_HARDWARE"},
    {"merchant_id": "MERCHANT_B2B_01", "merchant_name": "Apex Enterprise Supply", "on_time_pct": 0.97, "dispute_rate": 0.01, "category": "PERIPHERALS"},
    {"merchant_id": "MERCHANT_GLOBALIT_02", "merchant_name": "GlobalIT Wholesale", "on_time_pct": 0.95, "dispute_rate": 0.02, "category": "IT_HARDWARE"},
    {"merchant_id": "MERCHANT_SHADOW_03", "merchant_name": "ShadowCorp Distributors", "on_time_pct": 0.72, "dispute_rate": 0.14, "category": "IT_HARDWARE"},
]


async def seed_elastic():
    if not ES_URL or not ES_KEY:
        print("ELASTICSEARCH_URL or ELASTIC_API_KEY not set in .env. Skipping remote seed (local cache remains active).")
        return

    headers = {"Authorization": f"ApiKey {ES_KEY}", "Content-Type": "application/json"}
    async with httpx.AsyncClient(timeout=15.0) as client:
        for doc in VENDOR_TELEMETRY_DOCS:
            try:
                resp = await client.post(f"{ES_URL}/pactpay-vendor-telemetry/_doc", headers=headers, json=doc)
                print(f"Seeded {doc['merchant_id']} -> HTTP {resp.status_code}")
            except Exception as e:
                print(f"Failed to seed {doc['merchant_id']}: {e}")

        try:
            await client.post(f"{ES_URL}/pactpay-vendor-telemetry/_refresh", headers=headers)
            print("Elastic Cloud index `pactpay-vendor-telemetry` refreshed and ready for ES|QL!")
        except Exception as e:
            print(f"Index refresh response: {e}")


if __name__ == "__main__":
    asyncio.run(seed_elastic())
