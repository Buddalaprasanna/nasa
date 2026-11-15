"""
test_engines.py - Unit tests for Crop Recommendation, Rotation, and Voice engines.
"""

import unittest
from app.engines import (
    CropRecommendationEngine,
    CropRotationEngine,
    VoiceAssistantEngine,
    CROPS_DATASET
)

class TestCropEngines(unittest.TestCase):

    def setUp(self):
        self.rec_engine = CropRecommendationEngine()
        self.rot_engine = CropRotationEngine()
        self.voice_engine = VoiceAssistantEngine()

    def test_crop_dataset_integrity(self):
        """Verifies crops dataset has required multilingual keys and agronomic fields."""
        self.assertGreaterEqual(len(CROPS_DATASET), 7)
        for crop in CROPS_DATASET:
            self.assertIn("crop_id", crop)
            self.assertIn("name", crop)
            for lang in ["en", "kn", "te", "ta", "hi"]:
                self.assertIn(lang, crop["name"])
            self.assertIn("water_req_level", crop)
            self.assertIn("suitable_soils", crop)
            self.assertIn("duration_days", crop)

    def test_recommendation_rainfed_red_soil(self):
        """Finger Millet (Ragi) and Red Gram should rank top on rainfed red soil."""
        result = self.rec_engine.evaluate_farm_crops(
            soil_type="red",
            irrigation_type="rainwater",
            previous_crop="paddy",
            primary_goal="save_water"
        )
        self.assertIn("top_recommendations", result)
        self.assertGreaterEqual(len(result["top_recommendations"]), 3)
        top_crop_ids = [c["crop_id"] for c in result["top_recommendations"]]
        self.assertIn("ragi", top_crop_ids)
        # Should explain missing data transparency
        self.assertIn("transparency_statement", result)

    def test_recommendation_soil_health_goal(self):
        """Legumes should receive prominent scoring when goal is soil health."""
        result = self.rec_engine.evaluate_farm_crops(
            soil_type="black",
            irrigation_type="borewell",
            previous_crop="maize",
            primary_goal="improve_soil_health"
        )
        top_crops = result["top_recommendations"]
        # At least one legume in top crops
        has_legume = any(c["is_legume"] for c in top_crops)
        self.assertTrue(has_legume)

    def test_crop_rotation_two_plans(self):
        """Rotation engine must return two distinct multi-season plans."""
        plans = self.rot_engine.generate_rotation_plans(
            soil_type="red",
            irrigation_type="rainwater",
            previous_crop="paddy",
            primary_goal="improve_soil_health"
        )
        self.assertEqual(len(plans), 2)
        for plan in plans:
            self.assertIn("plan_code", plan)
            self.assertIn("seasons", plan)
            self.assertEqual(len(plan["seasons"]), 3)
            # Check seasons 1, 2, 3
            season_nums = [s["season_number"] for s in plan["seasons"]]
            self.assertEqual(season_nums, [1, 2, 3])
            # Check water saving summary exists
            self.assertIn("water_saving_summary", plan)
            self.assertIn("soil_health_summary", plan)

    def test_voice_assistant_multilingual(self):
        """Voice assistant should understand query and return spoken + text in requested language."""
        for lang in ["kn", "te", "ta", "hi", "en"]:
            res = self.voice_engine.process_query("which crop is suitable for my farm?", language=lang)
            self.assertIn("spoken_answer", res)
            self.assertIn("text_answer", res)
            self.assertEqual(res["language"], lang)
            self.assertEqual(res["detected_intent"], "crop_recommendation")

if __name__ == "__main__":
    unittest.main()
