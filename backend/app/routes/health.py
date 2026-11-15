from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter(tags=["Health"])

@router.get("/api/health")
def get_health():
    return {
        "status": "healthy",
        "service": "FIELD SHIFT Agroclimatology & Crop Rotation Backend",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "nasa_integration": "NASA POWER Climatology Point API (Active)",
        "gpm_satellite_status": "NASA GPM IMERG Reference Available",
        "supported_languages": ["kn", "te", "ta", "hi", "en"]
    }
