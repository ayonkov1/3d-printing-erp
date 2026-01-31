import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional, Union
from pathlib import Path


class Settings(BaseSettings):
    # App
    APP_NAME: str = "3D Printing ERP"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # CORS - Accept either comma-separated string or JSON array
    CORS_ORIGINS: Union[List[str], str] = "*"

    @property
    def cors_origins_list(self) -> List[str]:
        """Convert CORS_ORIGINS to a list regardless of input format"""
        if isinstance(self.CORS_ORIGINS, list):
            return self.CORS_ORIGINS
        if isinstance(self.CORS_ORIGINS, str):
            if self.CORS_ORIGINS == "*":
                return ["*"]
            # Split by comma for comma-separated values
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
        return ["*"]

    # JWT Authentication
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # OpenAI Configuration (for AI Insights)
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"

    model_config = SettingsConfigDict(
        case_sensitive=True,
        extra="ignore",
    )


# Create global settings instance
settings = Settings()
