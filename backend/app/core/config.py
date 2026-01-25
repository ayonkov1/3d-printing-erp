from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "3D Printing ERP"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database
    POSTGRES_USER: str = "erp_user"
    POSTGRES_PASSWORD: str = "erp_password"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str = "erp_db"

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # CORS - Remove CORS since Nginx handles same-origin requests
    CORS_ORIGINS: List[str] = ["*"]

    # JWT Authentication
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = (
        30  # 30 minutes (best practice: 5-15 min, 30 for dev)
    )
    # Note: In production, consider 5-15 minutes with refresh tokens

    # OpenAI Configuration
    OPENAI_API_KEY: Optional[str] = None  # Set via environment variable
    OPENAI_MODEL: str = "gpt-4o-mini"  # Cost-effective model for insights

    model_config = SettingsConfigDict(
        env_file=".env", case_sensitive=True, extra="ignore"
    )


# Create global settings instance
settings = Settings()
