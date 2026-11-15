from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from ..engines.crop_dataset import CROPS_DATASET

router = APIRouter(prefix="/api/crops", tags=["Crops"])

@router.get("", response_model=List[Dict[str, Any]])
def list_crops():
    """Returns the full master crop dataset for Indian agro-climatic conditions."""
    return CROPS_DATASET

@router.get("/{crop_id}", response_model=Dict[str, Any])
def get_crop_details(crop_id: str):
    """Returns detailed agronomic parameters for a single crop."""
    for c in CROPS_DATASET:
        if c["crop_id"].lower() == crop_id.lower():
            return c
    raise HTTPException(status_code=404, detail="Crop not found in dataset")
