
import json
import logging
import math
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import ClimateData, Farm
from ..schemas import ClimateFetchRequest, ClimateResponse
from ..services.nasa_service import (
    NASAEarthDataService,
    NASADataUnavailableError,
)
from ..services.soil_service import SoilService
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/climate", tags=["Climate"])
nasa_service = NASAEarthDataService()


class ClimateSoilIdentifyRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    district: Optional[str] = None
    state: Optional[str] = None


@router.post("/identify-soil")
def identify_climate_soil(data: ClimateSoilIdentifyRequest):
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


def _valid_number(value: Any) -> bool:
    """Return True only for finite numeric values."""
    if value is None or isinstance(value, bool):
        return False

    try:
        return math.isfinite(float(value))
    except (TypeError, ValueError, OverflowError):
        return False


def _safe_monthly_trends(value: Optional[str]) -> Dict[str, Any]:
    """Decode stored monthly trends without inventing replacement values."""
    if not value:
        return {}

    try:
        decoded = json.loads(value)
    except (TypeError, json.JSONDecodeError):
        logger.warning("Stored monthly climate trends contain invalid JSON.")
        return {}

    return decoded if isinstance(decoded, dict) else {}


def _validate_climate_data(data: Dict[str, Any]) -> None:
    """Reject incomplete or invalid measurements."""
    required_fields = (
        "retrieval_date",
        "data_source",
        "data_category",
        "temp_mean",
        "temp_max",
        "temp_min",
        "precipitation_annual_or_daily",
        "solar_radiation",
    )

    missing = [
        field for field in required_fields
        if data.get(field) is None
    ]

    if missing:
        logger.error("Climate response is missing fields: %s", missing)
        raise HTTPException(
            status_code=503,
            detail="Climate data is incomplete. Please try again later.",
        )

    numeric_fields = (
        "temp_mean",
        "temp_max",
        "temp_min",
        "precipitation_annual_or_daily",
        "solar_radiation",
    )

    for field in numeric_fields:
        if not _valid_number(data.get(field)):
            logger.error("Climate response contains invalid field: %s", field)
            raise HTTPException(
                status_code=503,
                detail="Climate measurements are invalid. Please try again later.",
            )

    if not isinstance(data.get("monthly_trends"), dict):
        raise HTTPException(
            status_code=503,
            detail="Monthly climate information is unavailable.",
        )

    soil_moisture = data.get("soil_moisture_estimate")
    if soil_moisture is not None and not _valid_number(soil_moisture):
        raise HTTPException(
            status_code=503,
            detail="Soil moisture information is invalid.",
        )


def _build_response(
    data: Dict[str, Any],
    *,
    record_id: Optional[int] = None,
    farm_id: Optional[int] = None,
    latitude: float,
    longitude: float,
    stored_record: bool = False,
) -> ClimateResponse:
    """Build the response using only validated source data."""
    _validate_climate_data(data)

    disclaimer = data.get("data_nature_disclaimer") or (
        "These are regional gridded climate estimates, not direct "
        "measurements from sensors on your farm."
    )

    if stored_record:
        disclaimer += (
            " This information was retrieved previously and is not "
            "a newly fetched observation."
        )

    return ClimateResponse(
        id=record_id,
        farm_id=farm_id,
        latitude=latitude,
        longitude=longitude,
        retrieval_date=str(data["retrieval_date"]),
        data_source=str(data["data_source"]),
        data_category=str(data["data_category"]),
        temp_mean=float(data["temp_mean"]),
        temp_max=float(data["temp_max"]),
        temp_min=float(data["temp_min"]),
        precipitation_annual_or_daily=float(
            data["precipitation_annual_or_daily"]
        ),
        solar_radiation=float(data["solar_radiation"]),
        soil_moisture_estimate=(
            float(data["soil_moisture_estimate"])
            if data.get("soil_moisture_estimate") is not None
            else None
        ),
        monthly_trends=data["monthly_trends"],
        data_nature_disclaimer=disclaimer,
    )


def _record_to_data(record: ClimateData) -> Dict[str, Any]:
    """Convert a database record into the service response structure."""
    raw_data: Dict[str, Any] = {}

    if record.raw_response_json:
        try:
            parsed = json.loads(record.raw_response_json)
            if isinstance(parsed, dict):
                raw_data = parsed
        except (TypeError, json.JSONDecodeError):
            logger.warning(
                "Climate record %s contains invalid response JSON.",
                record.id,
            )

    return {
        **raw_data,
        "retrieval_date": record.retrieval_date,
        "data_source": record.data_source,
        "data_category": record.data_category,
        "temp_mean": record.temp_mean,
        "temp_max": record.temp_max,
        "temp_min": record.temp_min,
        "precipitation_annual_or_daily": (
            record.precipitation_annual_or_daily
        ),
        "solar_radiation": record.solar_radiation,
        "soil_moisture_estimate": record.soil_moisture_estimate,
        "monthly_trends": _safe_monthly_trends(
            record.monthly_trends_json
        ),
    }


def _validate_coordinates(latitude: Any, longitude: Any) -> None:
    if not _valid_number(latitude) or not _valid_number(longitude):
        raise HTTPException(
            status_code=422,
            detail=(
                "Farm GPS location is missing or invalid. "
                "Please update your farm location."
            ),
        )

    if not -90 <= float(latitude) <= 90:
        raise HTTPException(
            status_code=422,
            detail="The farm location is invalid.",
        )

    if not -180 <= float(longitude) <= 180:
        raise HTTPException(
            status_code=422,
            detail="The farm location is invalid.",
        )


@router.post("", response_model=ClimateResponse)
async def fetch_climate(
    request: ClimateFetchRequest,
    db: Session = Depends(get_db),
):
    """
    Fetch fresh climate information for a registered farm or
    explicitly supplied coordinates.

    Registered farm coordinates are authoritative.
    """
    farm = None

    if request.farm_id is not None:
        farm = (
            db.query(Farm)
            .filter(Farm.id == request.farm_id)
            .first()
        )

        if farm is None:
            raise HTTPException(
                status_code=404,
                detail="Farm not found.",
            )

        latitude = farm.latitude
        longitude = farm.longitude

    else:
        latitude = request.latitude
        longitude = request.longitude

        if latitude is None or longitude is None:
            raise HTTPException(
                status_code=422,
                detail="A farm location is required.",
            )

    _validate_coordinates(latitude, longitude)

    latitude = float(latitude)
    longitude = float(longitude)

    try:
        nasa_result = await nasa_service.get_climate_data(
            latitude,
            longitude,
        )

    except NASADataUnavailableError:
        logger.warning(
            "Climate service unavailable for requested location."
        )
        raise HTTPException(
            status_code=503,
            detail=(
                "Climate information is temporarily unavailable. "
                "Please try again later."
            ),
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        )

    except Exception:
        logger.exception(
            "Unexpected error while retrieving climate information."
        )
        raise HTTPException(
            status_code=503,
            detail=(
                "Climate information is temporarily unavailable. "
                "Please try again later."
            ),
        )

    if not isinstance(nasa_result, dict):
        raise HTTPException(
            status_code=503,
            detail="The climate service returned an invalid response.",
        )

    response = _build_response(
        nasa_result,
        farm_id=farm.id if farm else None,
        latitude=latitude,
        longitude=longitude,
    )

    # Save only validated results for registered farms.
    if farm is not None:
        try:
            record = ClimateData(
                farm_id=farm.id,
                latitude=latitude,
                longitude=longitude,
                retrieval_date=str(nasa_result["retrieval_date"]),
                data_source=str(nasa_result["data_source"]),
                data_category=str(nasa_result["data_category"]),
                temp_mean=float(nasa_result["temp_mean"]),
                temp_max=float(nasa_result["temp_max"]),
                temp_min=float(nasa_result["temp_min"]),
                precipitation_annual_or_daily=float(
                    nasa_result["precipitation_annual_or_daily"]
                ),
                solar_radiation=float(nasa_result["solar_radiation"]),
                soil_moisture_estimate=(
                    float(nasa_result["soil_moisture_estimate"])
                    if nasa_result.get("soil_moisture_estimate") is not None
                    else None
                ),
                monthly_trends_json=json.dumps(
                    nasa_result["monthly_trends"],
                    allow_nan=False,
                ),
                raw_response_json=json.dumps(
                    nasa_result,
                    allow_nan=False,
                ),
            )

            db.add(record)
            db.commit()
            db.refresh(record)

            response.id = record.id

        except Exception:
            db.rollback()
            logger.exception(
                "Climate information was retrieved but could not be saved."
            )

    return response


@router.get("/{farm_id}", response_model=ClimateResponse)
async def get_farm_climate(
    farm_id: int,
    db: Session = Depends(get_db),
):
    """Return the latest saved climate record, clearly marked as historical."""
    farm = (
        db.query(Farm)
        .filter(Farm.id == farm_id)
        .first()
    )

    if farm is None:
        raise HTTPException(
            status_code=404,
            detail="Farm not found.",
        )

    existing = (
        db.query(ClimateData)
        .filter(ClimateData.farm_id == farm_id)
        .order_by(ClimateData.id.desc())
        .first()
    )

    if existing is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "No saved climate information is available for this farm yet. "
                "Request a climate update first."
            ),
        )

    stored_data = _record_to_data(existing)

    return _build_response(
        stored_data,
        record_id=existing.id,
        farm_id=farm.id,
        latitude=existing.latitude,
        longitude=existing.longitude,
        stored_record=True,
    )
