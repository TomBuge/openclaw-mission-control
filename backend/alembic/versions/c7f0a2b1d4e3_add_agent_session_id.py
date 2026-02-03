"""add agent openclaw session id

Revision ID: c7f0a2b1d4e3
Revises: a1b2c3d4e5f6
Create Date: 2026-02-04 02:20:00.000000

"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision = "c7f0a2b1d4e3"
down_revision = "a1b2c3d4e5f6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "agents",
        sa.Column("openclaw_session_id", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    )
    op.create_index(
        op.f("ix_agents_openclaw_session_id"),
        "agents",
        ["openclaw_session_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_agents_openclaw_session_id"), table_name="agents")
    op.drop_column("agents", "openclaw_session_id")
