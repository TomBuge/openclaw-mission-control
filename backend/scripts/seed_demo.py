from __future__ import annotations

from uuid import uuid4

from sqlmodel import Session

from app.db.session import engine
from app.models.orgs import Org, Workspace
from app.models.users import Membership, User


def run() -> None:
    with Session(engine) as session:
        org = Org(name="Demo Org", slug="demo-org")
        session.add(org)
        session.commit()
        session.refresh(org)

        workspace = Workspace(org_id=org.id, name="Demo Workspace", slug="demo-workspace")
        session.add(workspace)
        session.commit()
        session.refresh(workspace)

        user = User(
            clerk_user_id=f"demo-{uuid4()}",
            email="demo@example.com",
            name="Demo Admin",
            is_super_admin=True,
        )
        session.add(user)
        session.commit()
        session.refresh(user)

        membership = Membership(
            org_id=org.id,
            workspace_id=workspace.id,
            user_id=user.id,
            role="admin",
        )
        session.add(membership)

        session.commit()


if __name__ == "__main__":
    run()
