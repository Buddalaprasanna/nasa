
"""
Reverse geocoding service for Field Shift.

Converts farmer-confirmed GPS coordinates into readable administrative
location details using OpenStreetMap Nominatim.

Missing address fields remain None. This service never guesses a district
or state from coordinates.
"""

import logging
import os
from typing import Any, Dict, Optional

import httpx

logger = logging.getLogger("field_shift.geocoding")

NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse"
REQUEST_TIMEOUT = 12.0


class GeocodingUnavailableError(Exception):
    """Raised when the reverse-geocoding provider cannot be reached."""


def _first_available(address: Dict[str, Any], keys: tuple) -> Optional[str]:
    for key in keys:
        value = address.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return None


async def reverse_geocode(
    latitude: float,
    longitude: float,
) -> Dict[str, Optional[str]]:
    """
    Resolve GPS coordinates into address components.

    Returns:
        village, district, state, country, country_code, display_name

    Raises:
        ValueError: Invalid coordinates or missing application User-Agent.
        GeocodingUnavailableError: Provider/network/response failure.
    """

    if not isinstance(latitude, (int, float)):
        raise ValueError("Latitude must be numeric.")

    if not isinstance(longitude, (int, float)):
        raise ValueError("Longitude must be numeric.")

    if not (-90 <= latitude <= 90):
        raise ValueError("Latitude must be between -90 and 90.")

    if not (-180 <= longitude <= 180):
        raise ValueError("Longitude must be between -180 and 180.")

    user_agent = os.getenv("GEOCODING_USER_AGENT", "").strip()

    if not user_agent or len(user_agent) < 8:
        raise ValueError(
            "Set GEOCODING_USER_AGENT to a descriptive application "
            "name and contact address."
        )

    params = {
        "format": "jsonv2",
        "lat": str(latitude),
        "lon": str(longitude),
        "zoom": "10",
        "addressdetails": "1",
    }

    headers = {
        "User-Agent": user_agent,
        "Accept": "application/json",
    }

    try:
        async with httpx.AsyncClient(
            timeout=REQUEST_TIMEOUT,
            headers=headers,
        ) as client:
            response = await client.get(
                NOMINATIM_URL,
                params=params,
            )

            response.raise_for_status()
            result = response.json()

    except (httpx.HTTPError, ValueError) as exc:
        logger.warning("Reverse geocoding request failed: %s", exc)
        raise GeocodingUnavailableError(
            "The location service is temporarily unavailable."
        ) from exc

    if not isinstance(result, dict):
        raise GeocodingUnavailableError(
            "The location service returned an invalid response."
        )

    address = result.get("address")

    if not isinstance(address, dict):
        raise GeocodingUnavailableError(
            "No address details were found for these coordinates."
        )

    village = _first_available(
        address,
        (
            "village",
            "hamlet",
            "town",
            "city",
            "suburb",
            "neighbourhood",
            "locality",
        ),
    )

    district = _first_available(
        address,
        (
            "state_district",
            "district",
            "county",
            "city_district",
        ),
    )

    state = _first_available(address, ("state",))
    country = _first_available(address, ("country",))
    country_code = _first_available(address, ("country_code",))

    display_name = result.get("display_name")

    if not isinstance(display_name, str):
        display_name = None

    return {
        "village": village,
        "district": district,
        "state": state,
        "country": country,
        "country_code": country_code.lower() if country_code else None,
        "display_name": display_name,
    }
