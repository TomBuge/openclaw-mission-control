"""merge heads: skills marketplace + master

Revision ID: 9e4bf062dec4
Revises: 2a4fe0f6df5b, c9d7e9b6a4f2
Create Date: 2026-02-13 22:23:58.385844

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9e4bf062dec4'
down_revision = ('2a4fe0f6df5b', 'c9d7e9b6a4f2')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
