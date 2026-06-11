from pathlib import Path

from app.core.config import settings

SERVICE_ROOT = Path(__file__).resolve().parents[2]

NUTRITION_ENCODERS = [
    "nutrition_le_objectif.joblib",
    "nutrition_le_regime.joblib",
    "nutrition_le_label.joblib",
]
SPORT_ENCODERS = [
    "sport_le_objectif.joblib",
    "sport_le_niveau.joblib",
    "sport_le_materiel.joblib",
    "sport_le_label.joblib",
]


def nutrition_model_status() -> dict:
    return _model_status(
        kind="nutrition",
        enabled=settings.nutrition_model_enabled,
        configured_path=settings.nutrition_model_path,
        engine_model="healthai-nutrition-recommender-v1",
        fallback_model="healthai-nutrition-fallback-v1",
        expected_model_file="nutrition_model.joblib",
        expected_encoders=NUTRITION_ENCODERS,
    )


def sport_model_status() -> dict:
    return _model_status(
        kind="sport",
        enabled=settings.sport_model_enabled,
        configured_path=settings.sport_model_path,
        engine_model="healthai-sport-recommender-v1",
        fallback_model="healthai-sport-fallback-v1",
        expected_model_file="sport_model.joblib",
        expected_encoders=SPORT_ENCODERS,
    )


def _model_status(
    kind: str,
    enabled: bool,
    configured_path: str | None,
    engine_model: str,
    fallback_model: str,
    expected_model_file: str,
    expected_encoders: list[str],
) -> dict:
    model_path = _resolve_model_path(configured_path, expected_model_file)
    required_artifacts = [_artifact_status(model_path)]
    required_artifacts.extend(_artifact_status(model_path.parent / encoder) for encoder in expected_encoders)
    artifacts_complete = all(artifact["nonEmpty"] for artifact in required_artifacts)

    # The notebook audit found reusable rules/scoring, but no compatible trained
    # model bundle. The rule engine is active; the ML artifact loader is not.
    loader_available = False
    trained_model_available = bool(enabled and artifacts_complete and loader_available)

    return {
        "enabled": True,
        "configured": bool(enabled),
        "engineAvailable": True,
        "engineType": "rules-scoring",
        "trainedModelAvailable": trained_model_available,
        "modelAvailable": trained_model_available,
        "artifactPresent": required_artifacts[0]["exists"],
        "artifactNonEmpty": required_artifacts[0]["nonEmpty"],
        "artifactsComplete": artifacts_complete,
        "loaderAvailable": loader_available,
        "modelPath": str(model_path),
        "modelName": engine_model,
        "fallbackModelName": fallback_model,
        "targetModelName": f"healthai-{kind}-trained-v1",
        "requiredArtifacts": required_artifacts,
        "fallbackAvailable": True,
        "fallbackUsedByDefault": False,
        "reason": _status_reason(kind, enabled, required_artifacts, artifacts_complete, loader_available),
    }


def _resolve_model_path(configured_path: str | None, default_filename: str) -> Path:
    raw_path = configured_path or f"./data/models/{default_filename}"
    path = Path(raw_path)
    if path.is_absolute():
        return path
    return SERVICE_ROOT / path


def _artifact_status(path: Path) -> dict:
    exists = path.is_file()
    size = path.stat().st_size if exists else 0
    return {
        "path": str(path),
        "exists": exists,
        "sizeBytes": size,
        "nonEmpty": bool(exists and size > 0),
    }


def _status_reason(
    kind: str,
    enabled: bool,
    required_artifacts: list[dict],
    artifacts_complete: bool,
    loader_available: bool,
) -> str:
    if not enabled:
        return f"{kind} rules/scoring engine active; trained model disabled and fallback kept as rescue."
    if not required_artifacts[0]["exists"]:
        return f"{kind} rules/scoring engine active; no trained model artifact found at configured path."
    if not required_artifacts[0]["nonEmpty"]:
        return f"{kind} rules/scoring engine active; configured trained artifact is empty."
    if not artifacts_complete:
        return f"{kind} rules/scoring engine active; trained model bundle is incomplete."
    if not loader_available:
        return (
            f"{kind} rules/scoring engine active; "
            "trained artifacts exist but no compatible loader is integrated yet."
        )
    return f"{kind} trained model is ready."
