from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.database import create_db_and_tables
from app.api.profile_routes import router as profile_router
from app.api.dashboard_routes import router as dashboard_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up...")

    create_db_and_tables()
    yield
    
    print("Shutting down...")


app = FastAPI(
    title="TrustLayer API",
    lifespan=lifespan
)

# mount auth/profile routes
app.include_router(profile_router)
# mount dashboard/evaluation routes
app.include_router(dashboard_router)


@app.get("/")
def home():
    return {
        "message": "TrustLayer API running"
    }

app.get("/health")
def health():
    return {
        "status": "ok"
    }
