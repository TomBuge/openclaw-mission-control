# Mission Control Orchestration Guide

This document explains how to orchestrate tasks in Mission Control, including how to:
- Register sub-agents
- Log activities
- Track deliverables
- Update task status

## API Base URL

```
http://localhost:8000
```

Or use the `BASE_URL` environment variable.

## Task Lifecycle

```
INBOX → IN_PROGRESS → REVIEW → DONE
```

**Status Descriptions:**
- **INBOX**: New tasks awaiting processing
- **IN_PROGRESS**: Agent actively working on the task
- **REVIEW**: Agent finished, awaiting human approval
- **DONE**: Task completed and approved

Optional statuses may be enabled (`ASSIGNED`, `TESTING`) but are not required by default.

## When You Receive a Task

When a task is claimed, the response includes:
- Task ID
- Title, description, priority
- Project ID

## Required API Calls

### 1. Register Sub-Agent (when spawning a worker)

```bash
curl -X POST "$BASE_URL/api/v1/orgs/$ORG_ID/workspaces/$WORKSPACE_ID/tasks/{TASK_ID}/subagents" \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "openclaw_session_id": "unique-session-id",
    "agent_name": "Designer"
  }'
```

### 2. Log Activity (for each significant action)

```bash
curl -X POST "$BASE_URL/api/v1/orgs/$ORG_ID/workspaces/$WORKSPACE_ID/tasks/{TASK_ID}/activities" \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "activity_type": "updated",
    "message": "Started working on design mockups"
  }'
```

Activity types:
- `spawned` - When sub-agent starts
- `updated` - Progress update
- `completed` - Work finished
- `file_created` - Created a deliverable
- `status_changed` - Task moved to new status

### 3. Register Deliverable (for each output)

```bash
curl -X POST "$BASE_URL/api/v1/orgs/$ORG_ID/workspaces/$WORKSPACE_ID/tasks/{TASK_ID}/deliverables" \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Homepage Design",
    "markdown_content": "## Summary\n- Implemented layout\n- Added responsive styles"
  }'
```

### 4. Update Task Status

```bash
curl -X POST "$BASE_URL/api/v1/orgs/$ORG_ID/workspaces/$WORKSPACE_ID/tasks/{TASK_ID}/transition" \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "to_status": "review" }'
```

## Complete Example Workflow

```bash
TASK_ID="abc-123"
BASE_URL="http://localhost:8000"
ORG_ID="org-uuid"
WORKSPACE_ID="workspace-uuid"
AGENT_TOKEN="agent-token"

# 1) Log that you're starting
curl -X POST "$BASE_URL/api/v1/orgs/$ORG_ID/workspaces/$WORKSPACE_ID/tasks/$TASK_ID/activities" \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"activity_type": "updated", "message": "Starting work on task"}'

# 2) Spawn a sub-agent
curl -X POST "$BASE_URL/api/v1/orgs/$ORG_ID/workspaces/$WORKSPACE_ID/tasks/$TASK_ID/subagents" \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"openclaw_session_id": "subagent-'$(date +%s)'", "agent_name": "Designer"}'

# 3) Register the deliverable
curl -X POST "$BASE_URL/api/v1/orgs/$ORG_ID/workspaces/$WORKSPACE_ID/tasks/$TASK_ID/deliverables" \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Completed Design",
    "markdown_content": "## Deliverable\n- Final design with all requested features"
  }'

# 4) Log completion
curl -X POST "$BASE_URL/api/v1/orgs/$ORG_ID/workspaces/$WORKSPACE_ID/tasks/$TASK_ID/activities" \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"activity_type": "completed", "message": "Design completed successfully"}'

# 5) Move to review
curl -X POST "$BASE_URL/api/v1/orgs/$ORG_ID/workspaces/$WORKSPACE_ID/tasks/$TASK_ID/transition" \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"to_status": "review"}'
```

## Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/orgs/{org_id}/workspaces/{workspace_id}/tasks` | GET | List tasks |
| `/api/v1/orgs/{org_id}/workspaces/{workspace_id}/tasks` | POST | Create task |
| `/api/v1/orgs/{org_id}/workspaces/{workspace_id}/tasks/{task_id}` | PATCH | Update task |
| `/api/v1/orgs/{org_id}/workspaces/{workspace_id}/tasks/{task_id}/activities` | GET | List activities |
| `/api/v1/orgs/{org_id}/workspaces/{workspace_id}/tasks/{task_id}/activities` | POST | Log activity |
| `/api/v1/orgs/{org_id}/workspaces/{workspace_id}/tasks/{task_id}/deliverables` | GET | List deliverables |
| `/api/v1/orgs/{org_id}/workspaces/{workspace_id}/tasks/{task_id}/deliverables` | POST | Add deliverable |
| `/api/v1/orgs/{org_id}/workspaces/{workspace_id}/tasks/{task_id}/subagents` | GET | List sub-agents |
| `/api/v1/orgs/{org_id}/workspaces/{workspace_id}/tasks/{task_id}/subagents` | POST | Register sub-agent |
| `/api/v1/orgs/{org_id}/workspaces/{workspace_id}/tasks/claim-next` | POST | Claim next task (FIFO) |
| `/api/v1/orgs/{org_id}/workspaces/{workspace_id}/events/activities` | GET | SSE activity stream |

## Activity Body Schema

```json
{
  "activity_type": "spawned|updated|completed|file_created|status_changed",
  "message": "Human-readable description of what happened"
}
```

## Deliverable Body Schema

```json
{
  "title": "Display name for the deliverable",
  "markdown_content": "Markdown content for the deliverable"
}
```

## Sub-Agent Body Schema

```json
{
  "openclaw_session_id": "unique-identifier-for-session",
  "agent_name": "Designer|Developer|Researcher|Writer"
}
```
