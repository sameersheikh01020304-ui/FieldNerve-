from pydantic import BaseModel, Field
from typing import List, Optional

class AskRequest(BaseModel):
    question: str = Field(..., example="My wheat leaves are turning yellow")
    language: str = Field(default="hi", example="hi")
    farmer_id: Optional[int] = None

class AskResponse(BaseModel):
    success: bool
    answer: str
    language: str
    id: Optional[int] = None

class ImageAnalysisResponse(BaseModel):
    success: bool
    crop: str
    problem: str
    health_status: str
    confidence: str
    possible_causes: List[str]
    recommendations: List[str]
    prevention: List[str]
    warning: str
    language: str
    image_url: Optional[str] = None

class VoiceRequest(BaseModel):
    transcript: str = Field(..., example="धान में कौन सी खाद डालें")
    language: str = Field(default="hi", example="hi")

class ExpertRequestModel(BaseModel):
    name: str = Field(..., example="Ramesh Kumar")
    phone: str = Field(..., example="9876543210")
    location: Optional[str] = Field(default="Local Village", example="Ludhiana, Punjab")
    crop_name: Optional[str] = Field(default="Wheat", example="Wheat")
    problem: str = Field(..., example="Severe white powdery fungus spreading rapidly")
    urgency: Optional[str] = Field(default="medium", example="high")

class ExpertResponseModel(BaseModel):
    success: bool
    message: str
    request_code: str
    helpline: str

class WeatherResponse(BaseModel):
    success: bool
    city: str
    state: str
    temperature: float
    humidity: float
    rain_probability: float
    wind_speed: float
    condition: str
    icon: str
    agri_advisory: dict
