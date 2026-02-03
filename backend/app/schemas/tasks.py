from __future__ import annotations

from datetime import datetime
from uuid import UUID

from sqlmodel import SQLModel


class TaskBase(SQLModel):
    title: str
    description: str | None = None
    status: str = "inbox"
    priority: str = "medium"
    due_at: datetime | None = None


class TaskCreate(TaskBase):
    created_by_user_id: UUID | None = None


class TaskUpdate(SQLModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
    priority: str | None = None
    due_at: datetime | None = None


class TaskRead(TaskBase):
    id: UUID
    board_id: UUID | None
    created_by_user_id: UUID | None
    created_at: datetime
    updated_at: datetime
