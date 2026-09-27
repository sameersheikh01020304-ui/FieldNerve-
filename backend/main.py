import os
import uuid
import json
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from database import init_db, get_db_connection
from models import (
    AskRequest,
    AskResponse,
    ImageAnalysisResponse,
    VoiceRequest,
    ExpertRequestModel,
    ExpertResponseModel,
    WeatherResponse,
)
from weather import get_weather_data
from services.gemini_service import answer_farming_question, analyze_crop_image

# Initialize FastAPI App
app = FastAPI(
    title="FieldNerve - Smart Agriculture AI API (SIH 2026)",
    description="Backend API powering crop diagnosis, agricultural AI Q&A, weather intelligence, and farmer support.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Uploads directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Startup event: Initialize SQLite database
@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def read_root():
    return {
        "project": "FieldNerve - Agriculture AI Assistance Platform",
        "event": "Smart India Hackathon 2026",
        "status": "Online",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "gemini_api_configured": bool(os.getenv("GEMINI_API_KEY")),
        "database": "SQLite (fieldnerve.db)"
    }

# 1. Ask Text Question
@app.post("/api/ask", response_model=AskResponse)
async def ask_question(payload: AskRequest):
    try:
        answer = await answer_farming_question(payload.question, payload.language)
        
        # Save to database
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO qa_history (farmer_id, question, answer, language, source) VALUES (?, ?, ?, ?, ?)",
            (payload.farmer_id, payload.question, answer, payload.language, "text")
        )
        qa_id = cur.lastrowid
        conn.commit()
        conn.close()

        return AskResponse(
            success=True,
            answer=answer,
            language=payload.language,
            id=qa_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing question: {str(e)}")

# 2. Analyze Crop Image
@app.post("/api/analyze-image")
async def analyze_image(
    file: UploadFile = File(...),
    language: str = Form(default="hi"),
    farmer_id: Optional[int] = Form(default=None)
):
    # Validate mime types
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, and WEBP images are supported.")

    # Read bytes and validate size (max 10MB)
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image size exceeds 10MB limit.")

    # Save image safely
    filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = UPLOAD_DIR / filename
    with open(file_path, "wb") as f:
        f.write(content)

    try:
        diagnosis = await analyze_crop_image(content, file.content_type, language)
        diagnosis["success"] = True
        diagnosis["image_url"] = f"/uploads/{filename}"

        # Persist in SQLite
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO image_analysis (
                farmer_id, image_filename, crop, problem, health_status,
                confidence, possible_causes, recommendations, prevention, warning, language
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            farmer_id,
            filename,
            diagnosis.get("crop", "Unknown"),
            diagnosis.get("problem", "Unknown"),
            diagnosis.get("health_status", "moderate"),
            diagnosis.get("confidence", "75%"),
            json.dumps(diagnosis.get("possible_causes", [])),
            json.dumps(diagnosis.get("recommendations", [])),
            json.dumps(diagnosis.get("prevention", [])),
            diagnosis.get("warning", ""),
            language
        ))
        conn.commit()
        conn.close()

        return diagnosis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Diagnosis error: {str(e)}")

# 3. Voice Processing
@app.post("/api/voice")
async def process_voice(payload: VoiceRequest):
    try:
        answer = await answer_farming_question(payload.transcript, payload.language)
        return {
            "success": True,
            "transcript": payload.transcript,
            "answer": answer,
            "language": payload.language
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice query error: {str(e)}")

# 4. Weather API
@app.get("/api/weather")
async def get_weather(
    city: str = Query(default="nagpur"),
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    lang: str = Query(default="hi")
):
    try:
        data = await get_weather_data(city=city, lat=lat, lon=lon, lang=lang)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Weather service error: {str(e)}")

# 5. Expert Escalation Request
@app.post("/api/expert-request", response_model=ExpertResponseModel)
def request_expert(req: ExpertRequestModel):
    try:
        request_code = f"FN-{uuid.uuid4().hex[:6].upper()}"
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO expert_requests (
                request_code, farmer_name, phone, location, crop_name, problem_description, urgency
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            request_code,
            req.name,
            req.phone,
            req.location,
            req.crop_name,
            req.problem,
            req.urgency
        ))
        conn.commit()
        conn.close()

        return ExpertResponseModel(
            success=True,
            message="Your request has been registered and routed to the nearest Krishi Vigyan Kendra (KVK).",
            request_code=request_code,
            helpline="1800-180-1551 (Kisan Call Center)"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Expert request error: {str(e)}")

# 6. Consultation History
@app.get("/api/history")
def get_history(limit: int = 20):
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("SELECT id, question, answer, language, created_at FROM qa_history ORDER BY id DESC LIMIT ?", (limit,))
    qa_rows = [dict(row) for row in cur.fetchall()]

    cur.execute("SELECT id, crop, problem, health_status, confidence, image_filename, created_at FROM image_analysis ORDER BY id DESC LIMIT ?", (limit,))
    img_rows = [dict(row) for row in cur.fetchall()]

    cur.execute("SELECT id, request_code, crop_name, problem_description, status, created_at FROM expert_requests ORDER BY id DESC LIMIT ?", (limit,))
    exp_rows = [dict(row) for row in cur.fetchall()]

    conn.close()

    return {
        "success": True,
        "questions": qa_rows,
        "diagnoses": img_rows,
        "expert_requests": exp_rows
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
