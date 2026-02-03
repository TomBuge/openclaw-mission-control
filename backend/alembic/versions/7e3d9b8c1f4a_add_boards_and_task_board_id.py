"""add boards and task board id

Revision ID: 7e3d9b8c1f4a
Revises: 5630abfa60f8
Create Date: 2026-02-03 20:12:00.000000

"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision = "7e3d9b8c1f4a"
down_revision = "5630abfa60f8"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "boards",
        sa.Column("org_id", sa.Uuid(), nullable=False),
        sa.Column("workspace_id", sa.Uuid(), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("slug", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["org_id"],
            ["orgs.id"],
        ),
        sa.ForeignKeyConstraint(
            ["workspace_id"],
            ["workspaces.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_boards_org_id"), "boards", ["org_id"], unique=False)
    op.create_index(
        op.f("ix_boards_workspace_id"), "boards", ["workspace_id"], unique=False
    )
    op.create_index(op.f("ix_boards_slug"), "boards", ["slug"], unique=False)

    op.add_column("tasks", sa.Column("board_id", sa.Uuid(), nullable=True))
    op.create_index(op.f("ix_tasks_board_id"), "tasks", ["board_id"], unique=False)
    op.create_foreign_key(
        "fk_tasks_board_id_boards", "tasks", "boards", ["board_id"], ["id"]
    )


def downgrade() -> None:
    op.drop_constraint("fk_tasks_board_id_boards", "tasks", type_="foreignkey")
    op.drop_index(op.f("ix_tasks_board_id"), table_name="tasks")
    op.drop_column("tasks", "board_id")

    op.drop_index(op.f("ix_boards_slug"), table_name="boards")
    op.drop_index(op.f("ix_boards_workspace_id"), table_name="boards")
    op.drop_index(op.f("ix_boards_org_id"), table_name="boards")
    op.drop_table("boards")
