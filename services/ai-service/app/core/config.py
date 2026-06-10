from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "HealthIA AI Service"
    environment: str = "development"
    mongo_enabled: bool = True
    mongo_uri: str = "mongodb://root:rootpassword@localhost:27017"
    mongo_db: str = "healthia"
    mongo_timeout_ms: int = 1200
    service_token: str | None = None
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    vision_enabled: bool = Field(
        default=False,
        validation_alias=AliasChoices("AI_SERVICE_VISION_ENABLED", "VISION_ENABLED"),
    )
    vision_model_name: str = Field(
        default="nateraw/food",
        validation_alias=AliasChoices(
            "AI_SERVICE_VISION_MODEL_NAME",
            "VISION_MODEL_NAME",
            "AI_SERVICE_VISION_MODEL_ID",
            "VISION_MODEL_ID",
        ),
    )
    vision_device: str = Field(
        default="cpu",
        validation_alias=AliasChoices("AI_SERVICE_VISION_DEVICE", "VISION_DEVICE"),
    )
    vision_model_path: str | None = Field(
        default=None,
        validation_alias=AliasChoices("AI_SERVICE_VISION_MODEL_PATH", "VISION_MODEL_PATH"),
    )

    @property
    def allowed_cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="AI_SERVICE_",
        extra="ignore",
    )


settings = Settings()
