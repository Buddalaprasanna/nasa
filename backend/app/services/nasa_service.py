
import calendar
import logging
import os
import math
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import httpx

logger = logging.getLogger("field_shift.nasa_service")


class NASADataUnavailableError(RuntimeError):
    """Raised when live climate data cannot be retrieved or validated."""


class NASAEarthDataService:
    """
    Retrieves actual observations and climate normals from NASA POWER.

    Important:
    - No fabricated or regional sample-data fallback.
    - Daily observations are retrospective, not forecasts.
    - Climate normals are historical averages, not today's weather.
    - GPM/IMERG is not claimed to be integrated by this service.
    """

    DAILY_URL = os.getenv(
        "NASA_POWER_DAILY_URL",
        "https://power.larc.nasa.gov/api/temporal/daily/point",
    )

    CLIMATOLOGY_URL = os.getenv(
        "NASA_POWER_BASE_URL",
        "https://power.larc.nasa.gov/api/temporal/climatology/point",
    )

    DAILY_PARAMETERS = (
        "T2M,T2M_MAX,T2M_MIN,PRECTOTCORR,"
        "ALLSKY_SFC_SW_DWN,GWETTOP"
    )

    CLIMATOLOGY_PARAMETERS = (
        "T2M,T2M_MAX,T2M_MIN,PRECTOTCORR,"
        "ALLSKY_SFC_SW_DWN"
    )

    MONTHS = (
        "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
        "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
    )

    def __init__(self, timeout_seconds: float = 20.0):
        self.timeout = timeout_seconds

    @staticmethod
    def validate_coordinates(lat: float, lon: float) -> bool:
        try:
            latitude = float(lat)
            longitude = float(lon)
        except (TypeError, ValueError):
            return False

        return (
            math.isfinite(latitude)
            and math.isfinite(longitude)
            and -90.0 <= latitude <= 90.0
            and -180.0 <= longitude <= 180.0
        )

    @staticmethod
    def _valid_number(value: Any) -> Optional[float]:
        """Validate a provider value and reject POWER's -999 missing sentinel."""
        try:
            number = float(value)
        except (TypeError, ValueError):
            return None

        if not math.isfinite(number) or number <= -900:
            return None

        return number

    @staticmethod
    def _extract_parameters(payload: Dict[str, Any]) -> Dict[str, Any]:
        try:
            parameters = payload["properties"]["parameter"]
        except (KeyError, TypeError) as exc:
            raise NASADataUnavailableError(
                "The climate provider returned an unexpected response structure."
            ) from exc

        if not isinstance(parameters, dict) or not parameters:
            raise NASADataUnavailableError(
                "The climate provider returned no parameter data."
            )

        return parameters

    async def _request(
        self,
        client: httpx.AsyncClient,
        url: str,
        params: Dict[str, Any],
    ) -> Dict[str, Any]:

        try:
            response = await client.get(url, params=params)
            response.raise_for_status()
            payload = response.json()

        except (httpx.HTTPError, ValueError) as exc:
            logger.warning("NASA POWER request failed: %s", exc)

            raise NASADataUnavailableError(
                "Live climate data is temporarily unavailable. "
                "Please try again later."
            ) from exc

        if not isinstance(payload, dict):
            raise NASADataUnavailableError(
                "The climate provider returned an invalid response."
            )

        if payload.get("errors"):
            raise NASADataUnavailableError(
                "The climate provider could not process this farm location."
            )

        return payload

    async def get_climate_data(
        self,
        lat: float,
        lon: float,
    ) -> Dict[str, Any]:
        """
        Retrieve:
        1. Recent daily observations.
        2. Long-term monthly climate normals.

        The compatibility field precipitation_annual_or_daily now contains
        the accumulated rainfall from the returned recent daily observations
        in mm. It is not an annual rainfall figure.
        """

        if not self.validate_coordinates(lat, lon):
            raise ValueError("Invalid farm latitude or longitude.")

        latitude = round(float(lat), 4)
        longitude = round(float(lon), 4)

        # Daily observations are retrospective. Request through yesterday.
        today_utc = datetime.now(timezone.utc).date()
        end_date = today_utc - timedelta(days=1)
        start_date = end_date - timedelta(days=29)

        daily_params = {
            "parameters": self.DAILY_PARAMETERS,
            "community": "AG",
            "longitude": longitude,
            "latitude": latitude,
            "start": start_date.strftime("%Y%m%d"),
            "end": end_date.strftime("%Y%m%d"),
            "format": "JSON",
        }

        climatology_params = {
            "parameters": self.CLIMATOLOGY_PARAMETERS,
            "community": "AG",
            "longitude": longitude,
            "latitude": latitude,
            "format": "JSON",
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            daily_payload = await self._request(
                client,
                self.DAILY_URL,
                daily_params,
            )

            climatology_payload = await self._request(
                client,
                self.CLIMATOLOGY_URL,
                climatology_params,
            )

        daily = self._extract_parameters(daily_payload)
        normals = self._extract_parameters(climatology_payload)

        daily_dates = daily.get("T2M", {})

        if not isinstance(daily_dates, dict) or not daily_dates:
            raise NASADataUnavailableError(
                "No recent daily climate observations are available "
                "for this location."
            )

        observation_keys = sorted(
            key
            for key in daily_dates
            if isinstance(key, str)
            and len(key) == 8
            and key.isdigit()
        )

        if not observation_keys:
            raise NASADataUnavailableError(
                "No dated climate observations were returned."
            )

        def latest_value(parameter_name: str) -> Optional[float]:
            values = daily.get(parameter_name, {})

            if not isinstance(values, dict):
                return None

            for key in reversed(observation_keys):
                value = self._valid_number(values.get(key))

                if value is not None:
                    return value

            return None

        latest_temp = latest_value("T2M")
        latest_temp_max = latest_value("T2M_MAX")
        latest_temp_min = latest_value("T2M_MIN")
        latest_soil_wetness = latest_value("GWETTOP")
        latest_radiation = latest_value("ALLSKY_SFC_SW_DWN")

        rainfall_values = daily.get("PRECTOTCORR", {})

        if not isinstance(rainfall_values, dict):
            rainfall_values = {}

        daily_rainfall = {}

        for key in observation_keys:
            value = self._valid_number(rainfall_values.get(key))

            if value is not None:
                daily_rainfall[key] = round(max(0.0, value), 2)

        if latest_temp is None or not daily_rainfall:
            raise NASADataUnavailableError(
                "The provider did not return enough valid recent observations."
            )

        rainfall_total = round(sum(daily_rainfall.values()), 1)

        # Build monthly climate normals.
        # PRECTOTCORR climatology is a mean daily rate (mm/day).
        # Multiply by the actual number of days in each month.
        monthly_trends: Dict[str, Dict[str, Optional[float]]] = {}

        normal_precip = normals.get("PRECTOTCORR", {})
        normal_temp = normals.get("T2M", {})
        normal_temp_max = normals.get("T2M_MAX", {})
        normal_temp_min = normals.get("T2M_MIN", {})
        normal_radiation = normals.get("ALLSKY_SFC_SW_DWN", {})

        current_month = today_utc.month

        for month_index, month_name in enumerate(
            self.MONTHS,
            start=1,
        ):
            rain_rate = self._valid_number(
                normal_precip.get(month_name)
            )

            if rain_rate is not None:
                month_rain = round(
                    max(0.0, rain_rate)
                    * calendar.monthrange(2001, month_index)[1],
                    1,
                )
            else:
                month_rain = None

            monthly_trends[month_name] = {
                "rainfall_mm": month_rain,
                "temp_mean": self._round_or_none(
                    normal_temp.get(month_name), 1
                ),
                "temp_max": self._round_or_none(
                    normal_temp_max.get(month_name), 1
                ),
                "temp_min": self._round_or_none(
                    normal_temp_min.get(month_name), 1
                ),
                "solar_radiation": self._round_or_none(
                    normal_radiation.get(month_name), 1
                ),
            }

        current_normal = monthly_trends[
            self.MONTHS[current_month - 1]
        ]

        valid_months = sum(
            1
            for item in monthly_trends.values()
            if item["rainfall_mm"] is not None
        )

        if valid_months == 0:
            raise NASADataUnavailableError(
                "No monthly climate-normal data is available "
                "for this location."
            )

        return {
            "retrieval_date": datetime.now(timezone.utc).isoformat(),

            "observation_start_date": start_date.isoformat(),
            "observation_end_date": end_date.isoformat(),

            "latest_observation_date": datetime.strptime(
                observation_keys[-1],
                "%Y%m%d",
            ).date().isoformat(),

            "data_source": (
                "NASA POWER daily point observations and climatology"
            ),

            "is_live_api": True,

            "data_category": (
                "Retrieved satellite and meteorological model observations"
            ),

            # Internal backend metadata; do not show to farmers.
            "coordinates": f"{latitude:.4f}, {longitude:.4f}",

            "temp_mean": round(latest_temp, 1),
            "temp_max": self._round_or_none(latest_temp_max, 1),
            "temp_min": self._round_or_none(latest_temp_min, 1),

            # Retained for compatibility with existing app models/routes.
            "precipitation_annual_or_daily": rainfall_total,

            "rainfall_last_30_days_mm": rainfall_total,
            "rainfall_daily_observations_mm": daily_rainfall,

            "solar_radiation": self._round_or_none(
                latest_radiation, 1
            ),

            "soil_moisture_estimate": self._round_or_none(
                latest_soil_wetness, 3
            ),

            "soil_moisture_available": (
                latest_soil_wetness is not None
            ),

            "current_month_climatology": current_normal,
            "monthly_trends": monthly_trends,

            "data_nature_disclaimer": (
                "These are gridded retrospective estimates and "
                "long-term climate normals, not farm-level sensor "
                "readings or a weather forecast. Soil wetness is "
                "available only when the provider returns a valid value."
            ),
        }

    @staticmethod
    def _round_or_none(
        value: Any,
        digits: int,
    ) -> Optional[float]:

        number = NASAEarthDataService._valid_number(value)

        return round(number, digits) if number is not None else None
