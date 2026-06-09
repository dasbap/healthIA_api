FROM python:3.12-slim

WORKDIR /app
ARG AI_SERVICE_VISION_MODEL_ID=nateraw/food
ARG AI_SERVICE_INSTALL_VISION=false
ENV AI_SERVICE_VISION_MODEL_ID=${AI_SERVICE_VISION_MODEL_ID}

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY requirements-vision.txt .
RUN if [ "$AI_SERVICE_INSTALL_VISION" = "true" ]; then pip install --no-cache-dir -r requirements-vision.txt; fi

COPY pytest.ini .
COPY scripts ./scripts
RUN if [ "$AI_SERVICE_INSTALL_VISION" = "true" ]; then python scripts/download_vision_model.py; fi
COPY app ./app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
