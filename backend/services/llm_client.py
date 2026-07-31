"""
LLM client wrapper — calls Ollama by default, swappable to Claude via
the FLEXION_LLM_PROVIDER environment variable.

Environment variables:
  FLEXION_LLM_PROVIDER  — "ollama" (default) or "claude"
  OLLAMA_BASE_URL       — Ollama API base (default: http://localhost:11434)
  OLLAMA_MODEL          — Model name (default: llama3.2)
  ANTHROPIC_API_KEY     — Required when provider is "claude"
  CLAUDE_MODEL          — Claude model name (default: claude-sonnet-4-20250514)
"""

import os
import httpx
from pathlib import Path
from services.rag_store import retrieve_research_snippet

_PROVIDER = os.getenv("FLEXION_LLM_PROVIDER", "ollama")
_OLLAMA_BASE = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
_OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")
_CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-20250514")

_PROMPTS_DIR = Path(__file__).resolve().parent.parent / "prompts"
_BEGINNER_TEMPLATE = (_PROMPTS_DIR / "beginner_template.txt").read_text(encoding="utf-8")
_ADVANCED_TEMPLATE = (_PROMPTS_DIR / "advanced_template.txt").read_text(encoding="utf-8")

# Fallback corrections when the LLM is unavailable
_BEGINNER_FALLBACKS: dict[str, str] = {
    "valgus_collapse": "Push your knees out — they're caving in!",
    "knee_valgus_collapse": "Push your knees out — they're caving in!",
    "excessive_forward_lean": "Chest up! Keep your torso more upright.",
    "insufficient_depth": "Try to go a bit deeper — lower down to depth.",
    "knee_over_extension": "Don't lock your knees fully at lockout.",
    "lumbar_flexion": "Keep your back flat and chest proud — don't round your lower spine!",
    "bar_path_deviation": "Keep the bar close to your shins over your mid-foot.",
    "shoulder_abduction": "Tuck your elbows in to 45 degrees — don't flare your shoulders!",
    "core_alignment": "Squeeze your glutes and brace your core — don't let your hips sag!",
}

_ADVANCED_FALLBACKS: dict[str, str] = {
    "valgus_collapse": "Dynamic knee valgus increases patellofemoral joint reaction forces and ACL tension. Actively engage gluteus medius and hip external rotators to track knees in line with the 2nd toe.",
    "knee_valgus_collapse": "Dynamic knee valgus increases patellofemoral joint reaction forces and ACL tension. Actively engage gluteus medius and hip external rotators to track knees in line with the 2nd toe.",
    "excessive_forward_lean": "Excessive torso incline expands lumbar spinal moment arms and shear stress. Drive through quadriceps and maintain chest elevation to preserve neutral vertebral alignment.",
    "insufficient_depth": "Stopping above required joint flexion restricts peak target muscle recruitment. Mobilize joint range of motion to safely achieve full depth.",
    "knee_over_extension": "Rapid terminal knee hyperextension transfers load to the posterior joint capsule. Maintain active muscular co-contraction without snap locking the joints.",
    "lumbar_flexion": "Flexion under heavy load elevates posterior disc compressive stress and reduces erector spinae leverage. Engage latissimus dorsi and initiate lift with leg drive to maintain lumbar neutral.",
    "bar_path_deviation": "Barbell drift away from the mid-foot expands horizontal moment arms to the hip joint, multiplying spinal torque. Maintain vertical bar trajectory over center of mass.",
    "shoulder_abduction": "Flaring shoulders to 90 degrees narrows subacromial space width and increases supraspinatus impaction. Angle elbows to 45 degrees to protect shoulder labrum.",
    "core_alignment": "Anterior pelvic tilt and lumbar extension impair force transfer across the trunk kinetic chain. Engage rectus abdominis and glutes to maintain a rigid plank.",
}



def _format_prompt(exercise: str, deviations: list[dict], tier: str) -> str:
    """Fill the appropriate prompt template with deviation data and RAG context."""
    lines = []
    for d in deviations:
        lines.append(
            f"- {d['joint'].capitalize()}: {d['issue'].replace('_', ' ')} "
            f"({d['severity']}) — {d['detail']}"
        )
    formatted_devs = "\n".join(lines)

    if tier == "advanced":
        research_context = retrieve_research_snippet(exercise, deviations)
        return _ADVANCED_TEMPLATE.format(
            exercise=exercise,
            deviations=formatted_devs,
            research_context=research_context
        )

    return _BEGINNER_TEMPLATE.format(exercise=exercise, deviations=formatted_devs)


async def get_correction(exercise: str, deviations: list[dict], tier: str = "beginner") -> str:
    """
    Send deviation data to LLM (with RAG context if tier is advanced)
    and return correction string. Falls back to canned responses if LLM is unreachable.
    """
    prompt = _format_prompt(exercise, deviations, tier)

    try:
        if _PROVIDER == "claude":
            return await _call_claude(prompt)
        return await _call_ollama(prompt)
    except Exception as exc:
        print(f"[Flexion] LLM call failed ({exc}), using {tier} fallback")
        return _fallback(deviations, tier)


async def _call_ollama(prompt: str) -> str:
    """Call the Ollama /api/generate endpoint."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(
            f"{_OLLAMA_BASE}/api/generate",
            json={"model": _OLLAMA_MODEL, "prompt": prompt, "stream": False},
        )
        resp.raise_for_status()
        return resp.json()["response"].strip()


async def _call_claude(prompt: str) -> str:
    """Call the Anthropic Messages API."""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY is not set")

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": _CLAUDE_MODEL,
                "max_tokens": 150,
                "messages": [{"role": "user", "content": prompt}],
            },
        )
        resp.raise_for_status()
        return resp.json()["content"][0]["text"].strip()


def _fallback(deviations: list[dict], tier: str) -> str:
    """Return a canned correction for the first recognised issue."""
    fallbacks = _ADVANCED_FALLBACKS if tier == "advanced" else _BEGINNER_FALLBACKS
    for d in deviations:
        correction = fallbacks.get(d["issue"])
        if correction:
            return correction
    if tier == "advanced":
        return "Biomechanical misalignment detected. Maintain muscular co-contraction and preserve joint alignment through full range of motion."
    return "Focus on controlled form through the full range of motion."
