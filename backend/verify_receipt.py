#!/usr/bin/env python3
"""PactPay Standalone Zero-Dependency Receipt Verifier (Backend Mirror)."""
import os
import sys

# Import directly from the root pactpay_verify module or mirror functions
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if root_path not in sys.path:
    sys.path.insert(0, root_path)

from pactpay_verify import (
    canonicalize_jcs,
    hash_jcs,
    main,
    run_crypto_self_test,
    verify_ed25519,
    verify_receipt_data as verify_receipt,
)

if __name__ == "__main__":
    main()
