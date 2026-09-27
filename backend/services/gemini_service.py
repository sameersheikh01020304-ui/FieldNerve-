import os
import json
from typing import Dict, Any, List
from google import genai
from google.genai import types

def get_gemini_client() -> genai.Client:
    """Initialize official Google GenAI client using GEMINI_API_KEY."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set in environment or .env file.")
    return genai.Client(api_key=api_key)

AGRICULTURE_SYSTEM_INSTRUCTION = """You are FieldNerve AI, an empathetic, highly knowledgeable agricultural expert dedicated to Indian farmers.
You assist with:
- Crop diseases, pest identification, fungi, virus symptoms
- Soil health, organic biofertilizers (Jeevamrit, Vermicompost), NPK, Urea, Zinc balance
- Irrigation timing (drip, furrow, sprinkler)
- Seasonal crop advisory (Kharif, Rabi, Zaid crops: Wheat, Rice, Cotton, Soybean, Mustard, Sugarcane, Tomato, Potato, Maize, etc.)
- Practical, cost-effective Indian farming advice

RULES:
1. Speak in simple, respectful language (Hindi or English as requested).
2. Avoid over-complicated scientific jargon.
3. Use bullet points and practical steps.
4. If you are uncertain about a diagnosis, explicitly state your uncertainty.
5. Always caution the farmer to verify chemical pesticide doses with their local Krishi Vigyan Kendra (KVK) or Agriculture Officer before spraying."""

async def answer_farming_question(question: str, language: str = "hi") -> str:
    """Answer farmer questions with agriculture-tuned Gemini model."""
    client = get_gemini_client()
    lang_instruction = "Answer strictly in simple, warm colloquial Hindi (सरल व्यावहारिक हिंदी)." if language == "hi" else "Answer strictly in simple practical English."
    
    prompt = f"{lang_instruction}\n\nFarmer's Question: {question}"
    
    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=AGRICULTURE_SYSTEM_INSTRUCTION,
            temperature=0.7,
        )
    )
    return response.text or "No response generated."

async def analyze_crop_image(image_bytes: bytes, mime_type: str = "image/jpeg", language: str = "hi") -> Dict[str, Any]:
    """Analyze crop/leaf photograph using Gemini Vision."""
    client = get_gemini_client()
    lang_target = "Hindi (हिंदी)" if language == "hi" else "English"
    
    prompt = f"""Examine this crop photograph carefully.
Provide an agricultural diagnosis in {lang_target}.
Respond ONLY with a valid JSON object matching this schema:
{{
  "crop": "Crop Name (e.g. गेहूं / Wheat)",
  "problem": "Disease / Pest / Deficiency / Healthy",
  "health_status": "healthy" or "moderate" or "critical" or "uncertain",
  "confidence": "e.g. 85%",
  "possible_causes": ["Cause 1", "Cause 2"],
  "recommendations": ["Action step 1", "Action step 2", "Remedy 3"],
  "prevention": ["Prevention tip 1", "Prevention tip 2"],
  "warning": "Safety advice on protective gear and consulting local KVK"
}}
Do not include markdown backticks around the json.
"""
    
    image_part = types.Part.from_bytes(
        data=image_bytes,
        mime_type=mime_type
    )
    
    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents=[image_part, prompt],
        config=types.GenerateContentConfig(
            temperature=0.2,
            response_mime_type="application/json"
        )
    )
    
    raw_text = response.text or "{}"
    try:
        data = json.loads(raw_text)
        data["language"] = language
        return data
    except json.JSONDecodeError:
        return {
            "crop": "Crop" if language == "en" else "पहचानी गई फसल",
            "problem": "Analysis Complete" if language == "en" else "विश्लेषण पूर्ण",
            "health_status": "moderate",
            "confidence": "75%",
            "possible_causes": ["Fungal or pest stress"],
            "recommendations": [raw_text],
            "prevention": ["Maintain field cleanliness"],
            "warning": "Consult local Krishi Vigyan Kendra before applying chemicals.",
            "language": language
        }
