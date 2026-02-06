from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import field_validator
from sqlmodel import SQLModel


class GatewayBase(SQLModel):
    name: str
    url: str
    main_session_key: str
    workspace_root: str


class GatewayCreate(GatewayBase):
    token: str | None = None

    @field_validator("token", mode="before")
    @classmethod
    def normalize_token(cls, value: Any) -> Any:
        if value is None:
            return None
        if isinstance(value, str):
            value = value.strip()
            return value or None
        return value


class GatewayUpdate(SQLModel):
    name: str | None = None
    url: str | None = None
    token: str | None = None
    main_session_key: str | None = None
    workspace_root: str | None = None

    @field_validator("token", mode="before")
    @classmethod
    def normalize_token(cls, value: Any) -> Any:
        if value is None:
            return None
        if isinstance(value, str):
            value = value.strip()
            return value or None
        return value


class GatewayRead(GatewayBase):
    id: UUID
    token: str | None = None
    created_at: datetime
    updated_at: datetime
