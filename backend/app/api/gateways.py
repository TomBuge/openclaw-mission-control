from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import col, select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.agent_tokens import generate_agent_token, hash_agent_token
from app.core.auth import AuthContext, get_auth_context
from app.core.time import utcnow
from app.db.pagination import paginate
from app.db.session import get_session
from app.integrations.openclaw_gateway import GatewayConfig as GatewayClientConfig
from app.integrations.openclaw_gateway import OpenClawGatewayError, ensure_session, send_message
from app.models.agents import Agent
from app.models.gateways import Gateway
from app.schemas.common import OkResponse
from app.schemas.gateways import GatewayCreate, GatewayRead, GatewayUpdate
from app.schemas.pagination import DefaultLimitOffsetPage
from app.services.agent_provisioning import DEFAULT_HEARTBEAT_CONFIG, provision_main_agent

router = APIRouter(prefix="/gateways", tags=["gateways"])


def _main_agent_name(gateway: Gateway) -> str:
    return f"{gateway.name} Main"


async def _find_main_agent(
    session: AsyncSession,
    gateway: Gateway,
    previous_name: str | None = None,
    previous_session_key: str | None = None,
) -> Agent | None:
    if gateway.main_session_key:
        agent = (
            await session.exec(
                select(Agent).where(Agent.openclaw_session_id == gateway.main_session_key)
            )
        ).first()
        if agent:
            return agent
    if previous_session_key:
        agent = (
            await session.exec(
                select(Agent).where(Agent.openclaw_session_id == previous_session_key)
            )
        ).first()
        if agent:
            return agent
    names = {_main_agent_name(gateway)}
    if previous_name:
        names.add(f"{previous_name} Main")
    for name in names:
        agent = (await session.exec(select(Agent).where(Agent.name == name))).first()
        if agent:
            return agent
    return None


async def _ensure_main_agent(
    session: AsyncSession,
    gateway: Gateway,
    auth: AuthContext,
    *,
    previous_name: str | None = None,
    previous_session_key: str | None = None,
    action: str = "provision",
) -> Agent | None:
    if not gateway.url or not gateway.main_session_key:
        return None
    agent = await _find_main_agent(session, gateway, previous_name, previous_session_key)
    if agent is None:
        agent = Agent(
            name=_main_agent_name(gateway),
            status="provisioning",
            board_id=None,
            is_board_lead=False,
            openclaw_session_id=gateway.main_session_key,
            heartbeat_config=DEFAULT_HEARTBEAT_CONFIG.copy(),
            identity_profile={
                "role": "Main Agent",
                "communication_style": "direct, concise, practical",
                "emoji": ":compass:",
            },
        )
        session.add(agent)
    agent.name = _main_agent_name(gateway)
    agent.openclaw_session_id = gateway.main_session_key
    raw_token = generate_agent_token()
    agent.agent_token_hash = hash_agent_token(raw_token)
    agent.provision_requested_at = utcnow()
    agent.provision_action = action
    agent.updated_at = utcnow()
    if agent.heartbeat_config is None:
        agent.heartbeat_config = DEFAULT_HEARTBEAT_CONFIG.copy()
    session.add(agent)
    await session.commit()
    await session.refresh(agent)
    try:
        await provision_main_agent(agent, gateway, raw_token, auth.user, action=action)
        await ensure_session(
            gateway.main_session_key,
            config=GatewayClientConfig(url=gateway.url, token=gateway.token),
            label=agent.name,
        )
        await send_message(
            (
                f"Hello {agent.name}. Your gateway provisioning was updated.\n\n"
                "Please re-read AGENTS.md, USER.md, HEARTBEAT.md, and TOOLS.md. "
                "If BOOTSTRAP.md exists, run it once then delete it. Begin heartbeats after startup."
            ),
            session_key=gateway.main_session_key,
            config=GatewayClientConfig(url=gateway.url, token=gateway.token),
            deliver=True,
        )
    except OpenClawGatewayError:
        # Best-effort provisioning.
        pass
    return agent


@router.get("", response_model=DefaultLimitOffsetPage[GatewayRead])
async def list_gateways(
    session: AsyncSession = Depends(get_session),
    auth: AuthContext = Depends(get_auth_context),
) -> DefaultLimitOffsetPage[GatewayRead]:
    statement = select(Gateway).order_by(col(Gateway.created_at).desc())
    return await paginate(session, statement)


@router.post("", response_model=GatewayRead)
async def create_gateway(
    payload: GatewayCreate,
    session: AsyncSession = Depends(get_session),
    auth: AuthContext = Depends(get_auth_context),
) -> Gateway:
    data = payload.model_dump()
    gateway = Gateway.model_validate(data)
    session.add(gateway)
    await session.commit()
    await session.refresh(gateway)
    await _ensure_main_agent(session, gateway, auth, action="provision")
    return gateway


@router.get("/{gateway_id}", response_model=GatewayRead)
async def get_gateway(
    gateway_id: UUID,
    session: AsyncSession = Depends(get_session),
    auth: AuthContext = Depends(get_auth_context),
) -> Gateway:
    gateway = await session.get(Gateway, gateway_id)
    if gateway is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gateway not found")
    return gateway


@router.patch("/{gateway_id}", response_model=GatewayRead)
async def update_gateway(
    gateway_id: UUID,
    payload: GatewayUpdate,
    session: AsyncSession = Depends(get_session),
    auth: AuthContext = Depends(get_auth_context),
) -> Gateway:
    gateway = await session.get(Gateway, gateway_id)
    if gateway is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gateway not found")
    previous_name = gateway.name
    previous_session_key = gateway.main_session_key
    updates = payload.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(gateway, key, value)
    session.add(gateway)
    await session.commit()
    await session.refresh(gateway)
    await _ensure_main_agent(
        session,
        gateway,
        auth,
        previous_name=previous_name,
        previous_session_key=previous_session_key,
        action="update",
    )
    return gateway


@router.delete("/{gateway_id}", response_model=OkResponse)
async def delete_gateway(
    gateway_id: UUID,
    session: AsyncSession = Depends(get_session),
    auth: AuthContext = Depends(get_auth_context),
) -> OkResponse:
    gateway = await session.get(Gateway, gateway_id)
    if gateway is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gateway not found")
    await session.delete(gateway)
    await session.commit()
    return OkResponse()
