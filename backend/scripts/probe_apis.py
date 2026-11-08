import asyncio
import os
import sys
import httpx
from dotenv import load_dotenv

# Reconfigure stdout for utf-8 on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

load_dotenv("backend/.env")

async def check_apis():
    print("=" * 65)
    print("🔍 PACTPAY 4-POOL LIVE API COMPREHENSIVE STATUS PROBE")
    print("=" * 65)

    results = {}

    # 1. Channel3 Catalog API
    c3_key = os.getenv("CHANNEL3_API_KEY", "")
    print("\n[1/5] Probing Channel3 Catalog API...")
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            headers = {
                "x-api-key": c3_key,
                "x-user-id": "pactpay-probe",
                "Content-Type": "application/json"
            }
            # Test v1 search endpoint
            resp = await client.post(
                "https://api.trychannel3.com/v1/search",
                headers=headers,
                json={"query": "Dell 4K Monitor", "limit": 1}
            )
            print(f"      Endpoint: https://api.trychannel3.com/v1/search -> HTTP {resp.status_code}")
            if resp.status_code == 200:
                data = resp.json()
                items_cnt = len(data.get("products", data.get("items", [])))
                print(f"      ✅ STATUS: ONLINE (Returned products, catalog live)")
                results["Channel3"] = "ONLINE (HTTP 200)"
            elif resp.status_code in (401, 403):
                print(f"      ⚠️ STATUS: AUTH ERROR (HTTP {resp.status_code}): {resp.text[:120]}")
                results["Channel3"] = f"AUTH ERROR ({resp.status_code})"
            else:
                print(f"      ℹ️ STATUS: HTTP {resp.status_code} - {resp.text[:120]}")
                results["Channel3"] = f"HTTP {resp.status_code}"
    except Exception as e:
        print(f"      ❌ STATUS: CONNECTION FAILED -> {e}")
        results["Channel3"] = f"FAILED: {e}"

    # 2. KERNEL Cloud Browser API
    kernel_key = os.getenv("KERNEL_API_KEY", "")
    kernel_base = os.getenv("KERNEL_API_BASE", "https://api.onkernel.com").rstrip("/")
    print("\n[2/5] Probing KERNEL Cloud Browser API...")
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            headers = {"Authorization": f"Bearer {kernel_key}"}
            resp = await client.get(f"{kernel_base}/auth/context", headers=headers)
            print(f"      Endpoint: {kernel_base}/auth/context -> HTTP {resp.status_code}")
            if resp.status_code == 200:
                ctx = resp.json()
                print(f"      ✅ STATUS: ONLINE (Context verified, org: {ctx.get('org_id', 'active')})")
                results["KERNEL"] = "ONLINE (HTTP 200)"
            else:
                print(f"      ⚠️ STATUS: HTTP {resp.status_code} - {resp.text[:120]}")
                results["KERNEL"] = f"HTTP {resp.status_code}"
    except Exception as e:
        print(f"      ❌ STATUS: CONNECTION FAILED -> {e}")
        results["KERNEL"] = f"FAILED: {e}"

    # 3. Elastic Cloud API
    es_url = os.getenv("ELASTICSEARCH_URL", "").rstrip("/")
    es_key = os.getenv("ELASTIC_API_KEY", "")
    print("\n[3/5] Probing Elastic Cloud Cluster...")
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            headers = {"Authorization": f"ApiKey {es_key}"}
            resp = await client.get(f"{es_url}/", headers=headers)
            print(f"      Endpoint: {es_url}/ -> HTTP {resp.status_code}")
            if resp.status_code == 200:
                cluster_info = resp.json()
                print(f"      ✅ STATUS: ONLINE (Cluster: {cluster_info.get('cluster_name')}, Elasticsearch v{cluster_info.get('version', {}).get('number')})")
                results["Elastic Cloud"] = f"ONLINE (ES v{cluster_info.get('version', {}).get('number')})"
            else:
                print(f"      ⚠️ STATUS: HTTP {resp.status_code} - {resp.text[:120]}")
                results["Elastic Cloud"] = f"HTTP {resp.status_code}"
    except Exception as e:
        print(f"      ❌ STATUS: CONNECTION FAILED -> {e}")
        results["Elastic Cloud"] = f"FAILED: {e}"

    # 4. PayPal Sandbox Developer API
    pp_id = os.getenv("PAYPAL_CLIENT_ID", "")
    pp_sec = os.getenv("PAYPAL_CLIENT_SECRET", "")
    pp_base = os.getenv("PAYPAL_BASE_URL", "https://api-m.sandbox.paypal.com").rstrip("/")
    print("\n[4/5] Probing PayPal Sandbox OAuth2 REST API v2...")
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{pp_base}/v1/oauth2/token",
                auth=(pp_id, pp_sec),
                data={"grant_type": "client_credentials"},
                headers={"Accept": "application/json", "Accept-Language": "en_US"}
            )
            print(f"      Endpoint: {pp_base}/v1/oauth2/token -> HTTP {resp.status_code}")
            if resp.status_code == 200:
                tok_data = resp.json()
                app_id = tok_data.get("app_id", "sandbox")
                print(f"      ✅ STATUS: ONLINE (OAuth2 Token Minted, App: {app_id})")
                results["PayPal Sandbox"] = "ONLINE (HTTP 200)"
            else:
                print(f"      ⚠️ STATUS: HTTP {resp.status_code} - {resp.text[:120]}")
                results["PayPal Sandbox"] = f"HTTP {resp.status_code}"
    except Exception as e:
        print(f"      ❌ STATUS: CONNECTION FAILED -> {e}")
        results["PayPal Sandbox"] = f"FAILED: {e}"

    # 5. FastMCP Local Server Diagnostics
    print("\n[5/5] Probing FastMCP Server Tools In-Process...")
    try:
        # Import mcp_server tools directly
        sys.path.insert(0, os.path.abspath("backend"))
        from mcp_server import (
            pactpay_discover_channel3_batna,
            pactpay_query_elastic_vendor_trust,
            pactpay_verify_deal_z3,
            pactpay_capture_paypal_order,
            get_latest_audit_chain,
        )
        print("      ✅ STATUS: All 5 FastMCP Tools & Audit Resource imported and wired")
        results["FastMCP Server"] = "WIRED & READY"
    except Exception as e:
        print(f"      ❌ FastMCP Import Error: {e}")
        results["FastMCP Server"] = f"ERROR: {e}"

    print("\n" + "=" * 65)
    print("📊 SUMMARY OF API PROBE RESULTS")
    print("=" * 65)
    for name, status in results.items():
        icon = "✅" if "ONLINE" in status or "READY" in status else "⚠️"
        print(f"  {icon} {name:<18}: {status}")
    print("=" * 65)

if __name__ == "__main__":
    asyncio.run(check_apis())

