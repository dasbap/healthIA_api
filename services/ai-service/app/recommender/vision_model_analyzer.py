from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen


MODEL_PATH = Path(__file__).resolve().parents[1] / "models" / "meal_image_analyzer"
NUTRITION_ESTIMATES = {
    "pizza": {"calories": 720, "proteins": 28, "carbs": 86, "fats": 28},
    "bruschetta": {"calories": 180, "proteins": 6, "carbs": 24, "fats": 7},
    "garlic_bread": {"calories": 220, "proteins": 6, "carbs": 28, "fats": 10},
    "burger": {"calories": 650, "proteins": 32, "carbs": 48, "fats": 34},
    "fries": {"calories": 365, "proteins": 4, "carbs": 48, "fats": 17},
    "salad": {"calories": 240, "proteins": 8, "carbs": 22, "fats": 12},
    "sushi": {"calories": 360, "proteins": 22, "carbs": 52, "fats": 8},
}


def vision_model_status() -> dict:
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

    return {
        "enabled": MODEL_PATH.exists() and all(dependencies.values()),
        "modelPath": str(MODEL_PATH),
        "modelAvailable": MODEL_PATH.exists(),
        "dependencies": dependencies,
    }


def analyze_with_vision_model(image_url: str, top_k: int = 3) -> list[dict] | None:
    if not MODEL_PATH.exists():
        return None

    try:
        from PIL import Image
        import torch
        from transformers import AutoImageProcessor, AutoModelForImageClassification

        image_processor = AutoImageProcessor.from_pretrained(str(MODEL_PATH))
        model = AutoModelForImageClassification.from_pretrained(str(MODEL_PATH))
        model.eval()

        request = Request(image_url, headers={"User-Agent": "HealthIA-AI-Service/0.1"})
        with urlopen(request, timeout=5) as response:
            image = Image.open(BytesIO(response.read())).convert("RGB")

        inputs = image_processor(images=image, return_tensors="pt")
        with torch.no_grad():
            outputs = model(**inputs)

        probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)[0]
        top_probabilities, top_indices = torch.topk(probabilities, k=top_k)

        foods = []
        for rank, (probability, index) in enumerate(zip(top_probabilities, top_indices)):
            label = model.config.id2label[index.item()]
            confidence = round(probability.item(), 4)
            nutrition = NUTRITION_ESTIMATES.get(label.lower(), {})
            use_nutrition = rank == 0 or confidence >= 0.05
            foods.append(
                {
                    "name": label,
                    "confidence": confidence,
                    "calories": nutrition.get("calories", 0) if use_nutrition else 0,
                    "proteins": nutrition.get("proteins", 0) if use_nutrition else 0,
                    "carbs": nutrition.get("carbs", 0) if use_nutrition else 0,
                    "fats": nutrition.get("fats", 0) if use_nutrition else 0,
                }
            )
        return foods
    except Exception:
        return None
