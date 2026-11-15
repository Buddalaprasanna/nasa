"""
test_api.py - Integration tests for FastAPI endpoints.
"""

import unittest
from fastapi.testclient import TestClient
from app.main import app, seed_database

class TestAPIEndpoints(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        seed_database()
        cls.client = TestClient(app)

    def test_health_endpoint(self):
        """GET /api/health returns 200 and healthy status."""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertIn("NASA POWER", data["nasa_integration"])

    def test_crops_list(self):
        """GET /api/crops returns master dataset."""
        response = self.client.get("/api/crops")
        self.assertEqual(response.status_code, 200)
        crops = response.json()
        self.assertIsInstance(crops, list)
        self.assertGreaterEqual(len(crops), 7)

    def test_crops_detail(self):
        """GET /api/crops/ragi returns ragi crop detail."""
        response = self.client.get("/api/crops/ragi")
        self.assertEqual(response.status_code, 200)
        crop = response.json()
        self.assertEqual(crop["crop_id"], "ragi")
        self.assertIn("Eleusine coracana", crop["scientific_name"])

    def test_farmer_creation(self):
        """POST /api/farmers creates a farmer record."""
        payload = {
            "name": "Kavitha Devi",
            "phone": "9123456789",
            "preferred_language": "te"
        }
        response = self.client.post("/api/farmers", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["name"], "Kavitha Devi")
        self.assertEqual(data["preferred_language"], "te")

    def test_recommendations_endpoint(self):
        """POST /api/recommendations runs recommendation engine."""
        payload = {
            "soil_type": "red",
            "irrigation_type": "rainwater",
            "previous_crop": "paddy",
            "primary_goal": "save_water"
        }
        response = self.client.post("/api/recommendations", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("top_recommendations", data)
        self.assertGreaterEqual(len(data["top_recommendations"]), 3)

    def test_rotation_generate(self):
        """POST /api/rotation/generate generates multi-season plans."""
        payload = {
            "soil_type": "red",
            "irrigation_type": "rainwater",
            "previous_crop": "paddy",
            "primary_goal": "improve_soil_health"
        }
        response = self.client.post("/api/rotation/generate", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("available_plans", data)
        self.assertEqual(len(data["available_plans"]), 2)

    def test_voice_query_endpoint(self):
        """POST /api/voice/query returns spoken and text answer."""
        payload = {
            "question": "Which crop is suitable for my farm?",
            "language": "kn"
        }
        response = self.client.post("/api/voice/query", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("spoken_answer", data)
        self.assertIn("text_answer", data)
        self.assertEqual(data["language"], "kn")

if __name__ == "__main__":
    unittest.main()
