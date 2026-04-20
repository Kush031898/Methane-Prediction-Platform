from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from ..models import SessionLocal, PredictionLog, User
from .users import get_current_user
from ..ml_service import predict_methane

router = APIRouter(prefix="/predict", tags=["Prediction"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class PredictionRequest(BaseModel):
    cod: float
    flow: float
    c_n_ratio: float
    temp: float
    ph: float
    hrt: float
    time: float

@router.post("/")
def perform_prediction(req: PredictionRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        predicted_yield = predict_methane(
            cod=req.cod, 
            flow=req.flow, 
            c_n_ratio=req.c_n_ratio, 
            temp=req.temp, 
            ph=req.ph, 
            hrt=req.hrt, 
            time=req.time
        )
        
        # Log to Database
        log = PredictionLog(
            user_id=current_user.id,
            cod=req.cod, flow=req.flow, c_n_ratio=req.c_n_ratio,
            temperature=req.temp, ph=req.ph, hrt=req.hrt, time=req.time,
            predicted_methane=predicted_yield
        )
        db.add(log)
        db.commit()
        db.refresh(log)

        return {"methane_yield": predicted_yield, "log_id": log.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
def get_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "admin":
        # RBAC: Admin sees all logs
        logs = db.query(PredictionLog).order_by(PredictionLog.timestamp.desc()).all()
    else:
        # RBAC: User sees only own logs
        logs = db.query(PredictionLog).filter(PredictionLog.user_id == current_user.id).order_by(PredictionLog.timestamp.desc()).all()
    
    return logs
