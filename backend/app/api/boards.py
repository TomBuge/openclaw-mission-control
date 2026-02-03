from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.auth import get_auth_context
from app.db.session import get_session
from app.models.boards import Board
from app.schemas.boards import BoardCreate, BoardRead, BoardUpdate
from app.services.admin_access import require_admin

router = APIRouter(prefix="/boards", tags=["boards"])


@router.get("", response_model=list[BoardRead])
def list_boards(
    session: Session = Depends(get_session),
    auth=Depends(get_auth_context),
) -> list[Board]:
    require_admin(auth)
    return list(session.exec(select(Board)))


@router.post("", response_model=BoardRead)
def create_board(
    payload: BoardCreate,
    session: Session = Depends(get_session),
    auth=Depends(get_auth_context),
) -> Board:
    require_admin(auth)
    board = Board.model_validate(payload)
    session.add(board)
    session.commit()
    session.refresh(board)
    return board


@router.get("/{board_id}", response_model=BoardRead)
def get_board(
    board_id: str,
    session: Session = Depends(get_session),
    auth=Depends(get_auth_context),
) -> Board:
    require_admin(auth)
    board = session.get(Board, board_id)
    if board is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return board


@router.patch("/{board_id}", response_model=BoardRead)
def update_board(
    board_id: str,
    payload: BoardUpdate,
    session: Session = Depends(get_session),
    auth=Depends(get_auth_context),
) -> Board:
    require_admin(auth)
    board = session.get(Board, board_id)
    if board is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    updates = payload.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(board, key, value)
    session.add(board)
    session.commit()
    session.refresh(board)
    return board


@router.delete("/{board_id}")
def delete_board(
    board_id: str,
    session: Session = Depends(get_session),
    auth=Depends(get_auth_context),
) -> dict[str, bool]:
    require_admin(auth)
    board = session.get(Board, board_id)
    if board:
        session.delete(board)
        session.commit()
    return {"ok": True}
