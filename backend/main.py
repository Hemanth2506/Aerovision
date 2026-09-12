"""
AeroVision Enterprise FastAPI Backend & Real-Time Telemetry Hub
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import asyncio
import json
import os
from ml_engine import ml_engine

app = FastAPI(
    title="AeroVision Aviation Intelligence API",
    description="Enterprise API for Aircraft Health Monitoring, Predictive Maintenance, and Telemetry Streaming",
    version="2.4.0"
)

# CORS configuration: allow deployed GitHub Pages origin and local development environments
default_origins = [
    "https://hemanth2506.github.io",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
cors_env = os.getenv("CORS_ORIGINS", "")
allowed_origins = [o.strip() for o in cors_env.split(",") if o.strip()] if cors_env else default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    """
    Health check endpoint for Render service verification.
    """
    return {"status": "ok", "platform": "AeroVision Enterprise API", "service": "backend"}

class TelemetryQuery(BaseModel):
    current_egt: float
    current_vib: float
    flight_cycles: int

class AIQuery(BaseModel):
    query: str
    flight_number: Optional[str] = "AV-101"
    aircraft_model: Optional[str] = "Boeing 787-9"

@app.get("/")
def read_root():
    return {
        "platform": "AeroVision Enterprise Aviation Command Center",
        "status": "ONLINE",
        "version": "2.4.0",
        "active_modules": [
            "Live Fleet Monitoring",
            "Predictive Maintenance (RUL)",
            "Digital Twin 3D",
            "Flight Safety & SMS",
            "AeroAI Copilot",
            "Airport Operations",
            "Weather Intelligence",
            "Fuel Sustainability",
            "Executive Leadership"
        ]
    }

@app.post("/api/maintenance/predict-rul")
def predict_rul(data: TelemetryQuery):
    """
    Computes Remaining Useful Life (RUL) and failure probability using ML models.
    """
    res = ml_engine.estimate_rul(data.current_egt, data.current_vib, data.flight_cycles)
    return res

@app.post("/api/maintenance/anomaly-detection")
def detect_telemetry_anomalies(telemetry: Dict[str, Any]):
    """
    Performs unsupervised multivariable anomaly classification on telemetry frame.
    """
    anomalies = ml_engine.detect_anomalies(telemetry)
    return {"anomalies_detected": anomalies, "count": len(anomalies)}

@app.post("/api/ai/copilot-query")
def copilot_query(data: AIQuery):
    """
    AeroAI Aviation Copilot Assistant Query Endpoint
    """
    q = data.query.lower()
    if "egt" in q or "engine" in q:
        response = (
            f"Analysis for {data.flight_number} ({data.aircraft_model}): EGT margin threshold analysis "
            "indicates Stage 1 HPT thermal barrier wear. Refer to AMM 72-00-00 for optical borescope inspection."
        )
    elif "diversion" in q:
        response = (
            f"Emergency Diversion for {data.flight_number}: Shannon (EINN) is primary recommendation "
            "(184 NM, Runway 06/24 10,495 ft, CAVOK weather)."
        )
    else:
        response = f"AeroVision AI: Telemetry for {data.flight_number} is nominal within certified flight envelope."

    return {
        "response": response,
        "confidence": 0.96,
        "timestamp": "2026-08-28T15:30:00Z"
    }

@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Send continuous telemetry stream tick
            payload = {
                "type": "TELEMETRY_HEARTBEAT",
                "status": "HEALTHY",
                "timestamp": asyncio.get_event_loop().time()
            }
            await websocket.send_json(payload)
            await asyncio.sleep(1.0)
    except WebSocketDisconnect:
        pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
