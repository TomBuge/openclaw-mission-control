from __future__ import annotations

import logging
from collections.abc import Generator
from pathlib import Path

from sqlmodel import Session, SQLModel, create_engine

from alembic import command
from alembic.config import Config
from app import models  # noqa: F401
from app.core.config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True)
logger = logging.getLogger(__name__)


def _alembic_config() -> Config:
    alembic_ini = Path(__file__).resolve().parents[2] / "alembic.ini"
    alembic_cfg = Config(str(alembic_ini))
    alembic_cfg.attributes["configure_logger"] = False
    return alembic_cfg


def run_migrations() -> None:
    logger.info("Running database migrations.")
    command.upgrade(_alembic_config(), "head")
    logger.info("Database migrations complete.")


def init_db() -> None:
    if settings.db_auto_migrate:
        versions_dir = Path(__file__).resolve().parents[2] / "alembic" / "versions"
        if any(versions_dir.glob("*.py")):
            logger.info("Running Alembic migrations on startup")
            run_migrations()
            return
        logger.warning("No Alembic revisions found; falling back to create_all")

    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
