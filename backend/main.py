from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import create_db_and_tables
from app.api.profile_routes import router as profile_router
from app.api.dashboard_routes import router as dashboard_router
from app.api.review_routes import api_router as review_api_router
from app.api.review_routes import browser_router as review_browser_router
from app.utils import load_models

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up...")

    create_db_and_tables()
    load_models()
    yield
    
    print("Shutting down...")


app = FastAPI(
    title="TrustLayer API",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# mount auth/profile routes
app.include_router(profile_router)
# mount dashboard/evaluation routes
app.include_router(dashboard_router)
# mount review routes
app.include_router(review_browser_router)
app.include_router(review_api_router)


@app.get("/")
def home():
    return {
        "message": "TrustLayer API running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }
