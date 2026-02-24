"""Wiki pages API for internal documentation."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import SQLModel, Field, col, select

from app.api.deps import AUTH_DEP, ACTOR_DEP, SESSION_DEP, ActorContext, AuthContext
from app.core.time import utcnow
from app.models.wiki_pages import WikiPage

router = APIRouter(prefix="/wiki", tags=["wiki"])


class WikiPageCreate(SQLModel):
    title: str
    slug: str
    content: str = ""
    category: str = "general"


class WikiPageUpdate(SQLModel):
    title: str | None = None
    content: str | None = None
    category: str | None = None


class WikiPageRead(SQLModel):
    id: UUID
    title: str
    slug: str
    content: str
    category: str
    author_name: str | None
    created_at: datetime
    updated_at: datetime


class WikiPageListItem(SQLModel):
    id: UUID
    title: str
    slug: str
    category: str
    author_name: str | None
    created_at: datetime
    updated_at: datetime


@router.get("", response_model=list[WikiPageListItem])
async def list_wiki_pages(
    session: AsyncSession = SESSION_DEP,
    _auth: AuthContext = AUTH_DEP,
    category: str | None = None,
) -> list[WikiPage]:
    query = select(WikiPage).order_by(col(WikiPage.category), col(WikiPage.title))
    if category:
        query = query.where(col(WikiPage.category) == category)
    result = await session.exec(query)
    return list(result.all())


@router.get("/{page_id}", response_model=WikiPageRead)
async def get_wiki_page(
    page_id: UUID,
    session: AsyncSession = SESSION_DEP,
    _auth: AuthContext = AUTH_DEP,
) -> WikiPage:
    page = await session.get(WikiPage, page_id)
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page


@router.get("/by-slug/{slug}", response_model=WikiPageRead)
async def get_wiki_page_by_slug(
    slug: str,
    session: AsyncSession = SESSION_DEP,
    _auth: AuthContext = AUTH_DEP,
) -> WikiPage:
    result = await session.exec(select(WikiPage).where(col(WikiPage.slug) == slug))
    page = result.first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page


@router.post("", response_model=WikiPageRead, status_code=201)
async def create_wiki_page(
    payload: WikiPageCreate,
    session: AsyncSession = SESSION_DEP,
    actor: ActorContext = ACTOR_DEP,
) -> WikiPage:
    author = None
    if actor.actor_type == "user" and actor.user:
        author = actor.user.preferred_name or actor.user.name
    elif actor.actor_type == "agent" and actor.agent:
        author = actor.agent.name

    page = WikiPage(
        title=payload.title,
        slug=payload.slug,
        content=payload.content,
        category=payload.category,
        author_name=author,
        organization_id=actor.user.active_organization_id if actor.user else None,
    )
    session.add(page)
    await session.commit()
    await session.refresh(page)
    return page


@router.patch("/{page_id}", response_model=WikiPageRead)
async def update_wiki_page(
    page_id: UUID,
    payload: WikiPageUpdate,
    session: AsyncSession = SESSION_DEP,
    actor: ActorContext = ACTOR_DEP,
) -> WikiPage:
    page = await session.get(WikiPage, page_id)
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    if payload.title is not None:
        page.title = payload.title
    if payload.content is not None:
        page.content = payload.content
    if payload.category is not None:
        page.category = payload.category
    page.updated_at = utcnow()

    if actor.actor_type == "user" and actor.user:
        page.author_name = actor.user.preferred_name or actor.user.name
    elif actor.actor_type == "agent" and actor.agent:
        page.author_name = actor.agent.name

    session.add(page)
    await session.commit()
    await session.refresh(page)
    return page


@router.delete("/{page_id}", status_code=204)
async def delete_wiki_page(
    page_id: UUID,
    session: AsyncSession = SESSION_DEP,
    _actor: ActorContext = ACTOR_DEP,
) -> None:
    page = await session.get(WikiPage, page_id)
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    await session.delete(page)
    await session.commit()
