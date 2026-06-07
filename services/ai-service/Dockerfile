FROM python:3.12-slim

WORKDIR /app
ARG AI_SERVICE_VISION_MODEL_ID=nateraw/food
ENV AI_SERVICE_VISION_MODEL_ID=${AI_SERVICE_VISION_MODEL_ID}

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY pytest.ini .
COPY scripts ./scripts
RUN python scripts/download_vision_model.py
COPY app ./app

EXPOSE 8001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
