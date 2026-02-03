"""drop tenancy tables and columns

Revision ID: 9c4f1a2b3d4e
Revises: 8b6d1b8f4b21
Create Date: 2026-02-03 23:35:00.000000

"""

from __future__ import annotations

from alembic import op


# revision identifiers, used by Alembic.
revision = "9c4f1a2b3d4e"
down_revision = "8b6d1b8f4b21"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_table("task_subagents")
    op.drop_table("task_status_history")
    op.drop_table("task_deliverables")
    op.drop_table("task_activities")
    op.drop_table("transcripts")
    op.drop_table("openclaw_sessions")
    op.drop_table("workspace_api_tokens")
    op.drop_table("orchestration_templates")
    op.drop_table("memberships")
    op.drop_table("gateway_configs")

    op.drop_constraint("tasks_assigned_agent_id_fkey", "tasks", type_="foreignkey")
    op.drop_constraint("tasks_org_id_fkey", "tasks", type_="foreignkey")
    op.drop_constraint("tasks_workspace_id_fkey", "tasks", type_="foreignkey")
    op.drop_index(op.f("ix_tasks_assigned_agent_id"), table_name="tasks")
    op.drop_index(op.f("ix_tasks_org_id"), table_name="tasks")
    op.drop_index(op.f("ix_tasks_workspace_id"), table_name="tasks")
    op.drop_column("tasks", "assigned_agent_id")
    op.drop_column("tasks", "org_id")
    op.drop_column("tasks", "workspace_id")

    op.drop_constraint("boards_org_id_fkey", "boards", type_="foreignkey")
    op.drop_constraint("boards_workspace_id_fkey", "boards", type_="foreignkey")
    op.drop_index(op.f("ix_boards_org_id"), table_name="boards")
    op.drop_index(op.f("ix_boards_workspace_id"), table_name="boards")
    op.drop_column("boards", "org_id")
    op.drop_column("boards", "workspace_id")

    op.drop_table("agents")
    op.drop_table("workspaces")
    op.drop_table("orgs")


def downgrade() -> None:
    raise NotImplementedError("Downgrade not supported for simplified tenancy removal.")
