from __future__ import annotations

from datetime import datetime
from uuid import UUID

from sqlmodel import SQLModel


class AgentBase(SQLModel):
    name: str
    status: str = "online"


class AgentCreate(AgentBase):
    pass


class AgentUpdate(SQLModel):
    name: str | None = None
    status: str | None = None


class AgentRead(AgentBase):
    id: UUID
    openclaw_session_id: str | None = None
    last_seen_at: datetime
    created_at: datetime
    updated_at: datetime


class AgentHeartbeat(SQLModel):
    status: str | None = None


class AgentHeartbeatCreate(AgentHeartbeat):
    name: str
