
import json
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load backend/.env before application services use environment variables.
BACKEND_ENV_FILE = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=BACKEND_ENV_FILE)

from .database import engine, Base, SessionLocal
from .models import Crop
from .engines.crop_dataset import CROPS_DATASET
from .routes import (
    health_router,
    farmers_router,
    farms_router,
    climate_router,
    recommendations_router,
    rotation_router,
    alerts_router,
    crops_router,
    voice_router,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("field_shift.main")


def seed_crop_catalogue(db):
    """Insert the reference crop catalogue only when the table is empty."""
    if db.query(Crop).count() > 0:
        logger.info("Crop catalogue already exists; skipping seed.")
        return

    logger.info("Seeding the crop reference catalogue...")

    for crop_data in CROPS_DATASET:
        crop_row = Crop(
            crop_id=crop_data["crop_id"],
            name_en=crop_data["name"]["en"],
            name_kn=crop_data["name"].get("kn"),
            name_te=crop_data["name"].get("te"),
            name_ta=crop_data["name"].get("ta"),
            name_hi=crop_data["name"].get("hi"),
            scientific_name=crop_data["scientific_name"],
            family=crop_data["family"],
            category=crop_data["category"],
            water_req_level=crop_data["water_req_level"],
            water_min_mm=crop_data["water_min_mm"],
            water_max_mm=crop_data["water_max_mm"],
            duration_days=crop_data["duration_days"],
            min_temp=crop_data["min_temp"],
            max_temp=crop_data["max_temp"],
            suitable_soils=json.dumps(crop_data["suitable_soils"]),
            sowing_season=json.dumps(crop_data["sowing_season"]),
            reasons_json=json.dumps(crop_data["reasons"]),
            climate_risks_json=json.dumps(crop_data["climate_risks"]),
            soil_health_benefits_json=json.dumps(
                crop_data["soil_health_benefits"]
            ),
            is_legume=crop_data["is_legume"],
        )
        db.add(crop_row)

    db.commit()
    logger.info("Crop reference catalogue seeded successfully.")


def initialize_database():
    """Create missing tables and initialize reference data.

    This does not migrate existing SQLite table structures.
    """
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        seed_crop_catalogue(db)
    except Exception:
        db.rollback()
        logger.exception("Database initialization failed.")
        raise
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize_database()
    yield


app = FastAPI(
    title="FIELD SHIFT API",
    description=(
        "Farmer-focused agricultural decision support using NASA POWER "
        "historical and climatological data, crop suitability reasoning, "
        "multi-season crop rotation planning, and multilingual voice assistance."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(farmers_router)
app.include_router(farms_router)
app.include_router(climate_router)
app.include_router(recommendations_router)
app.include_router(rotation_router)
app.include_router(alerts_router)
app.include_router(crops_router)
app.include_router(voice_router)


@app.get("/")
def root():
    return {
        "app": "FIELD SHIFT",
        "tagline": "Smart farming. Better seasons. Stronger future.",
        "documentation": "/docs",
        "health_check": "/api/health",
    }

def seed_database():
    """Initialize database tables and seed reference data."""
    initialize_database()

