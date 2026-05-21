from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from datetime import datetime

from .users import get_current_user
from ..ml_service import predict_methane
from ..database import db

router = APIRouter(prefix="/predict", tags=["Prediction"])

class PredictionRequest(BaseModel):
    cod: float
    flow: float
    c_n_ratio: float
    temp: float
    ph: float
    hrt: float
    time: float

@router.post("/")
def perform_prediction(req: PredictionRequest, current_user: dict = Depends(get_current_user)):
    try:
        result_dict = predict_methane(
            cod=req.cod, 
            flow=req.flow, 
            c_n_ratio=req.c_n_ratio, 
            temp=req.temp, 
            ph=req.ph, 
            hrt=req.hrt, 
            time=req.time
        )
        
        predicted_yield = result_dict["prediction"]
        feature_importances = result_dict["feature_importances"]
        
        # Log to Database
        log = {
            "user_username": current_user["username"],
            "cod": req.cod,
            "flow": req.flow,
            "c_n_ratio": req.c_n_ratio,
            "temperature": req.temp,
            "ph": req.ph,
            "hrt": req.hrt,
            "time": req.time,
            "predicted_methane": predicted_yield,
            "timestamp": datetime.utcnow()
        }
        result = db.prediction_logs.insert_one(log)

        return {
            "methane_yield": predicted_yield, 
            "feature_importances": feature_importances,
            "log_id": str(result.inserted_id)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
def get_history(current_user: dict = Depends(get_current_user)):
    # Fetch all logs for the current user
    logs_cursor = db.prediction_logs.find({"user_username": current_user["username"]}).sort("timestamp", -1)
    
    logs = []
    for log in logs_cursor:
        log["_id"] = str(log["_id"])
        logs.append(log)
        
    return logs
