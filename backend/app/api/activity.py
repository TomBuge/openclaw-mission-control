from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select

from app.core.auth import get_auth_context
from app.db.session import get_session
from app.models.activity_events import ActivityEvent
from app.schemas.activity_events import ActivityEventRead
from app.services.admin_access import require_admin

router = APIRouter(prefix="/activity", tags=["activity"])


@router.get("", response_model=list[ActivityEventRead])
def list_activity(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    session: Session = Depends(get_session),
    auth=Depends(get_auth_context),
) -> list[ActivityEvent]:
    require_admin(auth)
    statement = (
        select(ActivityEvent).order_by(ActivityEvent.created_at.desc()).offset(offset).limit(limit)
    )
    return list(session.exec(statement))
