import os
from pathlib import Path

from transformers import AutoImageProcessor, AutoModelForImageClassification


MODEL_ID = os.getenv("VISION_MODEL_NAME") or os.getenv("AI_SERVICE_VISION_MODEL_NAME") or os.getenv("AI_SERVICE_VISION_MODEL_ID", "nateraw/food")
MODEL_PATH = Path("app/models/meal_image_analyzer")

MODEL_PATH.mkdir(parents=True, exist_ok=True)
AutoImageProcessor.from_pretrained(MODEL_ID).save_pretrained(MODEL_PATH)
AutoModelForImageClassification.from_pretrained(MODEL_ID).save_pretrained(MODEL_PATH)
