"""Application configuration settings."""
from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Task Management API"
    database_url: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60
    deepseek_api_key: str | None = None
    deepseek_api_url: str = "https://api.deepseek.com/chat/completions"

    model_config = {
        "env_file": ".env",
        "env_prefix": "",
        "case_sensitive": False,
    }


@lru_cache
def get_settings() -> Settings:
    return Settings()
