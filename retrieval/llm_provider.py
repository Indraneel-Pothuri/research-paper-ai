"""
Three-tier LLM provider for Research Paper AI

Priority:
1. Groq
2. OpenRouter
3. Local LM Studio

The providers use an OpenAI-compatible chat-completions interface, so the
same Python client can talk to all three services.
"""

import os
from dataclasses import dataclass
from typing import Optional

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()


@dataclass
class LLMResult:
    text: str
    provider: str
    model: str


# ---------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "").strip()

GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openrouter/free")
LM_STUDIO_BASE_URL = os.getenv(
    "LM_STUDIO_BASE_URL",
    "http://localhost:1234/v1",
).rstrip("/")
LM_STUDIO_MODEL = os.getenv(
    "LM_STUDIO_MODEL",
    "openai/gpt-oss-20b",
)

# Keep the output moderate so one question does not consume unnecessary
# quota/tokens. Increase later if required.
MAX_TOKENS = int(os.getenv("MAX_TOKENS", "1200"))
TEMPERATURE = float(os.getenv("TEMPERATURE", "0.2"))

# Only transient server errors are retried. A 429 should immediately move
# to the next provider instead of wasting quota by retrying.
TRANSIENT_RETRIES = int(os.getenv("TRANSIENT_RETRIES", "1"))


# ---------------------------------------------------------------------
# Client creation
# ---------------------------------------------------------------------

def _groq_client() -> Optional[OpenAI]:
    if not GROQ_API_KEY:
        return None

    return OpenAI(
        api_key=GROQ_API_KEY,
        base_url="https://api.groq.com/openai/v1",
    )


def _openrouter_client() -> Optional[OpenAI]:
    if not OPENROUTER_API_KEY:
        return None

    return OpenAI(
        api_key=OPENROUTER_API_KEY,
        base_url="https://openrouter.ai/api/v1",
    )


def _lm_studio_client() -> OpenAI:
    # LM Studio can normally be used without an API key unless authentication
    # has been enabled in LM Studio.
    lm_api_key = os.getenv("LM_STUDIO_API_KEY", "lm-studio")

    return OpenAI(
        api_key=lm_api_key,
        base_url=LM_STUDIO_BASE_URL,
    )


# ---------------------------------------------------------------------
# One provider call
# ---------------------------------------------------------------------

def _call_client(
    client: OpenAI,
    model: str,
    messages: list[dict],
) -> str:
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=TEMPERATURE,
        max_tokens=MAX_TOKENS,
    )

    if not response.choices:
        raise RuntimeError("Provider returned no choices.")

    text = response.choices[0].message.content

    if not text or not text.strip():
        raise RuntimeError("Provider returned an empty response.")

    return text.strip()


# ---------------------------------------------------------------------
# Provider status / user-facing messages
# ---------------------------------------------------------------------

def _provider_message(name: str, model: str) -> None:
    print(f"\n[LLM] Using {name} → {model}")


def _fallback_message(from_name: str, to_name: str, reason: str) -> None:
    print(
        f"[LLM] {from_name} unavailable ({reason}). "
        f"Falling back to {to_name}..."
    )


# ---------------------------------------------------------------------
# Main fallback chain
# ---------------------------------------------------------------------

def generate_with_fallback(messages: list[dict]) -> LLMResult:
    """
    Try providers in this exact order:

        Groq -> OpenRouter -> LM Studio

    A provider failure never exposes the raw traceback to the user.
    429/quota errors immediately move to the next provider.
    """

    # ================================================================
    # 1. GROQ
    # ================================================================

    groq = _groq_client()

    if groq is not None:
        _provider_message("Groq", GROQ_MODEL)

        try:
            text = _call_client(groq, GROQ_MODEL, messages)
            return LLMResult(
                text=text,
                provider="Groq",
                model=GROQ_MODEL,
            )

        except Exception as exc:
            reason = _short_error(exc)

            # One optional retry only for temporary 5xx-style failures.
            if _should_retry(exc):
                try:
                    print("[LLM] Temporary Groq server issue. Retrying once...")
                    text = _call_client(groq, GROQ_MODEL, messages)
                    return LLMResult(
                        text=text,
                        provider="Groq",
                        model=GROQ_MODEL,
                    )
                except Exception as retry_exc:
                    reason = _short_error(retry_exc)

            _fallback_message("Groq", "OpenRouter", reason)

    else:
        print("[LLM] Groq API key not configured. Using OpenRouter...")

    # ================================================================
    # 2. OPENROUTER
    # ================================================================

    openrouter = _openrouter_client()

    if openrouter is not None:
        _provider_message("OpenRouter", OPENROUTER_MODEL)

        try:
            text = _call_client(
                openrouter,
                OPENROUTER_MODEL,
                messages,
            )
            return LLMResult(
                text=text,
                provider="OpenRouter",
                model=OPENROUTER_MODEL,
            )

        except Exception as exc:
            reason = _short_error(exc)

            if _should_retry(exc):
                try:
                    print(
                        "[LLM] Temporary OpenRouter server issue. "
                        "Retrying once..."
                    )
                    text = _call_client(
                        openrouter,
                        OPENROUTER_MODEL,
                        messages,
                    )
                    return LLMResult(
                        text=text,
                        provider="OpenRouter",
                        model=OPENROUTER_MODEL,
                    )
                except Exception as retry_exc:
                    reason = _short_error(retry_exc)

            _fallback_message("OpenRouter", "LM Studio", reason)

    else:
        print("[LLM] OpenRouter API key not configured. Using LM Studio...")

    # ================================================================
    # 3. LOCAL LM STUDIO
    # ================================================================

    _provider_message("LM Studio (local)", LM_STUDIO_MODEL)

    try:
        lm_studio = _lm_studio_client()
        text = _call_client(
            lm_studio,
            LM_STUDIO_MODEL,
            messages,
        )

        return LLMResult(
            text=text,
            provider="LM Studio",
            model=LM_STUDIO_MODEL,
        )

    except Exception as exc:
        raise RuntimeError(
            "All three LLM providers are unavailable. "
            "Please check your Groq/OpenRouter keys or make sure "
            "LM Studio is running with the configured model."
        ) from exc


# ---------------------------------------------------------------------
# Error helpers
# ---------------------------------------------------------------------

def _short_error(exc: Exception) -> str:
    """
    Convert provider exceptions into a short user-facing reason.
    Never print a full traceback during normal RAG operation.
    """

    message = str(exc).replace("\n", " ").strip()

    if "429" in message or "RESOURCE_EXHAUSTED" in message:
        return "rate limit / quota reached"

    if "401" in message or "403" in message:
        return "authentication or permission problem"

    if "404" in message:
        return "model or endpoint not found"

    if "503" in message or "502" in message or "504" in message:
        return "temporary server unavailability"

    if "Connection" in message or "connection" in message:
        return "connection problem"

    # Keep logs short.
    return message[:160] if message else "unknown provider error"


def _should_retry(exc: Exception) -> bool:
    message = str(exc)

    # Do NOT retry quota/rate-limit/auth/model errors.
    if any(code in message for code in ("429", "401", "403", "404")):
        return False

    # Retry only obvious temporary server/network failures.
    return any(
        marker in message
        for marker in (
            "500",
            "502",
            "503",
            "504",
            "timeout",
            "Timeout",
            "temporarily unavailable",
            "Connection",
            "connection",
        )
    )
