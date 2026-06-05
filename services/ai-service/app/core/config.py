from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "HealthIA AI Service"
    environment: str = "development"
    mongo_enabled: bool = True
    mongo_uri: str = "mongodb://root:rootpassword@localhost:27017"
    mongo_db: str = "healthia"
    mongo_timeout_ms: int = 1200

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="AI_SERVICE_",
        extra="ignore",
    )


settings = Settings()
