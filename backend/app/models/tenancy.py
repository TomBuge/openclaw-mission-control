from __future__ import annotations

from sqlmodel import SQLModel


class TenantScoped(SQLModel, table=False):
    pass
