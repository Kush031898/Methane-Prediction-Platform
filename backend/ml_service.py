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

def predict_methane(cod: float, flow: float, c_n_ratio: float, temp: float, ph: float, hrt: float, time: float):
    if model is None or scaler is None:
        raise ValueError("Machine Learning model or scaler is not loaded. Ensure methane_model.pkl and scaler.pkl exist.")
        
    feature_names = ["COD", "Flow_OLR", "C_N_Ratio", "Temperature", "pH", "HRT", "Time"]
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
    
    importances_dict = {}
    if hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
        # Normalize to percentage
        importances_dict = {
            name: round(float(imp) * 100, 2)
            for name, imp in zip(feature_names, importances)
        }
    else:
        # Fallback if the model type doesn't support it
        importances_dict = {name: round(100.0 / len(feature_names), 2) for name in feature_names}
    
    return {
        "prediction": float(prediction[0]),
        "feature_importances": importances_dict
    }
