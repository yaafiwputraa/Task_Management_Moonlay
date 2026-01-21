from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
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
        "env_file_encoding": "utf-8"
    }


settings = Settings()
