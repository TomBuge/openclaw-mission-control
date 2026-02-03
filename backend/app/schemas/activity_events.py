from __future__ import annotations

from datetime import datetime
from uuid import UUID

from sqlmodel import SQLModel


class ActivityEventRead(SQLModel):
    id: UUID
    event_type: str
    message: str | None
    agent_id: UUID | None
    task_id: UUID | None
    created_at: datetime
