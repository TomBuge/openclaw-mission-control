from __future__ import annotations

from datetime import datetime
from uuid import UUID

from sqlmodel import SQLModel


class BoardBase(SQLModel):
    name: str
    slug: str


class BoardCreate(BoardBase):
    pass


class BoardUpdate(SQLModel):
    name: str | None = None
    slug: str | None = None


class BoardRead(BoardBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
