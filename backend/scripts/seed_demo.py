from __future__ import annotations

import asyncio
from uuid import uuid4

from app.db.session import async_session_maker, init_db
from app.models.agents import Agent
from app.models.boards import Board
from app.models.gateways import Gateway
from app.models.users import User


async def run() -> None:
    await init_db()
    async with async_session_maker() as session:
        gateway = Gateway(
            name="Demo Gateway",
            url="http://localhost:8080",
            token=None,
            main_session_key="demo:main",
            workspace_root="/tmp/openclaw-demo",
        )
        session.add(gateway)
        await session.commit()
        await session.refresh(gateway)

        board = Board(
            name="Demo Board",
            slug="demo-board",
            gateway_id=gateway.id,
            board_type="goal",
            objective="Demo objective",
            success_metrics={"demo": True},
        )
        session.add(board)
        await session.commit()
        await session.refresh(board)

        user = User(
            clerk_user_id=f"demo-{uuid4()}",
            email="demo@example.com",
            name="Demo Admin",
            is_super_admin=True,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)

        lead = Agent(
            board_id=board.id,
            name="Lead Agent",
            status="online",
            is_board_lead=True,
        )
        session.add(lead)
        await session.commit()


if __name__ == "__main__":
    asyncio.run(run())
