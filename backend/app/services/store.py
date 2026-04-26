from datetime import datetime, timezone
from threading import Lock
from uuid import uuid4


db_lock = Lock()
users: dict[str, dict] = {}
sessions: dict[str, dict] = {}
uploads: dict[str, list[dict]] = {}
evaluation_logs: list[dict] = []


def create_session(owner_email: str, payload: dict) -> dict:
    session_id = uuid4().hex[:12]
    row = {
        "session_id": session_id,
        "created_at": datetime.now(timezone.utc),
        "owner_email": owner_email,
        **payload,
    }
    with db_lock:
        sessions[session_id] = row
    return row
