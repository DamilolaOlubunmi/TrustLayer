from fastapi import Request, HTTPException

import joblib
from sqlmodel import Session, select

import json

from app.models import APIKey, TrainingResult

class Models:
    buyer_model  = None
    vendor_model = None


def fetch_platform_id(request: Request, db: Session) -> str:
    auth_header = request.headers.get("x-api-key", "")
    api_key = auth_header.replace("Bearer ", "").strip()

    # Look up the platform that owns this key
    api_key = db.exec(
        select(APIKey).where(APIKey.key == api_key)
    ).first()

    if not api_key:
        raise HTTPException(status_code=401, detail="Invalid API key")

    return api_key.platform_id

def load_models():
    try: 
        print("Loading ML models...")

        print("Loading buyer model...")
        Models.buyer_model = joblib.load("app/ml/ml_models/buyer_model_current.pkl")

        print("Loading vendor model...")
        Models.vendor_model = joblib.load("app/ml/ml_models/vendor_model_current.pkl")

        print("ML models loaded.")
    except Exception as e:
        print(f"Error loading models: {e}")
        raise e

def log_training_result(metrics: dict, model_type: str, db: Session, error_message: str | None = None):

    training_result = TrainingResult(
        model_type=model_type,
        accuracy=metrics.get("accuracy"),
        precision=metrics.get("precision"),
        recall=metrics.get("recall"),
        f1_score=metrics.get("f1_score"),
        roc_auc=metrics.get("roc_auc"),
        pr_auc=metrics.get("pr_auc"),
        confusion_matrix=metrics.get("confusion_matrix"),
        error_message=error_message,
        trained_time_seconds=metrics.get("training_time_seconds"),
        training_data_size=metrics.get("training_data_size"),
        training_status="success" if not error_message else "failed",
    )
    
    db.add(training_result)
    db.commit()