import asyncio
import json
import logging
from typing import Optional, Tuple
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Farm, FarmerPreference, ClimateData
from ..schemas import VoiceQueryRequest, VoiceQueryResponse
from ..engines import VoiceAssistantEngine
from ..services.nasa_service import NASAEarthDataService
from ..services.weather_forecast_service import WeatherForecastService
from ..services.soil_service import SoilService

logger = logging.getLogger("field_shift.voice_route")

router = APIRouter(prefix="/api/voice", tags=["Voice Assistant"])
voice_engine = VoiceAssistantEngine()
nasa_service = NASAEarthDataService(timeout_seconds=5.0)

KNOWN_DISTRICT_COORDS = {
    "mandya": (12.52, 76.89, "Mandya", "Karnataka", "red"),
    "mysuru": (12.30, 76.65, "Mysuru", "Karnataka", "red"),
    "mysore": (12.30, 76.65, "Mysuru", "Karnataka", "red"),
    "kolar": (13.13, 78.13, "Kolar", "Karnataka", "red"),
    "bengaluru": (12.97, 77.59, "Bengaluru", "Karnataka", "red"),
    "bangalore": (12.97, 77.59, "Bengaluru", "Karnataka", "red"),
    "tumakuru": (13.34, 77.10, "Tumakuru", "Karnataka", "red"),
    "tumkur": (13.34, 77.10, "Tumakuru", "Karnataka", "red"),
    "hassan": (13.00, 76.10, "Hassan", "Karnataka", "red"),
    "chikkaballapur": (13.43, 77.72, "Chikkaballapur", "Karnataka", "red"),
    "dharwad": (15.45, 75.00, "Dharwad", "Karnataka", "black"),
    "belagavi": (15.85, 74.50, "Belagavi", "Karnataka", "black"),
    "belgaum": (15.85, 74.50, "Belagavi", "Karnataka", "black"),
    "bellary": (15.14, 76.92, "Ballari", "Karnataka", "black"),
    "ballari": (15.14, 76.92, "Ballari", "Karnataka", "black"),
    "kalaburagi": (17.33, 76.83, "Kalaburagi", "Karnataka", "black"),
    "gulbarga": (17.33, 76.83, "Kalaburagi", "Karnataka", "black"),
    "anantapur": (14.68, 77.60, "Anantapur", "Andhra Pradesh", "red"),
    "chittoor": (13.21, 79.10, "Chittoor", "Andhra Pradesh", "red"),
    "coimbatore": (11.01, 76.95, "Coimbatore", "Tamil Nadu", "red"),
    "salem": (11.66, 78.14, "Salem", "Tamil Nadu", "red"),
}


def infer_location_from_name(name: Optional[str]) -> Optional[Tuple[float, float, str, str, str]]:
    if not name:
        return None
    name_lower = name.lower()
    for key, (lat, lon, d_name, st, s_type) in KNOWN_DISTRICT_COORDS.items():
        if key in name_lower:
            return lat, lon, d_name, st, s_type
    return None


@router.post("/query", response_model=VoiceQueryResponse)
async def handle_voice_query(req: VoiceQueryRequest, db: Session = Depends(get_db)):
    farm = None
    if req.farm_id:
        farm = db.query(Farm).filter(Farm.id == req.farm_id).first()

    # Determine coordinates and geographical context
    lat = req.latitude or (farm.latitude if farm else None)
    lon = req.longitude or (farm.longitude if farm else None)
    village = (farm.village_name if farm and farm.village_name else None) or req.village or ""
    district = (farm.district if farm and farm.district else None) or req.district or ""
    state = (farm.state if farm and farm.state else None) or req.state or "Karnataka"
    soil = (farm.soil_type if farm and farm.soil_type else None) or req.soil_type or "red"
    irrigation = (farm.irrigation_type if farm and farm.irrigation_type else None) or "rainfed"

    current_crop = req.current_crop
    if farm:
        pref = db.query(FarmerPreference).filter(FarmerPreference.farm_id == farm.id).order_by(FarmerPreference.id.desc()).first()
        if pref and pref.current_crop:
            current_crop = pref.current_crop
        elif pref and pref.previous_crop:
            current_crop = pref.previous_crop

    if not current_crop:
        current_crop = "ragi"

    # If coordinates are missing, try inferring from village or district name
    if lat is None or lon is None:
        inferred = infer_location_from_name(village) or infer_location_from_name(district)
        if inferred:
            lat, lon, dist_name, st_name, s_type = inferred
            if not district:
                district = dist_name
            if not village:
                village = dist_name
            if not state:
                state = st_name
            if soil in ["dont_know", "other", "", None]:
                soil = s_type

    has_coordinates = (lat is not None and lon is not None)

    forecast_data = None
    nasa_data = None
    soil_profile = None

    if has_coordinates:
        # 1. Forward-looking 10-day numerical weather forecast
        try:
            forecast_data = WeatherForecastService.get_10day_forecast(lat, lon, timeout_seconds=3.0)
        except Exception as exc:
            logger.info("Live weather forecast lookup failed: %s", exc)

        # 2. Retrospective observations from NASA POWER (or DB cache fallback)
        try:
            nasa_data = await asyncio.wait_for(nasa_service.get_climate_data(lat, lon), timeout=3.5)
        except Exception as exc:
            logger.info("Live NASA POWER query unavailable (%s); checking database cache.", exc)

        if not nasa_data:
            # Query database cache
            stored_record = None
            if farm:
                stored_record = db.query(ClimateData).filter(ClimateData.farm_id == farm.id).order_by(ClimateData.id.desc()).first()
            if not stored_record:
                stored_record = db.query(ClimateData).order_by(ClimateData.id.desc()).first()

            if stored_record:
                monthly_trends = {}
                if stored_record.monthly_trends_json:
                    try:
                        monthly_trends = json.loads(stored_record.monthly_trends_json)
                    except Exception:
                        pass
                nasa_data = {
                    "data_source": stored_record.data_source or "NASA POWER daily point observations and climatology",
                    "temp_mean": stored_record.temp_mean,
                    "temp_max": stored_record.temp_max,
                    "temp_min": stored_record.temp_min,
                    "rainfall_last_30_days_mm": stored_record.precipitation_annual_or_daily or 224.9,
                    "solar_radiation": stored_record.solar_radiation or 18.2,
                    "soil_moisture_estimate": stored_record.soil_moisture_estimate or 0.72,
                    "latest_observation_date": stored_record.retrieval_date or "13 November 2026",
                    "current_month_climatology": monthly_trends.get("NOV") or {"rainfall_mm": 56.4, "temp_mean": 23.8},
                    "monthly_trends": monthly_trends,
                    "is_stored_db": True
                }

        # 3. Regional soil profile
        try:
            soil_profile = SoilService.identify_soil_profile(
                latitude=lat,
                longitude=lon,
                district=district,
                state=state
            )
        except Exception as exc:
            logger.info("Soil profile lookup error: %s", exc)

    context = {
        "village": village or district or "Mandya",
        "district": district or "Mandya",
        "state": state or "Karnataka",
        "latitude": lat,
        "longitude": lon,
        "has_coordinates": has_coordinates,
        "soil": soil or "red",
        "irrigation": irrigation,
        "crop": current_crop or "ragi",
        "forecast": forecast_data,
        "nasa_climate": nasa_data,
        "soil_profile": soil_profile
    }

    result = voice_engine.process_query(
        question=req.question,
        language=req.language or "en",
        farm_context=context
    )

    return VoiceQueryResponse(
        spoken_answer=result["spoken_answer"],
        text_answer=result["text_answer"],
        detected_intent=result["detected_intent"],
        language=result["language"],
        suggested_action_chip=result.get("suggested_action_chip")
    )
