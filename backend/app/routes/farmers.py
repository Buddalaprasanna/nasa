from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Farmer
from ..schemas import FarmerCreate, FarmerResponse

router = APIRouter(prefix="/api/farmers", tags=["Farmers"])

@router.post("", response_model=FarmerResponse)
def create_farmer(data: FarmerCreate, db: Session = Depends(get_db)):
    farmer = Farmer(
        name=data.name or "Farmer",
        phone=data.phone,
        preferred_language=data.preferred_language or "en"
    )
    db.add(farmer)
    db.commit()
    db.refresh(farmer)
    return farmer

@router.get("/{farmer_id}", response_model=FarmerResponse)
def get_farmer(farmer_id: int, db: Session = Depends(get_db)):
    farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    return farmer
