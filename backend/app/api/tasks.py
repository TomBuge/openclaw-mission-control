from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.auth import get_auth_context
from app.db.session import get_session
from app.models.activity_events import ActivityEvent
from app.models.boards import Board
from app.models.tasks import Task
from app.schemas.tasks import TaskCreate, TaskRead, TaskUpdate
from app.services.admin_access import require_admin

router = APIRouter(prefix="/boards/{board_id}/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskRead])
def list_tasks(
    board_id: str,
    session: Session = Depends(get_session),
    auth=Depends(get_auth_context),
) -> list[Task]:
    require_admin(auth)
    board = session.get(Board, board_id)
    if board is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return list(session.exec(select(Task).where(Task.board_id == board.id)))


@router.post("", response_model=TaskRead)
def create_task(
    board_id: str,
    payload: TaskCreate,
    session: Session = Depends(get_session),
    auth=Depends(get_auth_context),
) -> Task:
    require_admin(auth)
    board = session.get(Board, board_id)
    if board is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    task = Task.model_validate(payload)
    task.board_id = board.id
    if task.created_by_user_id is None and auth.user is not None:
        task.created_by_user_id = auth.user.id
    session.add(task)
    session.commit()
    session.refresh(task)

    event = ActivityEvent(
        event_type="task.created",
        task_id=task.id,
        message=f"Task created: {task.title}.",
    )
    session.add(event)
    session.commit()
    return task


@router.patch("/{task_id}", response_model=TaskRead)
def update_task(
    board_id: str,
    task_id: str,
    payload: TaskUpdate,
    session: Session = Depends(get_session),
    auth=Depends(get_auth_context),
) -> Task:
    require_admin(auth)
    board = session.get(Board, board_id)
    if board is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    task = session.get(Task, task_id)
    if task is None or task.board_id != board.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    previous_status = task.status
    updates = payload.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(task, key, value)
    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    if "status" in updates and task.status != previous_status:
        event_type = "task.status_changed"
        message = f"Task moved to {task.status}: {task.title}."
    else:
        event_type = "task.updated"
        message = f"Task updated: {task.title}."
    event = ActivityEvent(event_type=event_type, task_id=task.id, message=message)
    session.add(event)
    session.commit()
    return task


@router.delete("/{task_id}")
def delete_task(
    board_id: str,
    task_id: str,
    session: Session = Depends(get_session),
    auth=Depends(get_auth_context),
) -> dict[str, bool]:
    require_admin(auth)
    board = session.get(Board, board_id)
    if board is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    task = session.get(Task, task_id)
    if task and task.board_id == board.id:
        session.delete(task)
        session.commit()
    return {"ok": True}
