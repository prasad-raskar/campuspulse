from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine, Base
from routers import auth, notices, dashboard
import os

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CampusPulse API",
    description="Smart College Notice System Backend",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for local development port changes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(notices.router)
app.include_router(dashboard.router)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def read_root():
    return {"message": "Welcome to CampusPulse API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
