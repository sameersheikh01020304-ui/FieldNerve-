# FieldNerve - Smart India Hackathon (SIH 2026) Backend

AI-Powered Agriculture Assistance Platform for Indian Farmers using FastAPI, SQLite, and Google Gemini AI.

---

## 🚀 Quick Setup Instructions (Beginner Guide)

### 1. Prerequisites
- Install Python (Version 3.10, 3.11, or 3.12) from [python.org](https://www.python.org/downloads/).
- Check **"Add python.exe to PATH"** during Windows installation.

---

### 2. Open Terminal / Command Prompt
Navigate to the `backend` folder:
```bash
# Windows
cd backend
```

---

### 3. Create a Virtual Environment
```bash
# Windows
python -m venv venv

# Activate on Windows (Command Prompt):
venv\Scripts\activate

# Activate on Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# Activate on macOS / Linux:
source venv/bin/activate
```

---

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

---

### 5. Configure Your Gemini API Key
Create a `.env` file inside the `backend/` folder (or copy from `.env.example`):
```bash
# Windows (cmd)
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

Open `.env` and set your key:
```env
GEMINI_API_KEY=AIzaSy...YOUR_ACTUAL_KEY_HERE
PORT=8000
HOST=127.0.0.1
DATABASE_URL=sqlite:///./fieldnerve.db
```

---

### 6. Run the FastAPI Server
```bash
python main.py
```
Or with uvicorn directly:
```bash
uvicorn main:app --reload --port 8000
```

You will see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
🌾 SQLite database initialized successfully at fieldnerve.db
```

---

### 7. Test in Interactive Swagger Documentation
Open your browser and visit:
👉 **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**

You can test all endpoints directly:
1. `POST /api/ask`: Send `{"question": "मेरी धान में पत्ती लपेटक कीड़ा लगा है", "language": "hi"}`
2. `POST /api/analyze-image`: Upload any leaf or crop image file and click Execute.
3. `GET /api/weather`: Query `city=Nagpur` or `city=Patna` or `city=Ludhiana` with farming advisories.
4. `POST /api/expert-request`: Submit a farmer escalation.
5. `GET /api/history`: View past SQLite records.
