
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Farm, Farmer, FarmerPreference
from ..schemas import FarmCreate, FarmResponse
from ..services.geocoding_service import (
    reverse_geocode,
    GeocodingUnavailableError,
)
from ..services.soil_service import SoilService

router = APIRouter(prefix="/api/farms", tags=["Farms"])


class ReverseGeocodeRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


class SoilIdentifyRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    district: Optional[str] = None
    state: Optional[str] = None


@router.post("/reverse-geocode")
async def get_location_details(data: ReverseGeocodeRequest):
    try:
        return await reverse_geocode(
            latitude=data.latitude,
            longitude=data.longitude,
        )
    except GeocodingUnavailableError as exc:
        raise HTTPException(
            status_code=503,
            detail="Location lookup is temporarily unavailable. Please try again.",
        ) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc


@router.post("/identify-soil")
def identify_farm_soil(data: SoilIdentifyRequest):
    """
    Estimate farm soil characteristics from GPS coordinates and district context.
    Uses ISRIC SoilGrids 2.0 with ICAR-NBSS&LUP benchmark survey fallback.
    """
    try:
        profile = SoilService.identify_soil_profile(
            latitude=data.latitude,
            longitude=data.longitude,
            district=data.district,
            state=data.state
        )
        return profile
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to analyze soil profile for location: {exc}"
        )


@router.post("", response_model=FarmResponse)
def create_farm(data: FarmCreate, db: Session = Depends(get_db)):
    # Coordinates must be supplied together, or both omitted.
    if (data.latitude is None) != (data.longitude is None):
        raise HTTPException(
            status_code=400,
            detail="Both latitude and longitude are required together.",
        )

    farmer = None

    try:
        if data.farmer_id is not None:
            farmer = (
                db.query(Farmer)
                .filter(Farmer.id == data.farmer_id)
                .first()
            )

            if farmer is None:
                raise HTTPException(
                    status_code=404,
                    detail="Farmer not found.",
                )

            # Update farmer details only when the request supplies them.
            if data.farmer_name is not None:
                farmer.name = data.farmer_name

            if data.preferred_language is not None:
                farmer.preferred_language = data.preferred_language

        else:
            # Create a new farmer instead of silently selecting
            # an unrelated existing farmer.
            farmer = Farmer(
                name=data.farmer_name or "Farmer",
                preferred_language=data.preferred_language or "kn",
            )
            db.add(farmer)
            db.flush()

        farm = Farm(
            farmer_id=farmer.id,
            village_name=data.village_name,
            district=data.district,
            state=data.state,
            latitude=data.latitude,
            longitude=data.longitude,
            land_size_category=data.land_size_category,
            soil_type=data.soil_type,
            irrigation_type=data.irrigation_type,
        )

        db.add(farm)
        db.flush()

        preference = FarmerPreference(
            farm_id=farm.id,
            primary_goal=data.primary_goal or "improve_soil_health",
            previous_crop=data.previous_crop or "paddy",
            current_crop=data.current_crop,
        )

        db.add(preference)
        db.commit()
        db.refresh(farm)

        return farm

    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="The farm profile could not be saved. Please try again.",
        ) from exc
