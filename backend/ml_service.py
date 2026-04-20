import pickle
import os
import pandas as pd

# Paths to the user's ML files in the parent directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "methane_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "scaler.pkl")

import joblib

# Load model and scaler initially
try:
    model = joblib.load(MODEL_PATH)
    print("Model Loaded Successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

try:
    scaler = joblib.load(SCALER_PATH)
    print("Scaler Loaded Successfully!")
except Exception as e:
    print(f"Error loading scaler: {e}")
    scaler = None

def predict_methane(cod: float, flow: float, c_n_ratio: float, temp: float, ph: float, hrt: float, time: float) -> float:
    if model is None or scaler is None:
        raise ValueError("Machine Learning model or scaler is not loaded. Ensure methane_model.pkl and scaler.pkl exist.")
        
    features = pd.DataFrame([{
        "COD": cod,
        "Flow_OLR": flow,
        "C_N_Ratio": c_n_ratio,
        "Temperature": temp,
        "pH": ph,
        "HRT": hrt,
        "Time": time
    }])
    
    features_scaled = scaler.transform(features)
    prediction = model.predict(features_scaled)
    
    return float(prediction[0])
