
import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship

from ..database import Base


def utc_now():
    return datetime.datetime.now(datetime.timezone.utc)


class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    preferred_language = Column(String(10), default="en", nullable=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    farms = relationship(
        "Farm",
        back_populates="farmer",
        cascade="all, delete-orphan",
    )


class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=True)

    village_name = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    land_size_category = Column(String(50), nullable=True)
    soil_type = Column(String(50), nullable=True)
    irrigation_type = Column(String(50), nullable=True)

    created_at = Column(DateTime, default=utc_now)

    farmer = relationship("Farmer", back_populates="farms")
    preferences = relationship(
        "FarmerPreference",
        back_populates="farm",
        cascade="all, delete-orphan",
    )
    climate_records = relationship(
        "ClimateData",
        back_populates="farm",
        cascade="all, delete-orphan",
    )
    recommendations = relationship(
        "CropRecommendation",
        back_populates="farm",
        cascade="all, delete-orphan",
    )
    rotation_plans = relationship(
        "RotationPlan",
        back_populates="farm",
        cascade="all, delete-orphan",
    )
    alerts = relationship(
        "Alert",
        back_populates="farm",
        cascade="all, delete-orphan",
    )
    history = relationship(
        "FarmingHistory",
        back_populates="farm",
        cascade="all, delete-orphan",
    )


class FarmerPreference(Base):
    __tablename__ = "farmer_preferences"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)

    primary_goal = Column(String(50), nullable=True)
    previous_crop = Column(String(50), nullable=True)
    current_crop = Column(String(50), nullable=True)

    created_at = Column(DateTime, default=utc_now)

    farm = relationship("Farm", back_populates="preferences")


class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(String(50), unique=True, index=True)
    name_en = Column(String(100), nullable=False)
    name_kn = Column(String(100), nullable=True)
    name_te = Column(String(100), nullable=True)
    name_ta = Column(String(100), nullable=True)
    name_hi = Column(String(100), nullable=True)
    scientific_name = Column(String(100), nullable=True)
    family = Column(String(50), nullable=True)

    category = Column(String(50), nullable=True)
    water_req_level = Column(String(20), nullable=True)
    water_min_mm = Column(Float, nullable=True)
    water_max_mm = Column(Float, nullable=True)
    duration_days = Column(String(50), nullable=True)
    min_temp = Column(Float, nullable=True)
    max_temp = Column(Float, nullable=True)

    suitable_soils = Column(Text, nullable=True)
    sowing_season = Column(Text, nullable=True)
    reasons_json = Column(Text, nullable=True)
    climate_risks_json = Column(Text, nullable=True)
    soil_health_benefits_json = Column(Text, nullable=True)

    is_legume = Column(Boolean, nullable=True)


class ClimateData(Base):
    __tablename__ = "climate_data"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=True)

    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    retrieval_date = Column(String(50), nullable=True)
    data_source = Column(
        String(150),
        default="NASA POWER",
        nullable=False,
    )
    data_category = Column(
        String(100),
        default="Satellite Earth Observation and Surface Climatology",
        nullable=False,
    )

    # Measurements must be supplied by the data service.
    # Do not silently substitute example or estimated values.
    temp_mean = Column(Float, nullable=True)
    temp_max = Column(Float, nullable=True)
    temp_min = Column(Float, nullable=True)
    precipitation_annual_or_daily = Column(Float, nullable=True)
    solar_radiation = Column(Float, nullable=True)
    soil_moisture_estimate = Column(Float, nullable=True)

    monthly_trends_json = Column(Text, nullable=True)
    raw_response_json = Column(Text, nullable=True)

    created_at = Column(DateTime, default=utc_now)

    farm = relationship("Farm", back_populates="climate_records")


class CropRecommendation(Base):
    __tablename__ = "crop_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)

    crop_id = Column(String(50), nullable=False)
    suitability_category = Column(String(50), nullable=True)
    ranking_score = Column(Float, nullable=True)

    reasons_json = Column(Text, nullable=True)
    climate_risks_json = Column(Text, nullable=True)

    created_at = Column(DateTime, default=utc_now)

    farm = relationship("Farm", back_populates="recommendations")


class RotationPlan(Base):
    __tablename__ = "rotation_plans"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)

    plan_code = Column(String(50), nullable=True)
    plan_title = Column(Text, nullable=True)
    plan_summary = Column(Text, nullable=True)
    seasons_sequence_json = Column(Text, nullable=True)
    water_saving_summary = Column(Text, nullable=True)
    soil_health_summary = Column(Text, nullable=True)

    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

    farm = relationship("Farm", back_populates="rotation_plans")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=True)

    severity = Column(String(20), nullable=True)
    alert_type = Column(String(50), nullable=True)

    title_json = Column(Text, nullable=True)
    explanation_json = Column(Text, nullable=True)
    suggested_action_json = Column(Text, nullable=True)

    data_source = Column(String(100), default="NASA POWER")
    date_generated = Column(String(50), nullable=True)

    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

    farm = relationship("Farm", back_populates="alerts")


class FarmingHistory(Base):
    __tablename__ = "farming_history"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)

    season_year = Column(String(50), nullable=True)
    crop_name = Column(String(100), nullable=True)
    yield_note = Column(String(100), nullable=True)
    observations = Column(Text, nullable=True)

    created_at = Column(DateTime, default=utc_now)

    farm = relationship("Farm", back_populates="history")