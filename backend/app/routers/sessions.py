from datetime import datetime, timezone
from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, WebSocket, WebSocketDisconnect
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.deps.auth import get_current_user
from app.deps.db import get_db
from app.models import SessionModel, Upload, EvaluationLog, User
from app.schemas import (
    SessionCreateRequest,
    SessionResponse,
    UploadResponse,
    UploadItem,
    SimulationEvaluateRequest,
    SimulationEvaluateResponse,
)
from app.services.gemini import generate_coach_reply


router = APIRouter(prefix="/sessions", tags=["sessions"])


def require_session_access(session: SessionModel, user_ctx: dict) -> None:
    if user_ctx["role"] == "super_admin":
        return
    if user_ctx["role"] == "coach":
        return
    if session.owner.email != user_ctx["email"]:
        raise HTTPException(status_code=403, detail="Forbidden")


@router.post("", response_model=SessionResponse)
def create_session(payload: SessionCreateRequest, user_ctx: dict = Depends(get_current_user), db: Session = Depends(get_db)) -> SessionResponse:
    owner = db.scalar(select(User).where(User.email == user_ctx["email"]))
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")

    session_id = uuid4().hex[:12]
    row = SessionModel(
        id=session_id,
        owner_id=owner.id,
        learner_name=payload.learner_name,
        learner_role=payload.learner_role,
        goal_text=payload.goal_text,
        audience_text=payload.audience_text,
        focus_areas=",".join(payload.focus_areas),
        additional_notes=payload.additional_notes,
    )
    db.add(row)
    db.commit()
    return SessionResponse(session_id=row.id, created_at=row.created_at, owner_email=owner.email)


@router.post("/{session_id}/files", response_model=UploadResponse)
async def upload_files(
    session_id: str,
    files: list[UploadFile] = File(...),
    user_ctx: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UploadResponse:
    session = db.scalar(select(SessionModel).where(SessionModel.id == session_id))
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    require_session_access(session, user_ctx)

    if len(files) > settings.max_files_per_upload:
        raise HTTPException(status_code=400, detail=f"Max {settings.max_files_per_upload} files per upload")

    max_bytes = settings.max_file_size_mb * 1024 * 1024
    items: list[UploadItem] = []
    for file in files:
        content = await file.read(max_bytes + 1)
        size = len(content)
        if size > max_bytes:
            raise HTTPException(status_code=400, detail=f"{file.filename} exceeds {settings.max_file_size_mb}MB limit")

        content_type = file.content_type or "application/octet-stream"
        text_like = content_type.startswith("text/") or file.filename.lower().endswith((".txt", ".md", ".csv", ".json"))
        status_flag = "text_extracted" if text_like else "extraction_pending"
        row = Upload(
            session_id=session_id,
            file_name=file.filename,
            content_type=content_type,
            size_bytes=size,
            extraction_status=status_flag,
        )
        db.add(row)
        items.append(
            UploadItem(
                file_name=file.filename,
                content_type=content_type,
                size_bytes=size,
                extraction_status=status_flag,
            )
        )
    db.commit()
    return UploadResponse(accepted=len(items), max_allowed=settings.max_files_per_upload, items=items)


@router.post("/{session_id}/notes/audio", response_model=UploadItem)
async def upload_audio_note(
    session_id: str,
    file: UploadFile = File(...),
    user_ctx: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UploadItem:
    session = db.scalar(select(SessionModel).where(SessionModel.id == session_id))
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    require_session_access(session, user_ctx)

    max_bytes = settings.max_file_size_mb * 1024 * 1024
    content = await file.read(max_bytes + 1)
    size = len(content)
    if size > max_bytes:
        raise HTTPException(status_code=400, detail=f"{file.filename} exceeds {settings.max_file_size_mb}MB limit")

    row = Upload(
        session_id=session_id,
        file_name=file.filename,
        content_type=file.content_type or "audio/webm",
        size_bytes=size,
        extraction_status="transcription_pending",
    )
    db.add(row)
    db.commit()
    return UploadItem(
        file_name=row.file_name,
        content_type=row.content_type,
        size_bytes=row.size_bytes,
        extraction_status=row.extraction_status,
    )


@router.post("/{session_id}/simulation/evaluate", response_model=SimulationEvaluateResponse)
def evaluate_simulation(
    session_id: str,
    payload: SimulationEvaluateRequest,
    user_ctx: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SimulationEvaluateResponse:
    session = db.scalar(select(SessionModel).where(SessionModel.id == session_id))
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    require_session_access(session, user_ctx)

    text = payload.transcript.lower()
    filler_hits = sum(text.count(item) for item in [" um ", " uh ", " like ", " you know "])
    confidence = max(25, 84 - filler_hits * 6)
    clarity = max(30, min(95, 70 + text.count("first") * 4 + text.count("therefore") * 3))
    connection = max(25, min(96, 68 + text.count("you") * 2 + text.count("we") * 2))
    overall = round(confidence * 0.35 + clarity * 0.35 + connection * 0.3)
    breakdown = [
        "Clarity: Improve signposting with explicit structure markers." if clarity < 75 else "Clarity: Structure is strong and easy to follow.",
        "Confidence: Remove filler words and hedging." if confidence < 75 else "Confidence: Delivery feels stable and assertive.",
        "Connection: Reference audience concerns more directly." if connection < 72 else "Connection: Audience relevance is clear.",
    ]
    challenge = "Deliver the same message in 3 lines: problem, proof, ask."
    pulse = "Impact is solid with clear room for tighter control." if overall < 82 else "Impact is strong and executive-ready."

    owner = db.scalar(select(User).where(User.email == user_ctx["email"]))
    db.add(
        EvaluationLog(
            session_id=session_id,
            owner_id=owner.id if owner else session.owner_id,
            difficulty=payload.difficulty,
            overall=overall,
            created_at=datetime.now(timezone.utc),
        )
    )
    db.commit()
    return SimulationEvaluateResponse(pulse=pulse, breakdown=breakdown, challenge=challenge, overall=overall)


@router.websocket("/ws/simulations/{session_id}")
async def simulation_socket(websocket: WebSocket, session_id: str) -> None:
    await websocket.accept()
    try:
        await websocket.send_json(
            {"event": "connected", "session_id": session_id, "message": "Realtime simulation channel active."}
        )
        while True:
            learner_text = await websocket.receive_text()
            coach_reply = await generate_coach_reply(learner_text, context=f"session={session_id}")
            now = datetime.now(timezone.utc).isoformat()
            await websocket.send_json(
                {"event": "coach_response", "received_at": now, "transcript": learner_text, "response": coach_reply}
            )
    except WebSocketDisconnect:
        return
