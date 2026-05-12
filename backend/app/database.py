import os
from typing import Generator

from sqlmodel import create_engine, Session, SQLModel
from dotenv import load_dotenv

load_dotenv()

# Allow a fallback sqlite DB for local development if DATABASE_URL not set
DATABASE_URL = os.getenv("DATABASE_URL") or "sqlite:///./trustlayer.db"

# sqlite needs special connect args for multithreaded usage
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, echo=True, connect_args=connect_args)


def create_db_and_tables() -> None:
    """Create database tables from SQLModel metadata."""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """Yield a SQLModel `Session` for use with dependency injection.

    Usage in FastAPI:
        from fastapi import Depends
        from app.database import get_session

        def endpoint(session: Session = Depends(get_session)):
            ...
    """
    with Session(engine) as session:
        yield session
