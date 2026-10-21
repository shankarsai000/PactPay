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
            cleaned = re.sub(pattern, "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        return SanitizationResult(text=cleaned, blocked=bool(reasons), reasons=reasons)
