import pytest
from fastapi.testclient import TestClient
from fastapi import status

from main import app

class FakeResult:
    def __init__(self, id):
        self.inserted_id = id

class FakeCollection:
    def __init__(self):
        self._storage = []
    async def insert_one(self, doc):
        self._storage.append(doc)
        return FakeResult("fakeid")
    def find(self, filter):
        async def gen():
            for d in self._storage:
                if all(d.get(k) == v for k,v in filter.items()):
                    yield d
        return gen()

class FakeDB:
    def __init__(self):
        self.meal_analyses = FakeCollection()
        self.recommendations = FakeCollection()
        self.feedbacks = FakeCollection()

@pytest.fixture(autouse=True)
def fake_db(monkeypatch):
    from main import db as real_db
    fake = FakeDB()
    monkeypatch.setattr('main.db', fake)
    return fake

client = TestClient(app)

def test_health():
    r = client.get('/health')
    assert r.status_code == status.HTTP_200_OK
    assert r.json() == {"status": "ok"}

def test_analyze_meal():
    payload = {"user_id": "u1", "imageUrl": "http://img"}
    r = client.post('/ai/meal/analyze', json=payload)
    assert r.status_code == status.HTTP_200_OK
    data = r.json()
    assert 'id' in data
    assert data['result']['user_id'] == 'u1'

def test_recommend_nutrition():
    payload = {"user_id": "u1", "goals": ["lose_weight"]}
    r = client.post('/ai/nutrition/recommend', json=payload)
    assert r.status_code == status.HTTP_200_OK
    data = r.json()
    assert 'id' in data
    assert data['recommendations']['type'] == 'nutrition'

def test_recommend_sport():
    payload = {"user_id": "u1", "goals": ["fitness"]}
    r = client.post('/ai/sport/recommend', json=payload)
    assert r.status_code == status.HTTP_200_OK
    data = r.json()
    assert 'id' in data
    assert data['recommendations']['type'] == 'sport'

def test_feedback():
    payload = {"user_id": "u1", "rating": 4, "comment": "good"}
    r = client.post('/ai/feedback', json=payload)
    assert r.status_code == status.HTTP_200_OK
    data = r.json()
    assert 'id' in data

def test_get_recommendations_empty():
    r = client.get('/ai/recommendations/u1')
    assert r.status_code == status.HTTP_200_OK
    assert 'recommendations' in r.json()
