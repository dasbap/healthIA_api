from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional, List
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://root:example@mongodb:27017")
DB_NAME = os.getenv("MONGO_DB", "healthia")

app = FastAPI(title="HealthIA - Microservice IA")

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

class MealAnalyzeRequest(BaseModel):
    user_id: str
    imageUrl: Optional[str] = None
    timestamp: Optional[str] = None

class RecommendationRequest(BaseModel):
    user_id: str
    goals: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
    restrictions: Optional[List[str]] = None

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/ai/meal/analyze")
async def analyze_meal(payload: MealAnalyzeRequest):
    # Simule l'analyse IA (le membre 1 doit brancher le vrai modèle)
    result = {
        "user_id": payload.user_id,
        "imageUrl": payload.imageUrl,
        "analysis": {"calories": 500, "food_items": ["rice", "chicken"]}
    }
    # Stocker dans MongoDB
    doc = {**result}
    res = await db.meal_analyses.insert_one(doc)
    return {"id": str(res.inserted_id), "result": result}

@app.post("/ai/nutrition/recommend")
async def recommend_nutrition(payload: RecommendationRequest):
    # Simule la recommandation
    rec = {"user_id": payload.user_id, "type": "nutrition", "recommendations": ["eat more veggies"]}
    res = await db.recommendations.insert_one(rec)
    return {"id": str(res.inserted_id), "recommendations": rec}

@app.post("/ai/sport/recommend")
async def recommend_sport(payload: RecommendationRequest):
    rec = {"user_id": payload.user_id, "type": "sport", "recommendations": ["30 min jogging"]}
    res = await db.recommendations.insert_one(rec)
    return {"id": str(res.inserted_id), "recommendations": rec}

@app.get("/ai/recommendations/{user_id}")
async def get_recommendations(user_id: str):
    docs = db.recommendations.find({"user_id": user_id})
    items = []
    async for d in docs:
        d["id"] = str(d.pop("_id"))
        items.append(d)
    return {"recommendations": items}

class Feedback(BaseModel):
    user_id: str
    recommendation_id: Optional[str]
    rating: Optional[int]
    comment: Optional[str]

@app.post("/ai/feedback")
async def post_feedback(fb: Feedback):
    doc = fb.dict()
    res = await db.feedbacks.insert_one(doc)
    return {"id": str(res.inserted_id)}
