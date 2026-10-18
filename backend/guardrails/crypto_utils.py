"""Cryptographic utilities for PactPay: Ed25519 asymmetric signatures (RFC 8032)
and JSON Canonicalization Scheme (RFC 8785) in pure standard-library Python.
"""

from __future__ import annotations

import hashlib
import json
import secrets
from typing import Any, Tuple

# --- Ed25519 (RFC 8032) Pure Python Reference Implementation ---
b = 256
q = 2**255 - 19
l = 2**252 + 27742317777372353535851937790883648493

def _inv(x: int) -> int:
    return pow(x, q - 2, q)

d = -121665 * _inv(121666) % q
I = pow(2, (q - 1) // 4, q)

def _xrecover(y: int) -> int:
    xx = (y * y - 1) * _inv(d * y * y + 1) % q
    x = pow(xx, (q + 3) // 8, q)
    if (x * x - xx) % q != 0:
        x = (x * I) % q
    if x % 2 != 0:
        x = q - x
    return x

By = 4 * _inv(5) % q
Bx = _xrecover(By)
B = (Bx % q, By % q)

def _edwards_add(P: Tuple[int, int], Q: Tuple[int, int]) -> Tuple[int, int]:
    x1, y1 = P
    x2, y2 = Q
    x3 = (x1 * y2 + x2 * y1) * _inv(1 + d * x1 * x2 * y1 * y2) % q
    y3 = (y1 * y2 + x1 * x2) * _inv(1 - d * x1 * x2 * y1 * y2) % q
    return (x3, y3)

def _scalarmult(P: Tuple[int, int], e: int) -> Tuple[int, int]:
    if e == 0:
        return (0, 1)
    Q = _scalarmult(P, e // 2)
    Q = _edwards_add(Q, Q)
    if e & 1:
        Q = _edwards_add(Q, P)
    return Q

def _encode_int(y: int) -> bytes:
    return y.to_bytes(32, "little")

def _decode_int(s: bytes) -> int:
    return int.from_bytes(s, "little")

def _encodepoint(P: Tuple[int, int]) -> bytes:
    x, y = P
    bits = [(y >> i) & 1 for i in range(255)] + [x & 1]
    return bytes(sum(bits[i * 8 + j] << j for j in range(8)) for i in range(32))

def _decodepoint(s: bytes) -> Tuple[int, int]:
    y = sum(2**i * ((s[i // 8] >> (i % 8)) & 1) for i in range(255))
    x = _xrecover(y)
    if (x & 1) != ((s[31] >> 7) & 1):
        x = q - x
    return (x, y)

def _H(m: bytes) -> bytes:
    return hashlib.sha512(m).digest()

def generate_keypair() -> Tuple[bytes, bytes]:
    """Generates an Ed25519 (private_key, public_key) pair (each 32 bytes)."""
    sk = secrets.token_bytes(32)
    h = _H(sk)
    a = 2**(b - 2) + sum(2**i * ((h[i // 8] >> (i % 8)) & 1) for i in range(3, b - 2))
    A = _scalarmult(B, a)
    pk = _encodepoint(A)
    return sk, pk

def public_key_from_private(sk: bytes) -> bytes:
    h = _H(sk)
    a = 2**(b - 2) + sum(2**i * ((h[i // 8] >> (i % 8)) & 1) for i in range(3, b - 2))
    A = _scalarmult(B, a)
    return _encodepoint(A)

def sign_bytes(sk: bytes, m: bytes) -> bytes:
    """Signs message m with 32-byte secret key sk. Returns 64-byte signature."""
    h = _H(sk)
    a = 2**(b - 2) + sum(2**i * ((h[i // 8] >> (i % 8)) & 1) for i in range(3, b - 2))
    A = _scalarmult(B, a)
    pk = _encodepoint(A)
    r = _decode_int(_H(h[32:] + m)) % l
    R = _scalarmult(B, r)
    k = _decode_int(_H(_encodepoint(R) + pk + m)) % l
    S = (r + k * a) % l
    return _encodepoint(R) + _encode_int(S)

def verify_signature(pk: bytes, m: bytes, sig: bytes) -> bool:
    """Verifies 64-byte signature on message m using 32-byte public key pk."""
    if len(sig) != 64 or len(pk) != 32:
        return False
    try:
        R = _decodepoint(sig[:32])
        A = _decodepoint(pk)
        S = _decode_int(sig[32:])
        if S >= l:
            return False
        k = _decode_int(_H(sig[:32] + pk + m)) % l
        # Check: S * B == R + k * A
        SB = _scalarmult(B, S)
        R_plus_kA = _edwards_add(R, _scalarmult(A, k))
        return SB == R_plus_kA
    except Exception:
        return False

# --- RFC 8785 JSON Canonicalization Scheme (JCS) ---
def canonicalize_json(data: Any) -> bytes:
    """Serializes data to RFC 8785 deterministic canonical JSON bytes."""
    def _normalize(val: Any) -> Any:
        if isinstance(val, dict):
            # Keys sorted by UTF-16 code units (in Python, standard unicode code points)
            return {k: _normalize(v) for k, v in sorted(val.items(), key=lambda item: item[0])}
        elif isinstance(val, list):
            return [_normalize(item) for item in val]
        return val

    normalized = _normalize(data)
    # Canonical JSON uses separators=(',', ':') with no whitespace and ensure_ascii=False
    return json.dumps(normalized, separators=(",", ":"), ensure_ascii=False).encode("utf-8")

def hash_payload(data: Any) -> str:
    """Returns SHA-256 hex digest of the RFC 8785 canonical JSON bytes."""
    return hashlib.sha256(canonicalize_json(data)).hexdigest()
