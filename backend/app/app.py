# backend/app/app.py
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np
import os

from backend.utils.preprocessing import prepare_features


# --------------------------------------------------
# FastAPI initialization
# --------------------------------------------------
app = FastAPI(
    title="Cardiac AI API",
    description="AI service for predicting post-operative cardiac complications (Arrhythmia, HF, MI)",
    version="1.0.0"
)

# Allow frontend requests (React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# Load model and preprocessing components
# --------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "../models")

model = joblib.load(os.path.join(MODEL_DIR, "xgb_final_full_model.joblib"))
label_encoder = joblib.load(os.path.join(MODEL_DIR, "label_encoder.joblib"))
scaler_text = joblib.load(os.path.join(MODEL_DIR, "scaler_text.joblib"))
scaler_bio = joblib.load(os.path.join(MODEL_DIR, "scaler_biobert.joblib"))

# labs scaler (optional)
scaler_labs_path = os.path.join(MODEL_DIR, "scaler_labs.joblib")
scaler_labs = joblib.load(scaler_labs_path) if os.path.exists(scaler_labs_path) else None

classes = list(label_encoder.classes_)
print(f"✅ Model loaded with classes: {classes}")

# --------------------------------------------------
# Request Schema
# --------------------------------------------------
class PatientInput(BaseModel):
    labs: dict
    text_svd: list
    biobert_pca: list

# --------------------------------------------------
# API Endpoints
# --------------------------------------------------
@app.get("/")
def root():
    return {"status": "ok", "message": "Cardiac AI API is running 🚀"}

@app.post("/predict")
def predict(input_data: PatientInput):
    try:
        X = prepare_features(input_data, scaler_labs, scaler_text, scaler_bio)
        proba = model.predict_proba(X)[0]
        pred_idx = np.argmax(proba)
        prediction = classes[pred_idx]
        return {
            "prediction": prediction,
            "confidence": float(np.max(proba)),
            "class_probabilities": dict(zip(classes, [float(p) for p in proba]))
        }
    except Exception as e:
        return {"error": str(e)}
