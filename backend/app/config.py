"""Application configuration settings.

This module defines environment-based configuration using Pydantic.
All settings can be overridden via environment variables or a .env file.
"""

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables.

    Attributes:
        app_host: Host address to bind the server.
        app_port: Port number for the server.
        app_debug: Enable debug mode.
        database_url: PostgreSQL connection string.
        jwt_secret: Secret key for JWT token signing.
        jwt_algorithm: Algorithm for JWT encoding (default: HS256).
        jwt_expire_minutes: Token expiration time in minutes.
        deepseek_api_key: API key for DeepSeek AI service.
        deepseek_api_url: DeepSeek API endpoint URL.
    """

    app_host: str = Field(default="0.0.0.0", env="APP_HOST")
    app_port: int = Field(default=8000, env="APP_PORT")
    app_debug: bool = Field(default=True, env="APP_DEBUG")

    database_url: str = Field(..., env="DATABASE_URL")

    jwt_secret: str = Field(..., env="JWT_SECRET")
    jwt_algorithm: str = Field(default="HS256", env="JWT_ALGORITHM")
    jwt_expire_minutes: int = Field(default=60, env="JWT_EXPIRE_MINUTES")

    deepseek_api_key: str = Field(..., env="DEEPSEEK_API_KEY")
    deepseek_api_url: str = Field(
        default="https://api.deepseek.com/chat/completions", env="DEEPSEEK_API_URL"
    )

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }


settings = Settings()
