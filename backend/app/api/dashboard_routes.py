from app.schema import EvaluateRequest, EvaluateResponse, FeedbackRequest
from app.pipeline import run_evaluation_pipeline
from app.models import Platform
from fastapi import APIRouter, Depends
from app.api.auth import get_current_user, get_api_key_platform

router = APIRouter(prefix="/api", tags=["dashboard"])

@router.post("/v1/evaluate", response_model=EvaluateResponse)
def evaluate(payload: EvaluateRequest, platform: Platform = Depends(get_api_key_platform)):
    """Evaluate transaction - requires API key authentication."""
    result = run_evaluation_pipeline(payload)
    return result


@router.post("/v1/feedback")
def feedback(payload: FeedbackRequest, platform: Platform = Depends(get_current_user)):
    """Submit feedback - requires JWT authentication."""
    return {
        "status": "success",
        "transaction_id": payload.transaction_id
    }


@router.get("/v1/transactions")
def transactions(platform: Platform = Depends(get_current_user)):
    """Get transactions - requires JWT authentication."""
    return {
        "transactions": []
    }

@router.post("/v1/evaluation/demo", response_model=EvaluateResponse)
def evaluation_demo(payload: EvaluateRequest):
    """Demo evaluation endpoint - no authentication required."""
    result = run_evaluation_pipeline(payload)
    return result