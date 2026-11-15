"""
test_nasa_service.py - Tests for NASA Earth Observation Service.
"""

import unittest
from app.services.nasa_service import NASAEarthDataService

class TestNASAService(unittest.TestCase):

    def setUp(self):
        self.service = NASAEarthDataService(timeout_seconds=2.0)

    def test_coordinate_validation(self):
        """Validates geographic latitude and longitude bounds."""
        self.assertTrue(self.service.validate_coordinates(12.52, 76.89))
        self.assertTrue(self.service.validate_coordinates(-25.0, 135.0))
        # Invalid bounds
        self.assertFalse(self.service.validate_coordinates(95.0, 76.89))
        self.assertFalse(self.service.validate_coordinates(12.52, 190.0))

    def test_representative_climatology_fallback(self):
        """Offline baseline provides verified monthly curves for South Indian farming regions."""
        res = self.service._get_representative_agroclimatology(12.52, 76.89)
        self.assertIn("monthly_trends", res)
        self.assertEqual(len(res["monthly_trends"]), 12)
        self.assertIn("JAN", res["monthly_trends"])
        self.assertIn("DEC", res["monthly_trends"])
        self.assertGreater(res["precipitation_annual_or_daily"], 0)
        self.assertIn("data_nature_disclaimer", res)

if __name__ == "__main__":
    unittest.main()
