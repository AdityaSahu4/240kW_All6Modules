import os
from functools import lru_cache

class Settings:
    APP_NAME: str = "240kW 6M"
    DEBUG: bool = True

    # Main application database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///database/app.db"
    )

    # Auth database
    AUTH_DATABASE_URL: str = os.getenv(
        "AUTH_DATABASE_URL",
        "sqlite:///database/auth.db"
    )

@lru_cache()
def get_settings() -> Settings:
    return Settings()
