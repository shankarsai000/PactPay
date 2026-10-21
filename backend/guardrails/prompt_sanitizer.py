"""Deterministic prompt-injection filter for merchant-supplied text.
Acts as a quarantined telemetry sensor, isolated from the SMT solver.
"""

from __future__ import annotations

import re
from dataclasses import dataclass


@dataclass(frozen=True)
class SanitizationResult:
    text: str
    blocked: bool
    reasons: list[str]


class PromptSanitizer:
    """Flags text attempting to override buyer procurement mandate or invariants."""

    _PATTERNS = (
        r"ignore .*?(?:instructions?|policy|guardrail|approval|rules?)",
        r"(?:disable|bypass|override) (?:the )?(?:guardrail|policy|approval|rules?)",
        r"do not (?:validate|check|enforce)",
        r"(?:system prompt|system override)",
        r"disregard (?:previous|all)",
    )

    def sanitize(self, text: str) -> SanitizationResult:
        reasons = [pattern for pattern in self._PATTERNS if re.search(pattern, text, re.IGNORECASE)]
        cleaned = text
        for pattern in self._PATTERNS:
            cleaned = re.sub(pattern, "[REDACTED_SYSTEM_OVERRIDE]", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        return SanitizationResult(text=cleaned, blocked=bool(reasons), reasons=reasons)

    @classmethod
    def sanitize_envelope(cls, envelope: dict) -> tuple[dict, list[str]]:
        """Sanitizes text fields in an envelope, returning (sanitized_envelope, list_of_threats)."""
        inst = cls()
        cleaned_env = dict(envelope)
        threats: list[str] = []

        for field in ("natural_language_rationale", "notes", "merchant_notes"):
            if field in cleaned_env and isinstance(cleaned_env[field], str):
                val = cleaned_env[field]
                res = inst.sanitize(val)
                if res.blocked:
                    threats.extend(res.reasons)
                    cleaned_env[field] = res.text
                    cleaned_env["prompt_injection_blocked"] = True

        return cleaned_env, threats
