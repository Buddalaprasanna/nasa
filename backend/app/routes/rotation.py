from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json
from ..database import get_db
from ..models import Farm, FarmerPreference, RotationPlan
from ..schemas import RotationGenerateRequest, RotationGenerateResponse, RotationSaveRequest, RotationPlanItem
from ..engines import CropRotationEngine

router = APIRouter(prefix="/api/rotation", tags=["Rotation"])
rotation_engine = CropRotationEngine()

@router.post("/generate", response_model=RotationGenerateResponse)
def generate_rotation(req: RotationGenerateRequest, db: Session = Depends(get_db)):
    soil = req.soil_type or "red"
    irrigation = req.irrigation_type or "rainwater"
    previous = req.previous_crop or "paddy"
    goal = req.primary_goal or "improve_soil_health"

    if req.farm_id:
        farm = db.query(Farm).filter(Farm.id == req.farm_id).first()
        if farm:
            soil = farm.soil_type
            irrigation = farm.irrigation_type
            pref = db.query(FarmerPreference).filter(FarmerPreference.farm_id == farm.id).order_by(FarmerPreference.id.desc()).first()
            if pref:
                if pref.previous_crop:
                    previous = pref.previous_crop
                if pref.primary_goal:
                    goal = pref.primary_goal

    plans = rotation_engine.generate_rotation_plans(
        soil_type=soil,
        irrigation_type=irrigation,
        previous_crop=previous,
        primary_goal=goal
    )

    # Check if a plan is already saved for this farm
    if req.farm_id:
        saved = db.query(RotationPlan).filter(RotationPlan.farm_id == req.farm_id, RotationPlan.is_active == True).first()
        if saved:
            for p in plans:
                if p["plan_code"] == saved.plan_code:
                    p["is_saved"] = True

    return RotationGenerateResponse(
        farm_id=req.farm_id,
        available_plans=plans,
        agronomic_advisory=(
            "ADVISORY: Multi-season rotation alternates grass/cereal and pulse families to "
            "break continuous host pest lifecycles and rebuild biological nitrogen in the root zone."
        )
    )

@router.get("/{farm_id}", response_model=RotationGenerateResponse)
def get_farm_rotation(farm_id: int, db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    pref = db.query(FarmerPreference).filter(FarmerPreference.farm_id == farm_id).order_by(FarmerPreference.id.desc()).first()
    prev = pref.previous_crop if pref else "paddy"
    goal = pref.primary_goal if pref else "improve_soil_health"

    plans = rotation_engine.generate_rotation_plans(
        soil_type=farm.soil_type,
        irrigation_type=farm.irrigation_type,
        previous_crop=prev,
        primary_goal=goal
    )

    saved = db.query(RotationPlan).filter(RotationPlan.farm_id == farm_id, RotationPlan.is_active == True).first()
    if saved:
        for p in plans:
            if p["plan_code"] == saved.plan_code:
                p["is_saved"] = True

    return RotationGenerateResponse(
        farm_id=farm_id,
        available_plans=plans,
        agronomic_advisory="Active rotation sequences calibrated to local soil and rainfall conditions."
    )

@router.post("/save")
def save_rotation_plan(req: RotationSaveRequest, db: Session = Depends(get_db)):
    # Deactivate existing active plans for this farm
    db.query(RotationPlan).filter(RotationPlan.farm_id == req.farm_id).update({"is_active": False})

    new_plan = RotationPlan(
        farm_id=req.farm_id,
        plan_code=req.plan_code,
        plan_title=json.dumps(req.plan_title),
        plan_summary=json.dumps(req.plan_summary),
        seasons_sequence_json=json.dumps(req.seasons),
        water_saving_summary=json.dumps(req.water_saving_summary),
        soil_health_summary=json.dumps(req.soil_health_summary),
        is_active=True
    )
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)

    return {
        "success": True,
        "message": "Crop rotation plan saved successfully",
        "plan_id": new_plan.id,
        "plan_code": new_plan.plan_code
    }
