"""drop projects and task project_id

Revision ID: 8b6d1b8f4b21
Revises: 7e3d9b8c1f4a
Create Date: 2026-02-03 23:05:00.000000

"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision = "8b6d1b8f4b21"
down_revision = "7e3d9b8c1f4a"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_constraint("tasks_project_id_fkey", "tasks", type_="foreignkey")
    op.drop_index(op.f("ix_tasks_project_id"), table_name="tasks")
    op.drop_column("tasks", "project_id")

    op.drop_index(op.f("ix_projects_workspace_id"), table_name="projects")
    op.drop_index(op.f("ix_projects_status"), table_name="projects")
    op.drop_index(op.f("ix_projects_org_id"), table_name="projects")
    op.drop_table("projects")


def downgrade() -> None:
    op.create_table(
        "projects",
        sa.Column("org_id", sa.Uuid(), nullable=False),
        sa.Column("workspace_id", sa.Uuid(), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("description", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("status", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
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
    op.create_index(op.f("ix_projects_org_id"), "projects", ["org_id"], unique=False)
    op.create_index(op.f("ix_projects_status"), "projects", ["status"], unique=False)
    op.create_index(op.f("ix_projects_workspace_id"), "projects", ["workspace_id"], unique=False)

    op.add_column("tasks", sa.Column("project_id", sa.Uuid(), nullable=True))
    op.create_index(op.f("ix_tasks_project_id"), "tasks", ["project_id"], unique=False)
    op.create_foreign_key(
        "tasks_project_id_fkey", "tasks", "projects", ["project_id"], ["id"]
    )
