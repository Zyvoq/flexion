import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.feedback import router as feedback_router

app = FastAPI(title="Flexion API", version="0.1.0")

# Parse allowed origins from environment variable or fallback to dev defaults
raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
allowed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(feedback_router)


@app.get("/health")
async def health_check():
    return {"status": "ok"}
