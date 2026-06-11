"""
Module 1 — Analyse de photo de repas
Modèle nateraw/food fine-tuné sur Food Types v3 (Roboflow, 15 classes, 6111 images)
Accuracy : 95.39%
"""

import os

# Chemin vers le modèle fine-tuné
MODEL_PATH = os.path.join(os.path.dirname(__file__), "../../data/models/meal_image_analyzer")


def analyze_meal_image(image_path: str, top_k: int = 3) -> dict:
    """
    Analyse une photo de repas et retourne les aliments détectés.

    Args:
        image_path: chemin vers l'image
        top_k: nombre de résultats à retourner

    Returns:
        dict avec detected_foods (label + confidence)
    """
    try:
        from transformers import AutoImageProcessor, AutoModelForImageClassification
        from PIL import Image
        import torch

        image_processor = AutoImageProcessor.from_pretrained(MODEL_PATH)
        model = AutoModelForImageClassification.from_pretrained(MODEL_PATH)
        model.eval()

        image = Image.open(image_path).convert("RGB")
        inputs = image_processor(images=image, return_tensors="pt")

        with torch.no_grad():
            outputs = model(**inputs)

        probs = torch.nn.functional.softmax(outputs.logits, dim=-1)[0]
        top_probs, top_indices = torch.topk(probs, k=top_k)

        detected_foods = [
            {
                "label": model.config.id2label[idx.item()],
                "confidence": round(prob.item(), 4)
            }
            for prob, idx in zip(top_probs, top_indices)
        ]

        return {"detected_foods": detected_foods}

    except Exception as e:
        return {
            "detected_foods": [],
            "error": str(e),
            "fallback": "Analyse indisponible"
        }
