from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Articulate AI API"
    env: str = "dev"
    api_prefix: str = "/api/v1"
    cors_origins: str = "http://localhost:5500,http://127.0.0.1:5500"
    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    retention_days: int = 90
    max_files_per_upload: int = 10
    max_file_size_mb: int = 10
    model_provider: str = "gemini"
    mfa_required: bool = True
    database_url: str = "sqlite:///./articulate_ai.db"
    google_client_id: str = ""
    gemini_api_key: str = ""
    gemini_model: str = "gemini-1.5-flash"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]


settings = Settings()
