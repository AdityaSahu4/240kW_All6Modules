from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from core.config import get_settings

settings = get_settings()

# ==============================
# MAIN APPLICATION DATABASE
# ==============================

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ==============================
# AUTH DATABASE (SEPARATE)
# ==============================

auth_engine = create_engine(
    settings.AUTH_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

AuthSessionLocal = sessionmaker(
    bind=auth_engine,
    autoflush=False,
    autocommit=False
)

AuthBase = declarative_base()

def get_auth_db():
    db = AuthSessionLocal()
    try:
        yield db
    finally:
        db.close()
