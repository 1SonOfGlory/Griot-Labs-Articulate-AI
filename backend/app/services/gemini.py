import httpx
from app.config import settings


async def generate_coach_reply(user_text: str, context: str = "") -> str:
    """
    Simple Gemini text generation bridge.
    Keep API key in GEMINI_API_KEY env var; never hardcode secrets.
    """
    if not settings.gemini_api_key:
        return "Gemini key not configured. Set GEMINI_API_KEY in backend environment."

    endpoint = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{settings.gemini_model}:generateContent?key={settings.gemini_api_key}"
    )
    prompt = (
        "You are Articulate AI, an elite communication coach. "
        "Respond in concise coaching style with one refinement and one challenge.\n"
        f"Context: {context}\n"
        f"Learner: {user_text}"
    )
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.4, "maxOutputTokens": 220},
    }

    async with httpx.AsyncClient(timeout=8.0) as client:
        resp = await client.post(endpoint, json=body)
        resp.raise_for_status()
        data = resp.json()
    try:
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError):
        return "I heard you. Tighten the opening and make the core ask explicit."
