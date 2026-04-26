from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.deps.auth import require_roles
from app.deps.db import get_db
from app.schemas import CoachDashboardResponse
from app.models import SessionModel, EvaluationLog


router = APIRouter(prefix="/coach", tags=["coach"])


@router.get("/dashboard", response_model=CoachDashboardResponse)
def coach_dashboard(
    user: dict = Depends(require_roles("coach", "super_admin")),
    db: Session = Depends(get_db),
) -> CoachDashboardResponse:
    _ = user
    total_sessions = db.scalar(select(func.count()).select_from(SessionModel)) or 0
    active_learners = db.scalar(select(func.count(func.distinct(SessionModel.owner_id)))) or 0
    avg_score = db.scalar(select(func.avg(EvaluationLog.overall))) or 0
    return CoachDashboardResponse(
        total_sessions=int(total_sessions),
        active_learners=int(active_learners),
        average_score=int(round(avg_score)),
    )
