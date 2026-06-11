from io import BytesIO

from fastapi import APIRouter, HTTPException, Request, status
from PIL import Image, UnidentifiedImageError
from pydantic import ValidationError

from app.schemas.meal_analysis_schema import MealAnalysisRequest, MealAnalysisResponse
from app.services.meal_analysis_service import MealAnalysisService

router = APIRouter(prefix="/ai/meal", tags=["Analyse repas"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024


@router.post(
    "/analyze",
    response_model=MealAnalysisResponse,
    openapi_extra={
        "requestBody": {
            "content": {
                "application/json": {
                    "example": {
                        "userId": "demo-user",
                        "imageUrl": "https://example.com/meal.jpg",
                    }
                },
                "multipart/form-data": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "userId": {"type": "string"},
                            "file": {"type": "string", "format": "binary"},
                        },
                    }
                },
            }
        }
    },
)
async def analyze_meal(request: Request) -> dict:
    content_type = request.headers.get("content-type", "")
    if "multipart/form-data" in content_type:
        form = await request.form()
        uploaded_file = form.get("file")
        if uploaded_file is None or not getattr(uploaded_file, "filename", ""):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Aucun fichier image n'a ete fourni.")
        if (getattr(uploaded_file, "content_type", "") or "").lower() not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Le fichier fourni doit etre une image au format JPEG, PNG ou WebP.",
            )

        image_bytes = await uploaded_file.read()
        if not image_bytes:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Le fichier image est vide.")
        if len(image_bytes) > MAX_IMAGE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Le fichier image depasse 8 Mo.",
            )

        try:
            with Image.open(BytesIO(image_bytes)) as image:
                image.verify()
        except (SyntaxError, UnidentifiedImageError, OSError) as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Le fichier fourni doit etre une image au format JPEG, PNG ou WebP.",
            ) from exc

        return await MealAnalysisService().analyze_upload(
            user_id=str(form.get("userId") or form.get("user_id") or "profile_demo_001"),
            file_name=uploaded_file.filename,
            image_bytes=image_bytes,
            notes=str(form.get("notes") or form.get("mealType") or "") or None,
        )

    try:
        body = await request.json()
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payload JSON invalide.") from exc

    try:
        payload = MealAnalysisRequest.model_validate(body)
    except ValidationError as exc:
        detail = [{"loc": error["loc"], "msg": error["msg"], "type": error["type"]} for error in exc.errors()]
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail) from exc
    return await MealAnalysisService().analyze(payload)
