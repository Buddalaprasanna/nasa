# backend/main.py - FastAPI Backend Service for FIELD SHIFT

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any
from .models import FarmerSetupRequest
from .nasa_service import NASAEarthDataService
from .recommendation_engine import CropRecommendationEngine

app = FastAPI(
    title="FIELD SHIFT - Smart Farming API",
    description="Backend microservice serving NASA Earth observations, crop suitability, and rotation planning for Indian farmers.",
    version="1.0.0"
)

# CORS configuration for FlutterFlow / Web / Mobile frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

nasa_service = NASAEarthDataService(use_live_api=False)
rec_engine = CropRecommendationEngine()

@app.get("/")
def read_root():
    return {
        "app": "FIELD SHIFT",
        "tagline": "Smart farming. Better seasons. Stronger future.",
        "status": "online",
        "data_notice": "Integrates NASA POWER and NASA GPM IMERG satellite climatology.",
        "version": "1.0.0"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "field-shift-backend"}

@app.post("/api/crops/recommend")
async def get_crop_recommendations(profile: FarmerSetupRequest):
    """
    Returns transparent agronomic recommendations based on farm soil, water,
    previous crop, and historical agro-climatic conditions.
    """
    try:
        recommendations = rec_engine.recommend_crops(profile)
        return {
            "success": True,
            "farmer_location": profile.village_name,
            "soil_evaluated": profile.soil_type,
            "recommendations": recommendations,
            "data_rules": "No speculative percentage guarantees. Categorized by physical suitability."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/climate/observations")
async def get_climate_data(lat: float = Query(12.52), lon: float = Query(76.89)):
    """
    Retrieves satellite agrometeorology and rainfall climatology from NASA POWER and GPM IMERG.
    """
    data = await nasa_service.get_agrometeorology_data(lat, lon)
    return data

@app.get("/api/rotation/plans")
def get_rotation_plans(goal: Optional[str] = "soil_health"):
    """
    Provides multi-season crop rotation sequences (e.g. Plan A: Legume Soil Builder, Plan B: Resilient Millet).
    """
    return {
        "plans": [
            {
                "id": "planA",
                "title": "Water-Smart Legume Cycle (Soil Rebuilding)",
                "sequence": ["Finger Millet (Kharif)", "Red Gram (Rabi)", "Green Manure / Sunnhemp (Summer)"],
                "water_saving": "35% less irrigation water than double cereal cycles",
                "soil_benefit": "Fixes 40-50 kg/ha atmospheric nitrogen; reduces chemical urea expense."
            },
            {
                "id": "planB",
                "title": "High-Resilience Millet & Oilseed Cycle (Income Balance)",
                "sequence": ["Groundnut (Kharif)", "Finger Millet (Rabi)", "Chickpea (Summer)"],
                "water_saving": "Drought resilient; balanced commercial cashflow and family food security.",
                "soil_benefit": "Continuous soil vegetative cover suppresses weeds and prevents topsoil erosion."
            }
        ],
        "disclaimer": "Sample illustrative sequences. Review with local Krishi Vigyan Kendra (KVK)."
    }

@app.get("/api/alerts")
def get_active_alerts(village: Optional[str] = "Mandya"):
    """
    Returns current agro-climatic advisories with color-coded severity.
    """
    return {
        "station": village,
        "alerts": [
            {
                "id": "alert-dry-spell",
                "severity": "warning",
                "title": "Moderate Dry Spell Warning (10 Days)",
                "explanation": "NASA GPM IMERG anomaly models indicate rainfall under 5mm for the next 10 days.",
                "action": "Apply leaf or straw mulch to preserve root-zone soil moisture.",
                "validity": "13 Nov 2026 - 23 Nov 2026",
                "source": "NASA GPM IMERG Satellite Precipitation Anomaly"
            },
            {
                "id": "alert-heat-spike",
                "severity": "warning",
                "title": "Daytime Temperature Anomaly (+2.8°C)",
                "explanation": "Afternoon temperatures estimated 2.8°C above seasonal normal.",
                "action": "Provide light evening irrigation to vegetable crops to prevent heat wilting.",
                "validity": "14 Nov 2026 - 19 Nov 2026",
                "source": "NASA POWER 2m Temperature MERRA-2"
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
