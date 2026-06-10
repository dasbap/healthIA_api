from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen

from app.core.config import settings

MODEL_PATH = (
    Path(settings.vision_model_path)
    if settings.vision_model_path
    else Path(__file__).resolve().parents[1] / "models" / "meal_image_analyzer"
)
_MODEL_BUNDLE: tuple[object, object, object, object, str, str] | None = None
_MODEL_LOAD_ERROR: str | None = None

DEFAULT_NUTRITION = {
    "calories": 520,
    "proteins": 24,
    "carbs": 62,
    "fats": 18,
    "warnings": ["Estimation prudente : aliment reconnu sans mapping nutritionnel precis."],
}
NUTRITION_RULES = [
    (
        ("spaghetti", "pasta", "macaroni", "lasagna", "ravioli", "noodle"),
        {
            "calories": 520,
            "proteins": 18,
            "carbs": 80,
            "fats": 14,
            "warnings": ["Glucides eleves"],
        },
    ),
    (
        ("salad", "salade", "caesar_salad", "greek_salad"),
        {
            "calories": 280,
            "proteins": 8,
            "carbs": 18,
            "fats": 14,
            "warnings": [],
        },
    ),
    (
        ("chicken", "poulet", "grilled_chicken", "chicken_wings"),
        {
            "calories": 430,
            "proteins": 45,
            "carbs": 20,
            "fats": 15,
            "warnings": [],
        },
    ),
    (
        ("pizza",),
        {
            "calories": 700,
            "proteins": 28,
            "carbs": 85,
            "fats": 28,
            "warnings": ["Glucides eleves", "Lipides eleves"],
        },
    ),
    (
        ("burger", "hamburger", "cheeseburger"),
        {
            "calories": 650,
            "proteins": 32,
            "carbs": 48,
            "fats": 34,
            "warnings": ["Lipides eleves"],
        },
    ),
    (
        ("fries", "french_fries"),
        {
            "calories": 365,
            "proteins": 4,
            "carbs": 48,
            "fats": 17,
            "warnings": ["Proteines a renforcer"],
        },
    ),
    (
        ("sushi",),
        {
            "calories": 360,
            "proteins": 22,
            "carbs": 52,
            "fats": 8,
            "warnings": [],
        },
    ),
]


def vision_model_status() -> dict:
    dependencies = _vision_dependency_status()
    configured = bool(settings.vision_model_name or MODEL_PATH.exists())
    model_available = bool(
        settings.vision_enabled
        and configured
        and all(dependencies.values())
        and (_MODEL_LOAD_ERROR is None)
        and (MODEL_PATH.exists() or bool(settings.vision_model_name) or _MODEL_BUNDLE is not None)
    )

    return {
        "enabled": bool(settings.vision_enabled and model_available),
        "modelPath": str(MODEL_PATH),
        "modelAvailable": model_available,
        "modelLoaded": _MODEL_BUNDLE is not None,
        "modelName": active_vision_model_name(),
        "device": settings.vision_device,
        "uploadSupported": True,
        "urlSupported": True,
        "fallbackAvailable": True,
        "pillow": dependencies["pillow"],
        "torch": dependencies["torch"],
        "transformers": dependencies["transformers"],
        "dependencies": dependencies,
        "loadError": _MODEL_LOAD_ERROR,
    }


def analyze_with_vision_model(image_url: str, top_k: int = 3) -> list[dict] | None:
    if not settings.vision_enabled:
        return None

    try:
        bundle = _load_model_bundle()
        if bundle is None:
            return None
        _, _, image_module, _, _, _ = bundle

        request = Request(image_url, headers={"User-Agent": "HealthIA-AI-Service/0.1"})
        with urlopen(request, timeout=5) as response:
            image = image_module.open(BytesIO(response.read())).convert("RGB")

        return _classify_image(image, bundle, top_k)
    except Exception:
        return None


def analyze_image_bytes_with_vision_model(image_bytes: bytes, top_k: int = 3) -> list[dict] | None:
    if not settings.vision_enabled:
        return None

    try:
        bundle = _load_model_bundle()
        if bundle is None:
            return None
        _, _, image_module, _, _, _ = bundle
        image = image_module.open(BytesIO(image_bytes)).convert("RGB")
        return _classify_image(image, bundle, top_k)
    except Exception:
        return None


def active_vision_model_name() -> str:
    if _MODEL_BUNDLE is not None:
        return _MODEL_BUNDLE[4]
    return settings.vision_model_name or MODEL_PATH.name


def _classify_image(image: object, bundle: tuple[object, object, object, object, str, str], top_k: int) -> list[dict]:
    image_processor, model, _, torch_module, _, device = bundle
    inputs = image_processor(images=image, return_tensors="pt")
    inputs = {key: value.to(device) if hasattr(value, "to") else value for key, value in inputs.items()}
    with torch_module.no_grad():
        outputs = model(**inputs)

    probabilities = torch_module.nn.functional.softmax(outputs.logits, dim=-1)[0]
    top_probabilities, top_indices = torch_module.topk(probabilities, k=top_k)

    foods = []
    for rank, (probability, index) in enumerate(zip(top_probabilities, top_indices)):
        label = model.config.id2label[index.item()]
        confidence = round(probability.item(), 4)
        nutrition = _nutrition_for_label(label)
        use_nutrition = rank == 0
        foods.append(
            {
                "name": label,
                "confidence": confidence,
                "calories": nutrition.get("calories", 0) if use_nutrition else 0,
                "proteins": nutrition.get("proteins", 0) if use_nutrition else 0,
                "carbs": nutrition.get("carbs", 0) if use_nutrition else 0,
                "fats": nutrition.get("fats", 0) if use_nutrition else 0,
                "warnings": nutrition.get("warnings", []) if use_nutrition else [],
            }
        )
    return foods


def _load_model_bundle() -> tuple[object, object, object, object, str, str] | None:
    global _MODEL_BUNDLE, _MODEL_LOAD_ERROR
    if not settings.vision_enabled:
        return None

    if _MODEL_BUNDLE is None:
        try:
            from PIL import Image
            import torch
            from transformers import AutoImageProcessor, AutoModelForImageClassification

            model_source = str(MODEL_PATH) if MODEL_PATH.exists() else settings.vision_model_name
            image_processor = AutoImageProcessor.from_pretrained(model_source)
            model = AutoModelForImageClassification.from_pretrained(model_source)
            device = _resolve_device(torch, settings.vision_device)
            model.to(device)
            model.eval()
            _MODEL_BUNDLE = (image_processor, model, Image, torch, settings.vision_model_name, device)
            _MODEL_LOAD_ERROR = None
        except Exception as exc:
            _MODEL_LOAD_ERROR = str(exc)
            return None
    return _MODEL_BUNDLE


def _resolve_device(torch_module: object, configured_device: str) -> str:
    device = (configured_device or "cpu").lower()
    if device == "cuda" and hasattr(torch_module, "cuda") and not torch_module.cuda.is_available():
        return "cpu"
    return device


def _nutrition_for_label(label: str) -> dict:
    normalized = label.lower().replace("_", " ").replace("-", " ")
    for aliases, nutrition in NUTRITION_RULES:
        if any(alias.replace("_", " ") in normalized for alias in aliases):
            return nutrition
    return DEFAULT_NUTRITION


def _vision_dependency_status() -> dict:
    dependencies = {"pillow": False, "torch": False, "transformers": False}
    try:
        import PIL  # noqa: F401

        dependencies["pillow"] = True
    except Exception:
        pass

    try:
        import torch  # noqa: F401

        dependencies["torch"] = True
    except Exception:
        pass

    try:
        import transformers  # noqa: F401

        dependencies["transformers"] = True
    except Exception:
        pass
    return dependencies
