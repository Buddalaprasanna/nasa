
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class MultiLingualText(BaseModel):
    en: str
    kn: Optional[str] = None
    te: Optional[str] = None
    ta: Optional[str] = None
    hi: Optional[str] = None
    ml: Optional[str] = None


# Farmer Schemas
class FarmerCreate(BaseModel):
    name: Optional[str] = Field(default="Farmer", max_length=100)
    phone: Optional[str] = Field(default=None, max_length=20)
    preferred_language: str = Field(default="kn", max_length=10)


class FarmerResponse(BaseModel):
    id: int
    name: Optional[str]
    phone: Optional[str]
    preferred_language: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Farm Schemas
class FarmCreate(BaseModel):
    farmer_id: Optional[int] = None

    # Farmer details used when creating a farmer and farm together
    farmer_name: Optional[str] = Field(default=None, max_length=100)
    preferred_language: Optional[str] = Field(default=None, max_length=10)

    # Location details must come from the farmer or a verified location lookup
    village_name: Optional[str] = Field(default=None, max_length=100)
    district: Optional[str] = Field(default=None, max_length=100)
    state: Optional[str] = Field(default=None, max_length=100)

    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)

    land_size_category: str = "1_to_2_acres"
    soil_type: str = "red"
    irrigation_type: str = "rainwater"

    primary_goal: Optional[str] = "improve_soil_health"
    previous_crop: Optional[str] = "paddy"
    current_crop: Optional[str] = None


class FarmResponse(BaseModel):
    id: int
    farmer_id: Optional[int]
    village_name: Optional[str]
    district: Optional[str]
    state: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    land_size_category: str
    soil_type: str
    irrigation_type: str
    created_at: datetime

    class Config:
        from_attributes = True


# Climate Schemas
class ClimateFetchRequest(BaseModel):
    farm_id: Optional[int] = None
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)
    force_refresh: bool = False


class ClimateResponse(BaseModel):
    id: Optional[int] = None
    farm_id: Optional[int] = None
    latitude: float
    longitude: float
    retrieval_date: str
    data_source: str
    data_category: str
    temp_mean: float
    temp_max: float
    temp_min: float
    precipitation_annual_or_daily: float
    solar_radiation: float
    soil_moisture_estimate: Optional[float] = None
    monthly_trends: Dict[str, Any]
    seasonal_guidance: Optional[Dict[str, str]] = None
    data_nature_disclaimer: str


# Crop Recommendation Schemas
class CropRecommendationItem(BaseModel):
    crop_id: str
    name: Dict[str, str]
    scientific_name: str
    category: str
    suitability_category: str
    water_req_level: str
    duration_days: str
    sowing_season: Dict[str, str]
    reasons: Dict[str, List[str]]
    climate_risks: Dict[str, str]
    soil_health_benefits: Dict[str, str]
    is_legume: bool


class RecommendationRequest(BaseModel):
    farm_id: Optional[int] = None
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None
    previous_crop: Optional[str] = None
    land_size_category: Optional[str] = None
    primary_goal: Optional[str] = None
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)


class RecommendationResponse(BaseModel):
    farm_id: Optional[int]
    village: Optional[str]
    soil_type_evaluated: str
    irrigation_evaluated: str
    goal_evaluated: str
    top_recommendations: List[CropRecommendationItem]
    missing_data_notes: Optional[str]
    transparency_statement: str


# Rotation Schemas
class SeasonStep(BaseModel):
    season_number: int
    season_name: Dict[str, str]
    crop_id: str
    crop_name: Dict[str, str]
    sowing_window: Dict[str, str]
    harvest_window: Dict[str, str]
    water_impact: Dict[str, str]
    soil_health_benefit: Dict[str, str]
    climate_suitability: Dict[str, str]
    is_legume: bool


class RotationPlanItem(BaseModel):
    plan_code: str
    title: Dict[str, str]
    summary: Dict[str, str]
    seasons: List[SeasonStep]
    water_saving_summary: Dict[str, str]
    soil_health_summary: Dict[str, str]
    trade_offs: Dict[str, str]
    is_saved: bool = False


class RotationGenerateRequest(BaseModel):
    farm_id: Optional[int] = None
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None
    previous_crop: Optional[str] = None
    primary_goal: Optional[str] = None


class RotationGenerateResponse(BaseModel):
    farm_id: Optional[int]
    available_plans: List[RotationPlanItem]
    agronomic_advisory: str


class RotationSaveRequest(BaseModel):
    farm_id: int
    plan_code: str
    plan_title: Dict[str, str]
    plan_summary: Dict[str, str]
    seasons: List[Dict[str, Any]]
    water_saving_summary: Dict[str, str]
    soil_health_summary: Dict[str, str]


# Alert Schemas
class AlertItem(BaseModel):
    id: int
    farm_id: Optional[int]
    severity: str
    alert_type: str
    title: Dict[str, str]
    explanation: Dict[str, str]
    suggested_action: Dict[str, str]
    data_source: str
    date_generated: str
    is_read: bool

    class Config:
        from_attributes = True


# Voice Assistant Schemas
class VoiceQueryRequest(BaseModel):
    question: str
    language: str = "kn"
    farm_id: Optional[int] = None
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    soil_type: Optional[str] = None
    current_crop: Optional[str] = None


class VoiceQueryResponse(BaseModel):
    spoken_answer: str
    text_answer: str
    detected_intent: str
    language: str
    suggested_action_chip: Optional[str] = None
