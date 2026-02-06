"""remove skyll_enabled

Revision ID: 9f0c4fb2a7b8
Revises: 3c6a2d3df4a1
Create Date: 2026-02-06
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "9f0c4fb2a7b8"
down_revision = "3c6a2d3df4a1"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_column("gateways", "skyll_enabled")


def downgrade() -> None:
    op.add_column(
        "gateways",
        sa.Column(
            "skyll_enabled",
            sa.Boolean(),
            server_default=sa.text("false"),
            nullable=False,
        ),
    )

