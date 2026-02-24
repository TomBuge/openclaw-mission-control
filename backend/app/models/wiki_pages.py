"""Wiki page model for internal knowledge base and documentation."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import Field

from app.core.time import utcnow
from app.models.tenancy import TenantScoped

RUNTIME_ANNOTATION_TYPES = (datetime,)


class WikiPage(TenantScoped, table=True):
    """A wiki page containing markdown content."""

    __tablename__ = "wiki_pages"  # pyright: ignore[reportAssignmentType]

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    organization_id: UUID = Field(foreign_key="organizations.id", index=True)
    title: str
    slug: str = Field(index=True)
    content: str = Field(default="")
    category: str = Field(default="general", index=True)
    author_name: str | None = None
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)
