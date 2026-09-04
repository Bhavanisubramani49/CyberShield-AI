import os
from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session

# Locate or create backend/data directory relative to backend root
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BACKEND_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

DB_PATH = DATA_DIR / "cybershield.db"
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

# SQLite connection with multi-thread FastAPI support
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def check_db_health() -> str:
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return "connected"
    except Exception as e:
        return f"error: {str(e)}"

def init_db():
    """Initializes tables and seeds initial demonstration events if database is empty"""
    import app.db.models  # Ensure models are imported so Base registers them
    Base.metadata.create_all(bind=engine)

    # Auto-migration for channel column in conversations table if table existed prior
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE conversations ADD COLUMN channel VARCHAR(32) DEFAULT 'WHATSAPP'"))
            conn.commit()
        except Exception:
            pass
    
    # Check if seed is needed
    from app.db.repository import event_repository
    event_repository.seed_if_empty()

    from app.db.conversation_repository import conversation_repository
    conversation_repository.seed_if_empty()
