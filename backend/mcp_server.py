"""PactPay Model Context Protocol (MCP) Server.

Exposes PactPay's entire Neuro-Symbolic procurement and PayPal settlement pipeline
as a standard Model Context Protocol (MCP) Server for LLM agents, Claude Desktop, and Postman.

### Claude Desktop Configuration Snippet (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "pactpay": {
      "command": "python",
      "args": ["-m", "backend.mcp_server"],
      "env": {
        "PAYPAL_CLIENT_ID": "your_sandbox_client_id",
        "PAYPAL_CLIENT_SECRET": "your_sandbox_secret",
        "CHANNEL3_API_KEY": "optional_c3_key"
      }
    }
  }
}
```

### Postman MCP Inspector Connection:
Connect via Postman or MCP Inspector via command:
```bash
npx @modelcontextprotocol/inspector python backend/mcp_server.py
```
"""


import asyncio
import json
import os
import sys
import uuid
from typing import Any, Dict, Optional

# Ensure backend root is in sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from agents.orchestrator import PactPayOrchestrator
from guardrails.prompt_sanitizer import PromptSanitizer
from guardrails.z3_firewall import Z3SymbolicFirewall
from services.channel3_batna import Channel3BatnaService
from services.paypal_mcp_gate import CryptographicPayPalGate

# ---------------------------------------------------------------------------
# FastMCP Initialization with Native SDK or Zero-Dependency Stdio Fallback
# ---------------------------------------------------------------------------
try:
    from mcp.server.fastmcp import FastMCP  # type: ignore # pyright: ignore[reportMissingImports]
    HAS_FASTMCP = True
except (ImportError, Exception):
    HAS_FASTMCP = False

    class FastMCP:  # type: ignore[no-redef]
        """Fallback FastMCP implementation providing standard JSON-RPC 2.0 stdio server and CLI runner."""

        def __init__(self, name: str) -> None:
            self.name = name
            self._tools: Dict[str, Any] = {}

        def tool(self):
            def decorator(fn):
                self._tools[fn.__name__] = fn
                return fn
            return decorator

        def _generate_input_schema(self, fn: Any) -> Dict[str, Any]:
            """Derives an OpenAPI-compatible JSON input schema from function signatures."""
            import inspect
            sig = inspect.signature(fn)
            properties: Dict[str, Any] = {}
            required: list[str] = []

            for p_name, p in sig.parameters.items():
                p_type = "string"
                if p.annotation in (int, "int"):
                    p_type = "integer"
                elif p.annotation in (float, "float"):
                    p_type = "number"
                elif p.annotation in (bool, "bool"):
                    p_type = "boolean"
                elif p.annotation in (dict, "dict", Dict[str, Any]):
                    p_type = "object"

                prop_def: Dict[str, Any] = {"type": p_type}
                if p.default is not inspect.Parameter.empty:
                    prop_def["default"] = p.default
                else:
                    required.append(p_name)
                properties[p_name] = prop_def

            return {
                "type": "object",
                "properties": properties,
                "required": required,
            }

        def run(self, transport: str = "stdio"):
            """Lightweight JSON-RPC 2.0 stdio server for MCP compatibility."""
            sys.stderr.write(f"[{self.name}] Running in JSON-RPC stdio fallback mode (mcp library not detected)...\n")
            sys.stderr.flush()
            while True:
                try:
                    line = sys.stdin.readline()
                    if not line:
                        break
                    line_str = line.strip()
                    if not line_str:
                        continue
                    req = json.loads(line_str)
                    method = req.get("method")
                    req_id = req.get("id")

                    if method == "initialize":
                        resp = {
                            "jsonrpc": "2.0",
                            "id": req_id,
                            "result": {
                                "protocolVersion": "2024-11-05",
                                "capabilities": {"tools": {}},
                                "serverInfo": {"name": self.name, "version": "2.0.0"},
                            },
                        }
                    elif method == "notifications/initialized":
                        continue
                    elif method == "ping":
                        resp = {"jsonrpc": "2.0", "id": req_id, "result": {}}
                    elif method == "tools/list":
                        tool_defs = []
                        for name, fn in self._tools.items():
                            tool_defs.append({
                                "name": name,
                                "description": (fn.__doc__ or "").strip(),
                                "inputSchema": self._generate_input_schema(fn),
                            })
                        resp = {
                            "jsonrpc": "2.0",
                            "id": req_id,
                            "result": {"tools": tool_defs},
                        }
                    elif method == "tools/call":
                        params = req.get("params", {})
                        t_name = params.get("name")
                        t_args = params.get("arguments", {})
                        if t_name in self._tools:
                            fn = self._tools[t_name]
                            if asyncio.iscoroutinefunction(fn):
                                res = asyncio.run(fn(**t_args))
                            else:
                                res = fn(**t_args)
                            resp = {
                                "jsonrpc": "2.0",
                                "id": req_id,
                                "result": {"content": [{"type": "text", "text": json.dumps(res, indent=2)}]},
                            }
                        else:
                            resp = {
                                "jsonrpc": "2.0",
                                "id": req_id,
                                "error": {"code": -32601, "message": f"Tool '{t_name}' not found"},
                            }
                    else:
                        resp = {
                            "jsonrpc": "2.0",
                            "id": req_id,
                            "result": {},
                        }

                    sys.stdout.write(json.dumps(resp) + "\n")
                    sys.stdout.flush()
                except Exception as exc:
                    err_resp = {
                        "jsonrpc": "2.0",
                        "id": None,
                        "error": {"code": -32603, "message": str(exc)},
                    }
                    sys.stdout.write(json.dumps(err_resp) + "\n")
                    sys.stdout.flush()


mcp = FastMCP("PactPay-NeuroSymbolic-Procurement-Server")

# Shared singletons
_batna_service = Channel3BatnaService()
_firewall = Z3SymbolicFirewall()
_sanitizer = PromptSanitizer()
_orchestrator = PactPayOrchestrator()
_gate = CryptographicPayPalGate(_firewall.public_key_hex)


# ---------------------------------------------------------------------------
# MCP Tool 1: Channel3 Unbundled Market BATNA Discovery
# ---------------------------------------------------------------------------
@mcp.tool()
async def pactpay_discover_channel3_batna(query: str, quantity: int = 10) -> dict:
    """Queries Channel3 to discover the live multi-merchant retail offer spread and Net Effective Retail BATNA ceiling.

    Args:
        query: Procurement specification search query.
        quantity: Volume count requested.

    Returns:
        Itemized retail offers, cryptographic snapshot hash, and total landed BATNA ceiling in cents and dollars.
    """
    return await _batna_service.discover_and_anchor_batna(query=query, quantity=quantity)


# ---------------------------------------------------------------------------
# MCP Tool 2: Formal Microsoft Z3 SMT Constraint Verification
# ---------------------------------------------------------------------------
@mcp.tool()
def pactpay_verify_deal_z3(envelope_json: str, max_budget: float = 4600.0, min_vendor_trust: int = 75) -> dict:
    """Formally verifies an AP2 Merchant Cart Mandate against corporate procurement invariants using Microsoft Z3.

    Evaluates 7 formal invariants:
    - INV_1: Budget Cap ($4,600.00)
    - INV_2: Beats Retail BATNA ($4,746.90)
    - INV_3: Freight Cap (<= 8% of subtotal)
    - INV_4: Minimum Warranty (>= 12 months)
    - INV_5: Schema Validated Numeric Fields
    - INV_6A: Component Subsidization Floor
    - INV_7: Elastic Hybrid Vendor Trust Index (>= 75/100)

    Args:
        envelope_json: Serialized JSON AP2 Cart Mandate quote containing pricing terms and notes.
        max_budget: Upper ceiling budget in USD.
        min_vendor_trust: Minimum required vendor trust score (0-100).

    Returns:
        Formal Z3 SMT proof trace (SAT/UNSAT), failed invariants, nearest-compliant guidance, and Ed25519 clearance token.
    """
    try:
        envelope = json.loads(envelope_json) if isinstance(envelope_json, str) else envelope_json
    except Exception as err:
        return {"verified": False, "z3_status": "unsat", "error": f"Invalid JSON envelope: {err}"}

    # Telemetry prompt injection quarantine
    notes = envelope.get("notes") or envelope.get("cart_payload", {}).get("notes", "")
    sanitization = _sanitizer.sanitize(notes)

    policy = {
        "max_budget": max_budget,
        "min_vendor_trust_score": min_vendor_trust,
    }

    audit = _firewall.evaluate_deal(envelope=envelope, policy=policy)
    audit["sanitization"] = {
        "blocked": sanitization.blocked,
        "reasons": sanitization.reasons,
    }
    return audit


# ---------------------------------------------------------------------------
# MCP Tool 3: End-to-End Swarm Reverse E-Auction Procurement Execution
# ---------------------------------------------------------------------------
@mcp.tool()
async def pactpay_execute_swarm_procurement(query: str, quantity: int = 10, max_budget: float = 4600.0) -> dict:
    """Executes the full 5-stage Neuro-Symbolic Swarm Procurement pipeline.

    Coordinates:
    1. CFO AP2 Intent Mandate issuance
    2. Channel3 real-time unbundled BATNA anchoring ($4,746.90)
    3. Parallel 3-Vendor Swarm Reverse E-Auction (Apex, GlobalIT, ShadowCorp)
    4. Microsoft Z3 formal invariant evaluation and nearest-compliant convergence
    5. Air-Gapped PayPal MCP Orders v2 Settlement Gate execution

    Args:
        query: B2B procurement query.
        quantity: Quantity of hardware units requested.
        max_budget: Maximum authorized budget in USD.

    Returns:
        Winning vendor offer, Z3 proof trace, Ed25519 clearance certificate, and PayPal Sandbox settlement approval link.
    """
    session_id = f"MCP-{uuid.uuid4().hex[:6].upper()}"
    policy = {
        "max_budget": max_budget,
        "auto_order_limit": 2000.0,
        "max_freight_ratio": 0.08,
        "min_warranty_months": 12,
        "min_vendor_trust_score": 75,
    }
    adversary = {
        "merchant_floor_ratio": 0.86,
        "attack_mode": "NONE",
        "swarm_mode": True,
        "max_rounds": 2,
    }

    events = []
    async for ev in _orchestrator.stream_procurement_session(
        session_id=session_id,
        query=query,
        requested_qty=quantity,
        policy=policy,
        adversary_config=adversary,
        scenario_mode="SCENARIO_A_COMPLIANT_WIN",
    ):
        events.append(ev)

    final_result = events[-1]["data"]["result"] if events and events[-1]["event"] == "procurement_complete" else {}
    return {
        "session_id": session_id,
        "result": final_result,
        "events_count": len(events),
        "protocol_status": "SETTLEMENT_AUTHORIZED" if final_result.get("z3Status") == "sat" else "FIREWALL_BLOCKED",
    }


# ---------------------------------------------------------------------------
# MCP Tool 4: Cryptographic PayPal Dispute & Breach Audit
# ---------------------------------------------------------------------------
@mcp.tool()
async def pactpay_audit_paypal_dispute(
    dispute_id: str,
    order_id: str,
    canonical_payload: str,
    clearance_token: str,
    delivered_qty: int,
) -> dict:
    """Audits a PayPal dispute against the immutable Z3 contractual mandate to auto-defend or concede.

    Verifies the clearance token against the canonical payload:
    - If delivered_qty == contracted_qty: Auto-defends with FedEx tracking and Ed25519 clearance proof.
    - If delivered_qty < contracted_qty: Flags quantity shortfall, concedes claim, and generates a formal Z3 Fulfillment Breach Brief.

    Args:
        dispute_id: PayPal Dispute ID (e.g., PP-D-94821).
        order_id: PayPal Order ID.
        canonical_payload: Immutable JSON payload containing contracted item quantities.
        clearance_token: Cryptographic Ed25519 or HMAC-SHA256 clearance token.
        delivered_qty: Verified units delivered by carrier.

    Returns:
        Z3 verdict (FULFILLMENT_SATISFIED vs. BREACH_CONFIRMED), resolution action, and cryptographic audit payload.
    """
    return await _gate.auto_defend_or_resolve_dispute(
        dispute_id=dispute_id,
        order_id=order_id,
        canonical_payload=canonical_payload,
        clearance_token=clearance_token,
        delivered_qty=delivered_qty,
    )


def main():
    """Runs the MCP server over stdio or executes CLI helper options."""
    if len(sys.argv) > 1 and sys.argv[1] in ("--list", "-l", "list"):
        print("\n=== Registered PactPay MCP Tools ===")
        tools = getattr(mcp, "_tools", {})
        for name, fn in tools.items():
            first_line = (fn.__doc__ or "").strip().split("\n")[0]
            print(f"• {name}(): {first_line}")
        print("====================================\n")
        return

    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
