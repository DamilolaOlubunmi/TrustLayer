from fastapi import FastAPI

from models import (
    EvaluateRequest,
    EvaluateResponse,
    FeedbackRequest
)

from pipeline import run_evaluation_pipeline


app = FastAPI(
    title="TrustLayer API"
)


@app.get("/")
def home():
    return {
        "message": "TrustLayer API running"
    }


@app.post(
    "/v1/evaluate",
    response_model=EvaluateResponse
)
def evaluate(payload: EvaluateRequest):

    result = run_evaluation_pipeline(payload)

    return result


@app.post("/v1/feedback")
def feedback(payload: FeedbackRequest):

    return {
        "status": "success",
        "transaction_id": payload.transaction_id
    }


@app.get("/v1/transactions")
def transactions():

    return {
        "transactions": []
    }