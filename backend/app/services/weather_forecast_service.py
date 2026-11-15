"""
weather_forecast_service.py - Forward-Looking 10-Day Numerical Weather Forecast Service.

Integrates:
- High-Resolution Numerical Weather Prediction (NWP) models (Open-Meteo with IMD/ECMWF assimilation).
- IMD (India Meteorological Department) heavy rainfall categorization thresholds:
  - Very Light to Light: < 15.5 mm/day
  - Moderate Rain: 15.6 - 64.4 mm/day
  - Heavy Rain: 64.5 - 115.5 mm/day
  - Very Heavy Rain: > 115.5 mm/day

Important limitations:
- Distinguishes future forecasts (next 7-10 days) from historical/retrospective NASA POWER data.
- Never fabricates numerical predictions if API is offline.
"""

import json
import logging
import ssl
import urllib.request
import urllib.error
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

logger = logging.getLogger("field_shift.forecast_service")

# WMO Weather interpretation codes
WMO_DESCRIPTIONS = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
}


class WeatherForecastService:
    """Provides genuine 10-day numerical weather forecasts for farm coordinates."""

    BASE_URL = "https://api.open-meteo.com/v1/forecast"

    @classmethod
    def get_10day_forecast(
        cls,
        latitude: float,
        longitude: float,
        timeout_seconds: float = 4.0,
    ) -> Optional[Dict[str, Any]]:
        """
        Fetch a 10-day numerical forecast for the farm coordinates.
        Returns parsed forecast metrics or None if unreachable.
        """
        lat = round(float(latitude), 4)
        lon = round(float(longitude), 4)

        url = (
            f"{cls.BASE_URL}?"
            f"latitude={lat}&longitude={lon}&"
            f"daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,windspeed_10m_max&"
            f"timezone=Asia%2FKolkata&forecast_days=10"
        )

        headers = {
            "User-Agent": "FieldShift/1.0 (Agriculture Decision Support; Non-Commercial)",
            "Accept": "application/json",
        }

        try:
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE

            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=timeout_seconds, context=ctx) as resp:
                if resp.status == 200:
                    raw_data = json.loads(resp.read().decode("utf-8"))
                    return cls._parse_forecast_data(raw_data, lat, lon)
        except Exception as exc:
            logger.info("Live weather forecast query failed (%s); reporting service unavailability.", exc)
            return None

        return None

    @classmethod
    def _parse_forecast_data(
        cls,
        data: Dict[str, Any],
        lat: float,
        lon: float,
    ) -> Dict[str, Any]:
        """Parse raw forecast data into agricultural advisory metrics."""
        daily = data.get("daily", {})
        times = daily.get("time", [])
        precip_sums = daily.get("precipitation_sum", [])
        precip_probs = daily.get("precipitation_probability_max", [])
        temp_maxs = daily.get("temperature_2m_max", [])
        temp_mins = daily.get("temperature_2m_min", [])
        wind_speeds = daily.get("windspeed_10m_max", [])
        weather_codes = daily.get("weathercode", [])

        daily_list: List[Dict[str, Any]] = []
        total_rain_10d = 0.0
        total_rain_7d = 0.0
        rain_days_count = 0
        max_single_day_rain = 0.0
        max_rain_date = ""

        for idx, date_str in enumerate(times):
            p_sum = float(precip_sums[idx]) if idx < len(precip_sums) and precip_sums[idx] is not None else 0.0
            p_prob = int(precip_probs[idx]) if idx < len(precip_probs) and precip_probs[idx] is not None else 0
            t_max = float(temp_maxs[idx]) if idx < len(temp_maxs) and temp_maxs[idx] is not None else 0.0
            t_min = float(temp_mins[idx]) if idx < len(temp_mins) and temp_mins[idx] is not None else 0.0
            w_spd = float(wind_speeds[idx]) if idx < len(wind_speeds) and wind_speeds[idx] is not None else 0.0
            w_code = int(weather_codes[idx]) if idx < len(weather_codes) and weather_codes[idx] is not None else 0

            p_sum = max(0.0, p_sum)
            total_rain_10d += p_sum
            if idx < 7:
                total_rain_7d += p_sum

            if p_sum >= 2.5:
                rain_days_count += 1

            if p_sum > max_single_day_rain:
                max_single_day_rain = p_sum
                max_rain_date = date_str

            daily_list.append({
                "date": date_str,
                "precipitation_mm": round(p_sum, 1),
                "precipitation_probability_pct": p_prob,
                "temp_max_c": round(t_max, 1),
                "temp_min_c": round(t_min, 1),
                "wind_speed_kmh": round(w_spd, 1),
                "weather_code": w_code,
                "weather_condition": WMO_DESCRIPTIONS.get(w_code, "Partly cloudy"),
            })

        # Evaluate IMD heavy rainfall criteria
        # IMD Threshold: Heavy rain >= 64.5 mm/day
        if max_single_day_rain >= 64.5:
            heavy_rain_risk = True
            risk_level = "High"
            risk_desc = f"Heavy rainfall exceeding IMD threshold ({max_single_day_rain:.1f} mm on {max_rain_date})"
        elif max_single_day_rain >= 35.0:
            heavy_rain_risk = True
            risk_level = "Moderate"
            risk_desc = f"Moderate-to-heavy rainfall risk ({max_single_day_rain:.1f} mm on {max_rain_date})"
        elif max_single_day_rain >= 15.6:
            heavy_rain_risk = False
            risk_level = "Low"
            risk_desc = f"Moderate rainfall ({max_single_day_rain:.1f} mm on {max_rain_date}), no flood risk"
        else:
            heavy_rain_risk = False
            risk_level = "None"
            risk_desc = "No heavy rainfall expected over the forecast window"

        temp_max_peak = max(d["temp_max_c"] for d in daily_list) if daily_list else 0.0
        temp_min_lowest = min(d["temp_min_c"] for d in daily_list) if daily_list else 0.0
        max_prob_overall = max((d["precipitation_probability_pct"] for d in daily_list), default=0)

        return {
            "is_available": True,
            "data_source": "Open-Meteo High-Resolution NWP (IMD / ECMWF Assimilation)",
            "forecast_start_date": times[0] if times else "",
            "forecast_end_date": times[-1] if times else "",
            "forecast_days": len(daily_list),
            "latitude": lat,
            "longitude": lon,
            "total_rainfall_10d_mm": round(total_rain_10d, 1),
            "total_rainfall_7d_mm": round(total_rain_7d, 1),
            "rainy_days_count": rain_days_count,
            "max_single_day_rain_mm": round(max_single_day_rain, 1),
            "max_rain_date": max_rain_date,
            "max_rain_probability_pct": max_prob_overall,
            "has_heavy_rain_risk": heavy_rain_risk,
            "heavy_rain_risk_level": risk_level,
            "heavy_rain_risk_description": risk_desc,
            "temp_max_peak_c": temp_max_peak,
            "temp_min_lowest_c": temp_min_lowest,
            "daily_forecasts": daily_list,
            "retrieval_timestamp": datetime.now(timezone.utc).isoformat(),
        }
