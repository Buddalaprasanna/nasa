from .health import router as health_router
from .farmers import router as farmers_router
from .farms import router as farms_router
from .climate import router as climate_router
from .recommendations import router as recommendations_router
from .rotation import router as rotation_router
from .alerts import router as alerts_router
from .crops import router as crops_router
from .voice import router as voice_router

__all__ = [
    "health_router",
    "farmers_router",
    "farms_router",
    "climate_router",
    "recommendations_router",
    "rotation_router",
    "alerts_router",
    "crops_router",
    "voice_router",
]
