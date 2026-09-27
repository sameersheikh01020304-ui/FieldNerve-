import httpx
from typing import Dict, Any

CITY_COORDINATES: Dict[str, Dict[str, Any]] = {
    "nagpur": {"lat": 21.1458, "lon": 79.0882, "state": "Maharashtra", "name_hi": "नागपुर"},
    "delhi": {"lat": 28.6139, "lon": 77.2090, "state": "Delhi NCR", "name_hi": "दिल्ली"},
    "ludhiana": {"lat": 30.9010, "lon": 75.8573, "state": "Punjab", "name_hi": "लुधियाना"},
    "patna": {"lat": 25.5941, "lon": 85.1376, "state": "Bihar", "name_hi": "पटना"},
    "indore": {"lat": 22.7196, "lon": 75.8577, "state": "Madhya Pradesh", "name_hi": "इंदौर"},
    "jaipur": {"lat": 26.9124, "lon": 75.7873, "state": "Rajasthan", "name_hi": "जयपुर"},
    "lucknow": {"lat": 26.8467, "lon": 80.9462, "state": "Uttar Pradesh", "name_hi": "लखनऊ"},
    "bengaluru": {"lat": 12.9716, "lon": 77.5946, "state": "Karnataka", "name_hi": "बेंगलुरु"},
    "hyderabad": {"lat": 17.3850, "lon": 78.4867, "state": "Telangana", "name_hi": "हैदराबाद"},
    "pune": {"lat": 18.5204, "lon": 73.8567, "state": "Maharashtra", "name_hi": "पुणे"},
    "chandigarh": {"lat": 30.7333, "lon": 76.7794, "state": "Punjab", "name_hi": "चंडीगढ़"},
    "bhopal": {"lat": 23.2599, "lon": 77.4126, "state": "Madhya Pradesh", "name_hi": "भोपाल"},
}

async def get_weather_data(city: str = "nagpur", lat: float = None, lon: float = None, lang: str = "hi") -> dict:
    """Fetch live agricultural weather from Open-Meteo with farming advisory."""
    city_key = city.lower().strip()
    target_lat = 21.1458
    target_lon = 79.0882
    city_name = "Nagpur"
    state_name = "Maharashtra"

    if lat is not None and lon is not None:
        target_lat = lat
        target_lon = lon
        city_name = city if city else ("मेरा खेत" if lang == "hi" else "My Field")
        state_name = "GPS Location"
    elif city_key in CITY_COORDINATES:
        c_info = CITY_COORDINATES[city_key]
        target_lat = c_info["lat"]
        target_lon = c_info["lon"]
        city_name = c_info["name_hi"] if lang == "hi" else city.title()
        state_name = c_info["state"]
    else:
        # Geocode dynamically
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                geo_resp = await client.get(f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=en&format=json")
                if geo_resp.status_code == 200:
                    geo_json = geo_resp.json()
                    if geo_json.get("results"):
                        res = geo_json["results"][0]
                        target_lat = res["latitude"]
                        target_lon = res["longitude"]
                        city_name = res["name"]
                        state_name = res.get("admin1", "India")
        except Exception:
            pass

    weather_url = (
        f"https://api.open-meteo.com/v1/forecast?latitude={target_lat}&longitude={target_lon}"
        f"&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m"
        f"&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto"
    )

    async with httpx.AsyncClient(timeout=8.0) as client:
        resp = await client.get(weather_url)
        if resp.status_code != 200:
            raise RuntimeError(f"Weather API error: {resp.status_code}")
        data = resp.json()

    current = data.get("current", {})
    daily = data.get("daily", {})

    temp = round(current.get("temperature_2m", 27.0), 1)
    humidity = round(current.get("relative_humidity_2m", 60.0), 1)
    wind_speed = round(current.get("wind_speed_10m", 10.0), 1)
    rain_prob = daily.get("precipitation_probability_max", [20])[0]

    # Agricultural advisories
    if rain_prob >= 60:
        irrigation = "⚠️ आज सिंचाई रोकें: बारिश की संभावना अधिक है।" if lang == "hi" else "⚠️ Pause irrigation: High rain probability."
        spraying = "❌ कीटनाशक छिड़काव न करें: बारिश से दवा धुल जाएगी।" if lang == "hi" else "❌ Avoid spraying: Rain will wash away chemicals."
        harvest = "कटी फसल को तिरपाल से ढकें।" if lang == "hi" else "Cover harvested crops with tarps."
    elif temp > 35:
        irrigation = "💧 शाम के समय हल्की सिंचाई करें।" if lang == "hi" else "💧 Irrigate during evening to reduce evaporation."
        spraying = "सुबह या शाम ठंडे समय में ही छिड़काव करें।" if lang == "hi" else "Spray during early morning or late evening."
        harvest = "कटाई व सुखाने के लिए मौसम अनुकूल है।" if lang == "hi" else "Favorable dry weather for harvesting."
    else:
        irrigation = "✅ सामान्य सिंचाई कार्यक्रम जारी रखें।" if lang == "hi" else "✅ Maintain regular irrigation."
        spraying = "✅ मौसम अनुकूल है, छिड़काव किया जा सकता है।" if lang == "hi" else "✅ Safe conditions for pesticide spraying."
        harvest = "सामान्य कृषि कार्य जारी रखें।" if lang == "hi" else "Normal field operations can proceed."

    condition = "साफ धूप" if lang == "hi" else "Clear & Sunny"
    icon = "sun"
    w_code = current.get("weather_code", 0)
    if 51 <= w_code <= 67:
        condition = "बारिश / बूंदाबांदी" if lang == "hi" else "Rain / Drizzle"
        icon = "cloud-rain"
    elif w_code >= 80:
        condition = "तेज बारिश व गरज" if lang == "hi" else "Thunderstorm"
        icon = "cloud-lightning"
    elif 1 <= w_code <= 3:
        condition = "हल्के बादल" if lang == "hi" else "Partly Cloudy"
        icon = "cloud-sun"

    return {
        "success": True,
        "city": city_name,
        "state": state_name,
        "temperature": temp,
        "humidity": humidity,
        "rain_probability": rain_prob,
        "wind_speed": wind_speed,
        "condition": condition,
        "icon": icon,
        "agri_advisory": {
            "irrigation": irrigation,
            "spraying": spraying,
            "harvest": harvest
        }
    }
