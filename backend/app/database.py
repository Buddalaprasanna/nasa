import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Database path - default to field_shift.db in the backend folder
DEFAULT_DB_FILE = Path(__file__).resolve().parent.parent / "field_shift.db"
_env_db = os.getenv("DATABASE_URL")
if not _env_db or _env_db == "sqlite:///./field_shift.db":
    DB_PATH = f"sqlite:///{DEFAULT_DB_FILE.as_posix()}"
else:
    DB_PATH = _env_db

# For SQLite, check_same_thread is set to False for multi-threaded FastAPI workers
connect_args = {"check_same_thread": False} if DB_PATH.startswith("sqlite") else {}

engine = create_engine(DB_PATH, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """FastAPI dependency that yields a SQLAlchemy database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
