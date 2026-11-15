
"""
recommendation_engine.py

Rule-based crop suitability engine.

Uses farmer-provided farm characteristics and the curated crop dataset.
Climate observations are not treated as forecasts or as substitutes for
soil tests, irrigation-capacity measurements, or seasonal rainfall analysis.

Suitability labels are relative advisory categories, not probabilities,
yield predictions, or guarantees.
"""

import logging
from typing import Any, Dict, List, Optional

from .crop_dataset import CROPS_DATASET

logger = logging.getLogger("field_shift.recommendation_engine")


class CropRecommendationEngine:
    """
    Ranks crops using transparent agronomic rules.

    Important limitations:
    - No fabricated climate defaults are used.
    - No percentage confidence or yield prediction is generated.
    - Recent weather observations are not treated as seasonal forecasts.
    - Missing farm information is disclosed in the response.
    """

    SUPPORTED_LANGUAGES = ("en", "kn", "te", "ta", "hi", "ml")

    def __init__(self):
        self.crops = CROPS_DATASET

    @staticmethod
    def _normalize(value: Optional[str], default: str) -> str:
        return (value or default).lower().strip()

    @staticmethod
    def _map_soil_category(soil: str) -> str:
        s = (soil or "dont_know").lower().strip()
        if s in ("red", "black", "sandy", "other", "dont_know"):
            return s
        if "red" in s or "laterite" in s or "alfisol" in s:
            return "red"
        if "black" in s or "regur" in s or "vertisol" in s or "cotton" in s:
            return "black"
        if "sand" in s:
            return "sandy"
        if "clay" in s or "loam" in s or "alluvial" in s or "silt" in s:
            return "other"
        return "other"

    @staticmethod
    def _language_values(
        source: Dict[str, Any],
        language: str,
    ) -> Dict[str, Any]:
        """
        Return a copy of multilingual data.

        If a translation is absent, English is used as a clearly defined
        content fallback. This does not claim that a translation exists.
        """
        result = {}
        english = source.get("en")

        for lang in CropRecommendationEngine.SUPPORTED_LANGUAGES:
            if lang in source:
                result[lang] = source[lang]
            elif english is not None:
                result[lang] = english

        return result

    def evaluate_farm_crops(
        self,
        soil_type: str = "dont_know",
        irrigation_type: str = "other",
        previous_crop: str = "none",
        land_size_category: str = "unknown",
        primary_goal: str = "improve_soil_health",
        climate_data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Evaluate and rank crops using available farm information."""

        soil = self._normalize(soil_type, "dont_know")
        irrigation = self._normalize(irrigation_type, "other")
        previous = self._normalize(previous_crop, "none")
        goal = self._normalize(primary_goal, "improve_soil_health")

        scored_crops: List[Dict[str, Any]] = []
        missing_notes: List[str] = []

        # Climate information is retained for transparency only.
        # Recent gridded observations are not used as a seasonal forecast.
        climate_available = bool(climate_data)

        if not climate_available:
            missing_notes.append(
                "Climate information is unavailable; crop ranking uses "
                "farm details and the crop reference dataset only."
            )
        else:
            missing_notes.append(
                "Available climate observations are not a seasonal forecast "
                "and are not used to predict future rainfall or yield."
            )

        if soil in ("dont_know", "unknown", "unspecified"):
            missing_notes.append(
                "Soil type is unknown. A soil test is recommended before "
                "making a final crop decision."
            )

        if irrigation in ("other", "unknown", "unspecified"):
            missing_notes.append(
                "Irrigation capacity is not fully specified. Water "
                "availability should be checked before sowing."
            )

        if previous in ("none", "unknown", "unspecified"):
            missing_notes.append(
                "Previous crop history is missing; crop-rotation benefits "
                "cannot be assessed reliably."
            )

        for crop in self.crops:
            crop_id = crop.get("crop_id", "")
            score = 1.0
            reasons: List[str] = []
            risks: List[str] = []

            # 1. Soil compatibility
            suitable_soils = crop.get("suitable_soils", [])
            mapped_soil = self._map_soil_category(soil)

            if soil in suitable_soils or mapped_soil in suitable_soils:
                if mapped_soil not in ("dont_know", "unknown", "unspecified"):
                    score += 0.35
                    reasons.append(
                        f"Listed as suitable for {soil} soil in the crop dataset."
                    )
            elif mapped_soil not in ("dont_know", "unknown", "unspecified"):
                score -= 0.4
                risks.append(
                    f"The crop dataset lists different optimal soils for this crop."
                )

            # 2. Irrigation compatibility
            water_level = crop.get("water_req_level", "Unknown")

            if irrigation in ("rainwater", "other", "unknown", "unspecified"):
                if water_level == "Low":
                    score += 0.4
                    reasons.append(
                        "Low water requirement is a useful match for "
                        "rainfed conditions."
                    )
                elif water_level == "Medium":
                    score += 0.1
                elif water_level == "High":
                    score -= 0.8
                    risks.append(
                        "High water requirement may be difficult to meet "
                        "without dependable supplemental irrigation."
                    )

            elif irrigation in ("borewell", "canal", "drip"):
                if irrigation in crop.get("suitable_irrigation", []):
                    score += 0.25
                    reasons.append(
                        "The listed irrigation method is compatible with "
                        "this crop in the reference dataset."
                    )
                else:
                    risks.append(
                        "The crop dataset does not list this irrigation "
                        "method as suitable."
                    )

            # 3. Crop rotation
            is_legume = bool(crop.get("is_legume", False))

            cereal_terms = (
                "paddy", "rice", "వరి", "భತ್ತ", "நெல்", "धान", "चावल",
                "maize", "corn", "మొక్కజొన్న", "ಮೆಕ್ಕೆಜೋಳ", "மக்காச்சோளம்", "मक्का",
                "ragi", "millet", "రాగి", "రాగులు", "ರಾಗಿ", "கேழ்வரகு", "रागी", "मड़ुआ",
                "sorghum", "jowar", "జొన్న", "ಜೋಳ", "சோளம்", "ज्वार",
                "wheat", "గోధుమ", "ಗೋಧಿ", "கோதுமை", "गेहूं",
                "cereal",
            )
            pulse_terms = (
                "redgram", "tur", "arhar", "కందులు", "తొగరి", "துவரை", "अरहर", "तुअर",
                "chickpea", "chana", "శనగలు", "ಕಡಲೆ", "கொண்டைக்கடலை", "चना",
                "greengram", "moong", "పెసలు", "ಹೆಸರು", "பாசிப்பயறு", "मूंग",
                "groundnut", "peanut", "వేరుశనగ", "ಕಡಲೆಕಾಯಿ", "நிலக்கடலை", "मूंगफली",
                "blackgram", "urad", "మినుములు", "ಉದ್ದು", "உளுந்து", "उड़द",
                "soybean", "సోయా", "ಸೋಯಾ", "சோயா", "सोयाबीन",
            )

            multilingual_names = [
                str(val).lower() for val in crop.get("name", {}).values()
            ]

            same_crop = (
                crop_id in previous
                or (
                    previous not in ("none", "other", "unknown", "unspecified", "")
                    and any(previous in name_str or name_str in previous for name_str in multilingual_names)
                )
            )

            if same_crop:
                score -= 0.5
                risks.append(
                    "Growing the same crop repeatedly may increase "
                    "crop-specific pest and disease pressure."
                )

            if previous != "none":
                if any(term in previous for term in cereal_terms) and is_legume:
                    score += 0.45
                    reasons.append(
                        "A legume can provide a useful rotation break "
                        "after a cereal crop."
                    )
                elif (
                    any(term in previous for term in pulse_terms)
                    and not is_legume
                ):
                    score += 0.2
                    reasons.append(
                        "A non-legume can diversify the rotation after "
                        "a pulse crop."
                    )

            # 4. Farmer's stated priority
            if goal == "save_water" and water_level == "Low":
                score += 0.35
                reasons.append(
                    "Low water requirement aligns with the water-saving goal."
                )

            elif goal == "improve_soil_health" and is_legume:
                score += 0.4
                reasons.append(
                    "Legumes can contribute to biological nitrogen fixation "
                    "when appropriate varieties and growing conditions are used."
                )

            elif (
                goal == "short_duration"
                and any(
                    duration in crop.get("duration_days", "")
                    for duration in ("65", "90")
                )
            ):
                score += 0.3
                reasons.append(
                    "The listed crop duration may suit a short-duration goal."
                )

            elif (
                goal == "reduce_climate_risks"
                and crop_id in ("ragi", "sorghum", "redgram")
            ):
                score += 0.25
                reasons.append(
                    "This crop is included among the reference dataset's "
                    "options for climate-risk-conscious selection."
                )

            # No temperature or rainfall scoring is performed here.
            # Recent observations are not sufficient to determine sowing-
            # season suitability or forecast future growing conditions.

            if score >= 1.6:
                suitability = "Highly Suitable"
            elif score >= 1.1:
                suitability = "Moderately Suitable"
            else:
                suitability = "Conditionally Suitable"

            scored_crops.append(
                {
                    "crop": crop,
                    "score": round(score, 2),
                    "suitability_category": suitability,
                    "dynamic_reasons": reasons,
                    "dynamic_risks": risks,
                }
            )

        scored_crops.sort(
            key=lambda item: (
                item["score"],
                item["crop"].get("crop_id", ""),
            ),
            reverse=True,
        )

        top_items = []

        for item in scored_crops[:4]:
            crop = item["crop"]

            base_reasons = crop.get("reasons", {})
            merged_reasons = {}

            for language in self.SUPPORTED_LANGUAGES:
                language_reasons = base_reasons.get(
                    language,
                    base_reasons.get("en", []),
                )

                language_reasons = list(language_reasons)

                # Dynamic rule explanations are currently authored in English.
                # Do not present them as translated text.
                if item["dynamic_reasons"] and language == "en":
                    language_reasons = (
                        item["dynamic_reasons"] + language_reasons
                    )

                merged_reasons[language] = language_reasons

            top_items.append(
                {
                    "crop_id": crop["crop_id"],
                    "name": self._language_values(
                        crop.get("name", {}),
                        "en",
                    ),
                    "scientific_name": crop.get("scientific_name", ""),
                    "category": crop.get("category", ""),
                    "suitability_category": item["suitability_category"],
                    "water_req_level": crop.get("water_req_level", "Unknown"),
                    "duration_days": crop.get("duration_days", "Not specified"),
                    "sowing_season": self._language_values(
                        crop.get("sowing_season", {}),
                        "en",
                    ),
                    "reasons": merged_reasons,
                    "climate_risks": self._language_values(
                        crop.get("climate_risks", {}),
                        "en",
                    ),
                    "soil_health_benefits": self._language_values(
                        crop.get("soil_health_benefits", {}),
                        "en",
                    ),
                    "is_legume": is_legume,
                }
            )

        missing_explanation = " ".join(missing_notes)

        return {
            "top_recommendations": top_items,
            "soil_type_evaluated": soil,
            "irrigation_evaluated": irrigation,
            "goal_evaluated": goal,
            "missing_data_notes": missing_explanation,
            "transparency_statement": (
                "These crop suggestions are advisory rankings based on "
                "the farm details supplied and the project's crop reference "
                "dataset. They are not probabilities, yield predictions, "
                "or guarantees. Recent climate observations, when available, "
                "are not seasonal forecasts. Confirm local sowing windows, "
                "soil condition, water availability, and crop suitability "
                "with an agricultural extension officer before planting."
            ),
        }
