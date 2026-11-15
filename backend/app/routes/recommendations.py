
import json
import logging
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.all_models import (
    Farm,
    FarmerPreference,
    CropRecommendation,
)
from ..schemas.all_schemas import (
    RecommendationRequest,
    RecommendationResponse,
)
from ..engines.recommendation_engine import CropRecommendationEngine


logger = logging.getLogger("field_shift.routes.recommendations")

router = APIRouter(
    prefix="/api/recommendations",
    tags=["Crop Recommendations"],
)

recommendation_engine = CropRecommendationEngine()


def _get_farm_recommendation_inputs(
    db: Session,
    farm_id: int,
) -> Dict[str, Any]:
    farm = db.query(Farm).filter(Farm.id == farm_id).first()

    if farm is None:
        raise HTTPException(
            status_code=404,
            detail="Farm not found. Please select a registered farm.",
        )

    preference = (
        db.query(FarmerPreference)
        .filter(FarmerPreference.farm_id == farm_id)
        .order_by(FarmerPreference.created_at.desc())
        .first()
    )

    return {
        "farm": farm,
        "preference": preference,
    }


@router.post("", response_model=RecommendationResponse)
def generate_recommendations(
    request: RecommendationRequest,
    db: Session = Depends(get_db),
):
    farm: Optional[Farm] = None
    preference: Optional[FarmerPreference] = None

    if request.farm_id is not None:
        farm_data = _get_farm_recommendation_inputs(
            db,
            request.farm_id,
        )
        farm = farm_data["farm"]
        preference = farm_data["preference"]

    soil_type = (
        request.soil_type
        or (farm.soil_type if farm else None)
        or "dont_know"
    )

    irrigation_type = (
        request.irrigation_type
        or (farm.irrigation_type if farm else None)
        or "unknown"
    )

    previous_crop = (
        request.previous_crop
        or (preference.previous_crop if preference else None)
        or "none"
    )

    land_size_category = (
        request.land_size_category
        or (farm.land_size_category if farm else None)
        or "unknown"
    )

    primary_goal = (
        request.primary_goal
        or (preference.primary_goal if preference else None)
        or "improve_soil_health"
    )

    try:
        result = recommendation_engine.evaluate_farm_crops(
            soil_type=soil_type,
            irrigation_type=irrigation_type,
            previous_crop=previous_crop,
            land_size_category=land_size_category,
            primary_goal=primary_goal,
            climate_data=None,
        )

        recommendations = result.get("top_recommendations", [])

        if not recommendations:
            raise HTTPException(
                status_code=503,
                detail="Crop recommendations are currently unavailable.",
            )

        if farm is not None:
            for item in recommendations:
                recommendation_record = CropRecommendation(
                    farm_id=farm.id,
                    crop_id=item["crop_id"],
                    suitability_category=item["suitability_category"],
                    ranking_score=None,
                    reasons_json=json.dumps(
                        item.get("reasons", {}),
                        ensure_ascii=False,
                    ),
                    climate_risks_json=json.dumps(
                        item.get("climate_risks", {}),
                        ensure_ascii=False,
                    ),
                )
                db.add(recommendation_record)

            db.commit()

        return RecommendationResponse(
            farm_id=farm.id if farm else None,
            village=farm.village_name if farm else None,
            soil_type_evaluated=result["soil_type_evaluated"],
            irrigation_evaluated=result["irrigation_evaluated"],
            goal_evaluated=result["goal_evaluated"],
            top_recommendations=recommendations,
            missing_data_notes=result.get("missing_data_notes"),
            transparency_statement=result["transparency_statement"],
        )

    except HTTPException:
        db.rollback()
        raise

    except Exception as exc:
        db.rollback()
        logger.exception("Crop recommendation generation failed")
        raise HTTPException(
            status_code=500,
            detail="Unable to generate crop recommendations at this time.",
        ) from exc
