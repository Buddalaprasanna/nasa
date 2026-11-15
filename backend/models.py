# backend/models.py - Pydantic data models for FIELD SHIFT API

from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from enum import Enum

class SoilType(str, Enum):
    BLACK = "black"
    RED = "red"
    SANDY = "sandy"
    CLAY_MIXED = "other"
    DONT_KNOW = "dont_know"

class WaterSource(str, Enum):
    RAINWATER = "rainwater"
    BOREWELL = "borewell"
    CANAL = "canal"
    DRIP = "drip"
    POND = "pond"

class FarmerSetupRequest(BaseModel):
    name: Optional[str] = Field(None, example="Ramesh Gowda")
    latitude: float = Field(..., example=12.52)
    longitude: float = Field(..., example=76.89)
    village_name: str = Field(..., example="Mandya, Karnataka")
    land_size_category: str = Field(..., example="1_to_2_acres")
    soil_type: SoilType
    water_source: WaterSource
    previous_crop: str = Field(..., example="paddy")
    primary_goal: str = Field(..., example="improve_soil_health")
    language: str = Field(default="kn", example="kn")

class MultiLingualText(BaseModel):
    en: str
    kn: Optional[str] = None
    te: Optional[str] = None
    ta: Optional[str] = None
    hi: Optional[str] = None

class CropRecommendation(BaseModel):
    crop_id: str
    name: MultiLingualText
    scientific_name: str
    suitability_category: str  # e.g., 'Highly Suitable', 'Moderately Suitable'
    water_requirement_level: str  # 'Low', 'Medium', 'High'
    estimated_duration_days: str
    sowing_window: MultiLingualText
    reasons: List[str]
    climate_risks: MultiLingualText
    data_basis: str = Field(
        default="Sample agronomic rule-base cross-referenced with regional soil & seasonal moisture patterns. Not an automated guarantee."
    )

class SeasonStep(BaseModel):
    season_number: int
    season_name: MultiLingualText
    crop_name: str
    timing: str
    water_impact: str
    soil_health_benefit: MultiLingualText

class RotationPlan(BaseModel):
    plan_id: str
    title: MultiLingualText
    tagline: MultiLingualText
    seasons: List[SeasonStep]
    rationale_benefits: List[str]
    disclaimer: str = Field(
        default="Illustrative rotation plan for demonstration purposes. Consult local KVK before seeding."
    )

class ClimateObservationSummary(BaseModel):
    station_name: str
    latitude: float
    longitude: float
    retrieval_date: str
    power_source_version: str
    gpm_source_version: str
    max_temperature_c: float
    min_temperature_c: float
    mean_temperature_c: float
    solar_radiation_mj: float
    soil_moisture_estimate_volumetric: float
    historical_10yr_monthly_rainfall: Dict[str, float]
    seasonal_anomaly_note: str
    data_nature: str = Field(
        default="Satellite climatology and land assimilation model estimates. NOT live farm rain-gauge recordings."
    )

class ClimateAlert(BaseModel):
    alert_id: str
    severity: str  # 'warning' or 'danger'
    title: MultiLingualText
    explanation: MultiLingualText
    suggested_action: MultiLingualText
    validity_period: str
    source_attribution: str
