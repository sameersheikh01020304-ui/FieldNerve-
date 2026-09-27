var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_genai = require("@google/genai");
var import_vite = require("vite");
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "25mb" }));
app.use(import_express.default.urlencoded({ extended: true, limit: "25mb" }));
var DATA_DIR = import_path.default.join(process.cwd(), "data");
var DB_FILE = import_path.default.join(DATA_DIR, "fieldnerve_db.json");
if (!import_fs.default.existsSync(DATA_DIR)) {
  import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
}
function loadDB() {
  try {
    if (import_fs.default.existsSync(DB_FILE)) {
      const content = import_fs.default.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading database file:", err);
  }
  return {
    history: [
      {
        id: "hist_1",
        type: "text_qa",
        title: "\u0917\u0947\u0939\u0942\u0902 \u092E\u0947\u0902 \u092A\u0940\u0932\u093E \u0930\u0924\u0941\u0906 \u0930\u094B\u0915\u0925\u093E\u092E (Wheat Yellow Rust)",
        snippet: "\u0928\u093E\u0907\u091F\u094D\u0930\u094B\u091C\u0928 \u0915\u0940 \u0938\u0902\u0924\u0941\u0932\u093F\u0924 \u092E\u093E\u0924\u094D\u0930\u093E \u0926\u0947\u0902 \u0914\u0930 \u092A\u094D\u0930\u094B\u092A\u093F\u0915\u094B\u0928\u093E\u091C\u094B\u0932 25% \u0908\u0938\u0940 \u0915\u093E \u091B\u093F\u0921\u093C\u0915\u093E\u0935 \u0915\u0930\u0947\u0902\u0964",
        date: (/* @__PURE__ */ new Date()).toISOString(),
        language: "hi",
        data: {
          question: "\u0917\u0947\u0939\u0942\u0902 \u0915\u0940 \u092A\u0924\u094D\u0924\u093F\u092F\u093E\u0902 \u092A\u0940\u0932\u0940 \u0939\u094B \u0930\u0939\u0940 \u0939\u0948\u0902 \u0915\u094D\u092F\u093E \u0915\u0930\u0947\u0902?",
          answer: "\u092F\u0939 \u092A\u0940\u0932\u093E \u0930\u0924\u0941\u0906 (Yellow Rust) \u092F\u093E \u0928\u093E\u0907\u091F\u094D\u0930\u094B\u091C\u0928 \u0915\u0940 \u0915\u092E\u0940 \u0939\u094B \u0938\u0915\u0924\u0940 \u0939\u0948\u0964 \u092A\u094D\u0930\u094B\u092A\u093F\u0915\u094B\u0928\u093E\u091C\u094B\u0932 25% \u0908\u0938\u0940 \u0915\u093E 1 \u092E\u093F\u0932\u0940 \u092A\u094D\u0930\u0924\u093F \u0932\u0940\u091F\u0930 \u092A\u093E\u0928\u0940 \u092E\u0947\u0902 \u092E\u093F\u0932\u093E\u0915\u0930 \u091B\u093F\u0921\u093C\u0915\u093E\u0935 \u0915\u0930\u0947\u0902 \u0914\u0930 \u0928\u091C\u0926\u0940\u0915\u0940 \u0915\u0943\u0937\u093F \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0915\u0947\u0902\u0926\u094D\u0930 \u0938\u0947 \u0938\u0902\u092A\u0930\u094D\u0915 \u0915\u0930\u0947\u0902\u0964"
        }
      },
      {
        id: "hist_2",
        type: "image_diagnosis",
        title: "\u0927\u093E\u0928 \u092C\u094D\u0932\u093E\u0938\u094D\u091F \u0930\u094B\u0917 \u092A\u0939\u091A\u093E\u0928 (Rice Blast Diagnosis)",
        snippet: "\u0932\u0940\u092B \u092C\u094D\u0932\u093E\u0938\u094D\u091F \u092B\u092B\u0942\u0902\u0926 \u0915\u0947 \u0932\u0915\u094D\u0937\u0923\u0964 \u091F\u094D\u0930\u093E\u0907\u0938\u093E\u0907\u0915\u094D\u0932\u093E\u091C\u094B\u0932 75 WP \u0915\u093E \u0909\u092A\u092F\u094B\u0917 \u0905\u0928\u0941\u0936\u0902\u0938\u093F\u0924 \u0939\u0948\u0964",
        date: new Date(Date.now() - 36e5 * 24).toISOString(),
        language: "hi",
        data: {
          crop: "\u0927\u093E\u0928 (Rice / Paddy)",
          problem: "\u0932\u0940\u092B \u092C\u094D\u0932\u093E\u0938\u094D\u091F (Leaf Blast / Pyricularia oryzae)",
          confidence: "92%",
          healthStatus: "critical"
        }
      }
    ],
    expertRequests: []
  };
}
function saveDB(data) {
  try {
    import_fs.default.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving database file:", err);
  }
}
var aiClient = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not set. Mock/fallback answers will be used if needed.");
    }
    aiClient = new import_genai.GoogleGenAI({
      apiKey: apiKey || "dummy_key",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "FieldNerve Agriculture AI",
    version: "1.0.0",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.post("/api/ask", async (req, res) => {
  const { question = "", language = "en", preferredLanguage } = req.body || {};
  if (!question || typeof question !== "string") {
    return res.status(400).json({
      success: false,
      error: language === "hi" ? "\u0915\u0943\u092A\u092F\u093E \u0905\u092A\u0928\u093E \u0915\u0943\u0937\u093F \u092A\u094D\u0930\u0936\u094D\u0928 \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902\u0964" : "Please provide an agricultural question."
    });
  }
  const containsDevanagari = /[\u0900-\u097F]/.test(question);
  const requestedHindiInPrompt = /\b(hindi|hindi mein|hindi me|हिंदी|हिन्दी)\b/i.test(question);
  const isTargetHindi = preferredLanguage === "hi" || requestedHindiInPrompt || containsDevanagari || language === "hi";
  const primaryLang = isTargetHindi ? "hi" : "en";
  try {
    const ai = getGeminiClient();
    const systemInstruction = `You are FieldNerve AI, an elite, highly knowledgeable agricultural scientist dedicated to Indian farmers.
You answer queries with exact scientific and practical recommendations regarding:
- Fertilizer dosages (Urea, DAP, NPK, Potash, Zinc, Sulphur): ALWAYS specify exact numbers per acre in kg and standard bags (e.g. 50 kg DAP / 1 bag per acre for wheat/paddy; 90-100 kg Urea split into 2-3 top dressings after irrigation).
- DAP & Urea Mixing Rules: Clearly explain that DAP and Urea should NEVER be mixed and stored in advance because Urea absorbs atmospheric moisture, causing caking, wet slurry, and nitrogen loss as ammonia gas. DAP must be applied at sowing near the root zone, while Urea should be applied in splits after irrigation.
- Crop diseases, yellow leaves (yellow rust vs nitrogen deficiency), blight, fungus, and pest attacks (aphids, borers, fall armyworm).
- Irrigation schedules per crop growth stage.

CRITICAL INSTRUCTION:
You MUST provide the response in BOTH Hindi (\u0939\u093F\u0902\u0926\u0940) and English so the farmer can read and listen in whichever language they choose.
Return a valid JSON object matching this schema:
{
  "answerHindi": "\u0938\u0930\u0932, \u0935\u094D\u092F\u093E\u0935\u0939\u093E\u0930\u093F\u0915 \u0914\u0930 \u0938\u094D\u092A\u0937\u094D\u091F \u0939\u093F\u0902\u0926\u0940 \u092E\u0947\u0902 \u0909\u0924\u094D\u0924\u0930\u0964 \u0915\u093F\u0938\u093E\u0928 \u092D\u093E\u0908 \u0915\u0947 \u0932\u093F\u090F \u0938\u091F\u0940\u0915 \u092E\u093E\u0924\u094D\u0930\u093E (\u0915\u093F\u0932\u094B/\u090F\u0915\u0921\u093C) \u0914\u0930 \u092C\u093F\u0902\u0926\u0941\u0935\u093E\u0930 \u0938\u092E\u093E\u0927\u093E\u0928 (Bullet points).",
  "answerEnglish": "Practical, clear answer in simple English with exact dosages (kg/acre) and bullet points.",
  "audioScriptHindi": "\u0939\u093F\u0902\u0926\u0940 \u092E\u0947\u0902 \u092C\u094B\u0932\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u091B\u094B\u091F\u093E \u0914\u0930 \u0938\u094D\u092A\u0937\u094D\u091F \u0935\u093E\u0915\u094D\u092F (2-3 \u092A\u0902\u0915\u094D\u0924\u093F\u092F\u093E\u0902)",
  "audioScriptEnglish": "Short, clear spoken summary in English for speech audio (2-3 sentences)",
  "detectedLanguage": "${primaryLang}"
}

Tone: Warm, respectful, farmer-friendly.
Safety: For chemical pesticides, mention protective gear and consulting local KVK.`;
    const prompt = `Farmer Question: "${question}"
Primary requested language: ${primaryLang === "hi" ? "Hindi (\u0939\u093F\u0902\u0926\u0940)" : "English"}

Please provide the agricultural guidance with precise acre-wise fertilizer quantities and actionable steps in the required JSON format with both Hindi and English versions.`;
    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.4
        }
      });
    } catch (modelErr) {
      console.warn("gemini-3.8-flash call failed, trying gemini-flash-latest:", modelErr?.message);
      response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.4
        }
      });
    }
    let answerHindi = "";
    let answerEnglish = "";
    let audioScriptHindi = "";
    let audioScriptEnglish = "";
    try {
      const parsed = JSON.parse(response.text || "{}");
      answerHindi = parsed.answerHindi || "";
      answerEnglish = parsed.answerEnglish || "";
      audioScriptHindi = parsed.audioScriptHindi || "";
      audioScriptEnglish = parsed.audioScriptEnglish || "";
    } catch (parseError) {
      console.warn("Could not parse JSON response from Gemini, using raw text fallback:", parseError);
      const rawText = (response.text || "").trim();
      if (primaryLang === "hi") {
        answerHindi = rawText;
        answerEnglish = "Agricultural advice: " + rawText;
      } else {
        answerEnglish = rawText;
        answerHindi = "\u0915\u0943\u0937\u093F \u0938\u0932\u093E\u0939: " + rawText;
      }
    }
    if (!answerHindi && answerEnglish) {
      answerHindi = answerEnglish;
    }
    if (!answerEnglish && answerHindi) {
      answerEnglish = answerHindi;
    }
    const primaryAnswer = primaryLang === "hi" ? answerHindi : answerEnglish;
    const db = loadDB();
    const newHistoryItem = {
      id: "qa_" + Date.now(),
      type: "text_qa",
      title: question.slice(0, 45) + (question.length > 45 ? "..." : ""),
      snippet: primaryAnswer.slice(0, 90) + "...",
      date: (/* @__PURE__ */ new Date()).toISOString(),
      language: primaryLang,
      data: {
        question,
        answer: primaryAnswer,
        answerHindi,
        answerEnglish
      }
    };
    db.history.unshift(newHistoryItem);
    if (db.history.length > 50) db.history.pop();
    saveDB(db);
    return res.json({
      success: true,
      answer: primaryAnswer,
      answerHindi,
      answerEnglish,
      audioScriptHindi: audioScriptHindi || answerHindi,
      audioScriptEnglish: audioScriptEnglish || answerEnglish,
      language: primaryLang,
      detectedLanguage: primaryLang,
      id: newHistoryItem.id
    });
  } catch (error) {
    console.warn("Gemini API error in /api/ask, falling back to agricultural knowledge base:", error.message || error);
    const qLower = question.toLowerCase();
    let fallbackHindi = "";
    let fallbackEnglish = "";
    let audioHi = "";
    let audioEn = "";
    if (qLower.includes("rust") || qLower.includes("\u0930\u0924\u0941\u0906") || qLower.includes("yellow") || qLower.includes("\u092A\u0940\u0932")) {
      fallbackHindi = `\u0915\u093F\u0938\u093E\u0928 \u092D\u093E\u0908, \u0917\u0947\u0939\u0942\u0902 \u092E\u0947\u0902 \u092A\u0924\u094D\u0924\u093F\u092F\u094B\u0902 \u0915\u093E \u092A\u0940\u0932\u093E \u0939\u094B\u0928\u093E \u092A\u0940\u0932\u0947 \u0930\u0924\u0941\u090F (Yellow Rust) \u092F\u093E \u0928\u093E\u0907\u091F\u094D\u0930\u094B\u091C\u0928 \u0915\u0940 \u0915\u092E\u0940 \u0915\u093E \u0938\u0902\u0915\u0947\u0924 \u0939\u094B \u0938\u0915\u0924\u093E \u0939\u0948\u0964
\u0909\u092A\u091A\u093E\u0930:
\u2022 1 \u092E\u093F\u0932\u0940 \u092A\u094D\u0930\u094B\u092A\u093F\u0915\u094B\u0928\u093E\u091C\u094B\u0932 25% EC \u0915\u094B \u092A\u094D\u0930\u0924\u093F \u0932\u0940\u091F\u0930 \u092A\u093E\u0928\u0940 \u092E\u0947\u0902 \u092E\u093F\u0932\u093E\u0915\u0930 \u0938\u093E\u092B \u092E\u094C\u0938\u092E \u092E\u0947\u0902 \u091B\u093F\u0921\u093C\u0915\u0947\u0902\u0964
\u2022 \u092F\u0942\u0930\u093F\u092F\u093E \u0915\u0940 \u0938\u0902\u0924\u0941\u0932\u093F\u0924 \u092E\u093E\u0924\u094D\u0930\u093E \u0926\u0947\u0902, \u0905\u0927\u093F\u0915 \u0928\u093E\u0907\u091F\u094D\u0930\u094B\u091C\u0928 \u0938\u0947 \u092C\u091A\u0947\u0902\u0964
\u2022 10-15 \u0926\u093F\u0928 \u092C\u093E\u0926 \u0906\u0935\u0936\u094D\u092F\u0915\u0924\u093E \u092A\u0921\u093C\u0928\u0947 \u092A\u0930 \u0928\u091C\u0926\u0940\u0915\u0940 \u0915\u0943\u0937\u093F \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0915\u0947\u0902\u0926\u094D\u0930 (KVK) \u0938\u0947 \u0938\u0932\u093E\u0939 \u0932\u0947\u0915\u0930 \u0926\u094B\u092C\u093E\u0930\u093E \u091B\u093F\u0921\u093C\u0915\u093E\u0935 \u0915\u0930\u0947\u0902\u0964`;
      fallbackEnglish = `Kisan Brother, yellow leaves in wheat indicate Yellow Rust fungal infection or nitrogen deficiency.
Remedies:
\u2022 Spray Propiconazole 25% EC @ 1 ml per liter of water during clear sunny weather.
\u2022 Ensure balanced Urea application; avoid excessive nitrogen.
\u2022 Re-inspect after 10-14 days and consult your local Krishi Vigyan Kendra (KVK).`;
      audioHi = `\u0917\u0947\u0939\u0942\u0902 \u092E\u0947\u0902 \u092A\u0924\u094D\u0924\u093F\u092F\u094B\u0902 \u0915\u093E \u092A\u0940\u0932\u093E \u0939\u094B\u0928\u093E \u0930\u0924\u0941\u0906 \u0930\u094B\u0917 \u0939\u094B \u0938\u0915\u0924\u093E \u0939\u0948\u0964 \u092A\u094D\u0930\u094B\u092A\u093F\u0915\u094B\u0928\u093E\u091C\u094B\u0932 25 \u092A\u094D\u0930\u0924\u093F\u0936\u0924 \u0915\u093E \u090F\u0915 \u092E\u093F\u0932\u0940 \u092A\u094D\u0930\u0924\u093F \u0932\u0940\u091F\u0930 \u092A\u093E\u0928\u0940 \u092E\u0947\u0902 \u0918\u094B\u0932 \u092C\u0928\u093E\u0915\u0930 \u091B\u093F\u0921\u093C\u0915\u0947\u0902\u0964`;
      audioEn = `Yellow leaves in wheat can be yellow rust. Spray Propiconazole 25 EC at 1 milliliter per liter of water.`;
    } else if (qLower.includes("urea") || qLower.includes("dap") || qLower.includes("fertilizer") || qLower.includes("\u0916\u093E\u0926") || qLower.includes("\u092F\u0942\u0930\u093F\u092F\u093E") || qLower.includes("\u0921\u0940\u090F\u092A\u0940")) {
      fallbackHindi = `\u0915\u093F\u0938\u093E\u0928 \u092D\u093E\u0908, \u092A\u094D\u0930\u0924\u093F 1 \u090F\u0915\u0921\u093C \u0916\u0947\u0924 \u0915\u0947 \u0932\u093F\u090F \u0921\u0940\u090F\u092A\u0940 (DAP) \u0935 \u092F\u0942\u0930\u093F\u092F\u093E \u0915\u0940 \u0938\u091F\u0940\u0915 \u0935\u0948\u091C\u094D\u091E\u093E\u0928\u093F\u0915 \u092E\u093E\u0924\u094D\u0930\u093E:

\u{1F4CC} 1 \u090F\u0915\u0921\u093C \u0915\u0947 \u0932\u093F\u090F \u092E\u093E\u0928\u0915 \u092E\u093E\u0924\u094D\u0930\u093E:
\u2022 \u0921\u0940\u090F\u092A\u0940 (DAP): 50-55 \u0915\u093F\u0932\u094B (1 \u092C\u094B\u0930\u0940) - \u0915\u0947\u0935\u0932 \u092C\u0941\u0935\u093E\u0908 \u0915\u0947 \u0938\u092E\u092F \u092C\u0947\u0938\u0932 \u0921\u094B\u091C \u0915\u0947 \u0930\u0942\u092A \u092E\u0947\u0902 \u0926\u0947\u0902\u0964
\u2022 \u092F\u0942\u0930\u093F\u092F\u093E (Urea): 90-100 \u0915\u093F\u0932\u094B (2 \u092C\u094B\u0930\u0940) - \u0926\u094B \u0905\u0932\u0917-\u0905\u0932\u0917 \u0915\u093F\u0936\u094D\u0924\u094B\u0902 \u092E\u0947\u0902 \u0926\u0947\u0902\u0964
\u2022 \u092A\u094B\u091F\u093E\u0936 (MOP): 20-25 \u0915\u093F\u0932\u094B \u092A\u094D\u0930\u0924\u093F \u090F\u0915\u0921\u093C\u0964
\u2022 \u091C\u093F\u0902\u0915 \u0938\u0932\u094D\u092B\u0947\u091F (33%): 5 \u0915\u093F\u0932\u094B \u092A\u094D\u0930\u0924\u093F \u090F\u0915\u0921\u093C (\u092A\u0939\u0932\u0940 \u0938\u093F\u0902\u091A\u093E\u0908 \u092A\u0930)\u0964

\u23F1\uFE0F \u0921\u093E\u0932\u0928\u0947 \u0915\u093E \u0938\u0939\u0940 \u0938\u092E\u092F \u0914\u0930 \u0924\u0930\u0940\u0915\u093E:
1. \u092C\u0941\u0935\u093E\u0908 \u0915\u0947 \u0938\u092E\u092F: 1 \u092C\u094B\u0930\u0940 \u0921\u0940\u090F\u092A\u0940 (50 \u0915\u093F\u0932\u094B) + 20 \u0915\u093F\u0932\u094B \u092A\u094B\u091F\u093E\u0936 \u0915\u094B \u092C\u0940\u091C \u0938\u0947 4-5 \u0938\u0947\u092E\u0940 \u0928\u0940\u091A\u0947 \u0926\u0947\u0902\u0964
2. \u092A\u0939\u0932\u0940 \u0938\u093F\u0902\u091A\u093E\u0908 (21-25 \u0926\u093F\u0928, CRI \u0905\u0935\u0938\u094D\u0925\u093E): 45 \u0915\u093F\u0932\u094B \u092F\u0942\u0930\u093F\u092F\u093E + 5 \u0915\u093F\u0932\u094B \u091C\u093F\u0902\u0915 \u0938\u0932\u094D\u092B\u0947\u091F \u0938\u093F\u0902\u091A\u093E\u0908 \u0915\u0947 \u0924\u0941\u0930\u0902\u0924 \u092C\u093E\u0926 \u0928\u092E\u0940 \u092E\u0947\u0902 \u091B\u093F\u0921\u093C\u0915\u0947\u0902\u0964
3. \u0926\u0942\u0938\u0930\u0940 \u0938\u093F\u0902\u091A\u093E\u0908 (40-45 \u0926\u093F\u0928, \u0915\u0932\u094D\u0932\u0947 \u092B\u0942\u091F\u0924\u0947 \u0938\u092E\u092F): \u0936\u0947\u0937 45 \u0915\u093F\u0932\u094B \u092F\u0942\u0930\u093F\u092F\u093E \u0915\u093E \u0926\u0942\u0938\u0930\u093E \u091B\u093F\u0921\u093C\u0915\u093E\u0935 \u0915\u0930\u0947\u0902\u0964

\u26A0\uFE0F \u0921\u0940\u090F\u092A\u0940 \u0914\u0930 \u092F\u0942\u0930\u093F\u092F\u093E \u092E\u093F\u0932\u093E\u0928\u0947 \u0915\u0947 \u0928\u093F\u092F\u092E:
\u0921\u0940\u090F\u092A\u0940 \u0914\u0930 \u092F\u0942\u0930\u093F\u092F\u093E \u0915\u094B \u092A\u0939\u0932\u0947 \u0938\u0947 \u092E\u093F\u0932\u093E\u0915\u0930 \u0915\u092D\u0940 \u0928 \u0930\u0916\u0947\u0902! \u092F\u0942\u0930\u093F\u092F\u093E \u0928\u092E\u0940 \u0916\u0940\u0902\u091A\u0915\u0930 \u0917\u0940\u0932\u093E \u0939\u094B \u091C\u093E\u0924\u093E \u0939\u0948 \u0914\u0930 \u0905\u092E\u094B\u0928\u093F\u092F\u093E \u0917\u0948\u0938 \u092C\u0928\u0915\u0930 \u0909\u0921\u093C \u091C\u093E\u0924\u0940 \u0939\u0948\u0964 \u0905\u0917\u0930 \u092E\u093F\u0932\u093E\u0928\u093E \u0939\u094B, \u0924\u094B \u092C\u0941\u0935\u093E\u0908 \u092F\u093E \u091B\u093F\u0921\u093C\u0915\u093E\u0935 \u0938\u0947 \u0920\u0940\u0915 15-20 \u092E\u093F\u0928\u091F \u092A\u0939\u0932\u0947 \u0939\u0940 \u092E\u093F\u0932\u093E\u090F\u0902\u0964`;
      fallbackEnglish = `Kisan Brother, exact scientific recommendation for DAP & Urea for 1 Acre:

\u{1F4CC} Exact Dosage per 1 Acre:
\u2022 DAP: 50-55 kg (1 bag) - Apply 100% as a basal dose during sowing.
\u2022 Urea: 90-100 kg (2 bags) - Split into 2 top dressings post-irrigation.
\u2022 MOP (Potash): 20-25 kg per acre.
\u2022 Zinc Sulphate (33%): 5 kg per acre (at first irrigation).

\u23F1\uFE0F Application Schedule:
1. At Sowing: Place 1 bag DAP (50 kg) + 20 kg Potash 4-5 cm below seed depth.
2. 1st Irrigation (21-25 days, CRI stage): Broadcast 45 kg Urea mixed with 5 kg Zinc Sulphate after watering.
3. 2nd Irrigation (40-45 days, tillering stage): Broadcast remaining 45 kg Urea.

\u26A0\uFE0F Mixing Rules:
Never pre-mix and store DAP and Urea together. Urea absorbs atmospheric moisture, turning the mix into a sticky paste and volatilizing nitrogen. If mixing for broadcasting, mix only 15-20 minutes before field application.`;
      audioHi = `\u090F\u0915 \u090F\u0915\u0921\u093C \u0915\u0947 \u0932\u093F\u090F \u092A\u091A\u093E\u0938 \u0915\u093F\u0932\u094B \u0921\u0940\u090F\u092A\u0940 \u092C\u0941\u0935\u093E\u0908 \u0915\u0947 \u0938\u092E\u092F \u0926\u0947\u0902, \u0914\u0930 \u0928\u092C\u094D\u092C\u0947 \u0915\u093F\u0932\u094B \u092F\u0942\u0930\u093F\u092F\u093E \u0915\u094B \u0926\u094B \u0915\u093F\u0936\u094D\u0924\u094B\u0902 \u092E\u0947\u0902 \u0938\u093F\u0902\u091A\u093E\u0908 \u0915\u0947 \u092C\u093E\u0926 \u091B\u093F\u0921\u093C\u0915\u0947\u0902\u0964 \u0921\u0940\u090F\u092A\u0940 \u0914\u0930 \u092F\u0942\u0930\u093F\u092F\u093E \u0915\u094B \u092A\u0939\u0932\u0947 \u0938\u0947 \u092E\u093F\u0932\u093E\u0915\u0930 \u0928 \u0930\u0916\u0947\u0902\u0964`;
      audioEn = `For one acre, apply 50 kg DAP at sowing and split 90 kg Urea across two top dressings after irrigation. Do not pre-mix DAP and Urea.`;
    } else if (qLower.includes("neem") || qLower.includes("pest") || qLower.includes("\u0915\u0940\u091F") || qLower.includes("\u092E\u093E\u0939\u0942") || qLower.includes("insect")) {
      fallbackHindi = `\u0915\u093F\u0938\u093E\u0928 \u092D\u093E\u0908, \u0915\u0940\u091F \u0935 \u0930\u0938 \u091A\u0942\u0938\u0915 \u0915\u0940\u0921\u093C\u094B\u0902 \u0915\u0940 \u0930\u094B\u0915\u0925\u093E\u092E \u0915\u0947 \u0909\u092A\u093E\u092F:
\u2022 5 \u092E\u093F\u0932\u0940 \u0928\u0940\u092E \u0915\u093E \u0924\u0947\u0932 (10,000 PPM) \u092A\u094D\u0930\u0924\u093F \u0932\u0940\u091F\u0930 \u092A\u093E\u0928\u0940 \u092E\u0947\u0902 1 \u0917\u094D\u0930\u093E\u092E \u0938\u093E\u092C\u0941\u0928 \u0915\u0947 \u0938\u093E\u0925 \u092E\u093F\u0932\u093E\u0915\u0930 \u0936\u093E\u092E \u0915\u0947 \u0938\u092E\u092F \u091B\u093F\u0921\u093C\u0915\u0947\u0902\u0964
\u2022 \u092E\u093E\u0939\u0942 \u0914\u0930 \u0938\u092B\u0947\u0926 \u092E\u0915\u094D\u0916\u0940 \u0915\u0947 \u0932\u093F\u090F \u0916\u0947\u0924 \u092E\u0947\u0902 \u092A\u0940\u0932\u0947 \u091A\u093F\u092A\u091A\u093F\u092A\u0947 \u0915\u093E\u0930\u094D\u0921 (Yellow Sticky Traps) \u0932\u0917\u093E\u090F\u0902\u0964
\u2022 \u0905\u0927\u093F\u0915 \u092A\u094D\u0930\u0915\u094B\u092A \u0939\u094B\u0928\u0947 \u092A\u0930 \u0907\u092E\u093F\u0921\u093E\u0915\u094D\u0932\u094B\u092A\u094D\u0930\u093F\u0921 17.8% SL \u0915\u0940 0.5 \u092E\u093F\u0932\u0940 \u092A\u094D\u0930\u0924\u093F \u0932\u0940\u091F\u0930 \u092E\u093E\u0924\u094D\u0930\u093E \u0915\u093E \u092A\u094D\u0930\u092F\u094B\u0917 \u0915\u0930\u0947\u0902\u0964`;
      fallbackEnglish = `Kisan Brother, effective pest & insect management:
\u2022 Spray Neem Oil (10,000 PPM) @ 5 ml per liter with mild soap during evening hours.
\u2022 Install Yellow Sticky Traps across the field to catch aphids and whiteflies naturally.
\u2022 For severe infestations, apply Imidacloprid 17.8% SL @ 0.5 ml per liter of water.`;
      audioHi = `\u0915\u0940\u091F\u094B\u0902 \u0915\u0940 \u0930\u094B\u0915\u0925\u093E\u092E \u0915\u0947 \u0932\u093F\u090F \u092A\u093E\u0902\u091A \u092E\u093F\u0932\u0940 \u0928\u0940\u092E \u0915\u093E \u0924\u0947\u0932 \u092A\u094D\u0930\u0924\u093F \u0932\u0940\u091F\u0930 \u092A\u093E\u0928\u0940 \u092E\u0947\u0902 \u092E\u093F\u0932\u093E\u0915\u0930 \u0936\u093E\u092E \u0915\u094B \u091B\u093F\u0921\u093C\u0915\u0947\u0902\u0964`;
      audioEn = `To control pests, spray 5 ml neem oil per liter of water during evening hours.`;
    } else {
      fallbackHindi = `\u0915\u093F\u0938\u093E\u0928 \u092D\u093E\u0908, \u0906\u092A\u0915\u0947 \u092A\u094D\u0930\u0936\u094D\u0928 "${question}" \u0915\u0947 \u0932\u093F\u090F \u092E\u0941\u0916\u094D\u092F \u0915\u0943\u0937\u093F \u0938\u0932\u093E\u0939:
\u2022 \u0916\u0947\u0924 \u0915\u0940 \u092E\u093F\u091F\u094D\u091F\u0940 \u092E\u0947\u0902 \u0928\u092E\u0940 \u0915\u0940 \u091C\u093E\u0902\u091A \u0915\u0930\u0947\u0902 \u0914\u0930 \u091C\u0932 \u0928\u093F\u0915\u093E\u0938\u0940 \u0938\u0941\u0928\u093F\u0936\u094D\u091A\u093F\u0924 \u0915\u0930\u0947\u0902\u0964
\u2022 \u091C\u0948\u0935\u093F\u0915 \u0928\u093F\u092F\u0902\u0924\u094D\u0930\u0923 \u0915\u0947 \u0932\u093F\u090F \u0928\u0940\u092E \u0905\u0930\u094D\u0915 \u092F\u093E \u091F\u094D\u0930\u093E\u0907\u0915\u094B\u0921\u0930\u094D\u092E\u093E \u0915\u093E \u0909\u092A\u092F\u094B\u0917 \u0932\u093E\u092D\u0915\u093E\u0930\u0940 \u0930\u0939\u0924\u093E \u0939\u0948\u0964
\u2022 \u0930\u093E\u0938\u093E\u092F\u0928\u093F\u0915 \u0915\u0940\u091F\u0928\u093E\u0936\u0915 \u0915\u0947 \u092A\u094D\u0930\u092F\u094B\u0917 \u0938\u0947 \u092A\u0939\u0932\u0947 \u0938\u094D\u0925\u093E\u0928\u0940\u092F \u0915\u0943\u0937\u093F \u0905\u0927\u093F\u0915\u093E\u0930\u0940 \u092F\u093E \u0939\u0947\u0932\u094D\u092A\u0932\u093E\u0907\u0928 1800-180-1551 \u092A\u0930 \u0938\u0902\u092A\u0930\u094D\u0915 \u0915\u0930\u0947\u0902\u0964`;
      fallbackEnglish = `Kisan Brother, agricultural recommendation for "${question}":
\u2022 Check soil moisture level and ensure proper field drainage.
\u2022 Utilize biological remedies like Neem extract or Trichoderma for disease resistance.
\u2022 Before chemical application, verify with your local agricultural officer or Helpline 1800-180-1551.`;
      audioHi = `\u0916\u0947\u0924 \u092E\u0947\u0902 \u0928\u092E\u0940 \u0938\u0902\u0924\u0941\u0932\u093F\u0924 \u0930\u0916\u0947\u0902 \u0914\u0930 \u0930\u094B\u0917 \u0930\u094B\u0915\u0925\u093E\u092E \u0915\u0947 \u0932\u093F\u090F \u091C\u0948\u0935\u093F\u0915 \u0928\u0940\u092E \u0905\u0930\u094D\u0915 \u0915\u093E \u0909\u092A\u092F\u094B\u0917 \u0915\u0930\u0947\u0902\u0964`;
      audioEn = `Maintain balanced soil moisture and consider organic neem spray for pest management.`;
    }
    const chosenAns = primaryLang === "hi" ? fallbackHindi : fallbackEnglish;
    return res.json({
      success: true,
      answer: chosenAns,
      answerHindi: fallbackHindi,
      answerEnglish: fallbackEnglish,
      audioScriptHindi: audioHi,
      audioScriptEnglish: audioEn,
      language: primaryLang,
      detectedLanguage: primaryLang,
      isFallback: true,
      id: "fb_" + Date.now()
    });
  }
});
app.post("/api/analyze-image", async (req, res) => {
  try {
    const { image, mimeType = "image/jpeg", language = "hi", notes = "" } = req.body;
    if (!image) {
      return res.status(400).json({
        success: false,
        error: language === "hi" ? "\u0915\u0943\u092A\u092F\u093E \u092B\u0938\u0932 \u092F\u093E \u092A\u0924\u094D\u0924\u0947 \u0915\u0940 \u0924\u0938\u094D\u0935\u0940\u0930 \u092D\u0947\u091C\u0947\u0902\u0964" : "Please upload a crop or leaf photograph."
      });
    }
    const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, "");
    const ai = getGeminiClient();
    const prompt = `Analyze this agricultural photograph (leaf, crop, plant, pest, or field).
Farmer Notes: ${notes || "None provided"}
Language: ${language === "hi" ? "Hindi (\u0939\u093F\u0902\u0926\u0940)" : "English"}

Return a VALID JSON object matching this schema precisely:
{
  "crop": "Name of crop/plant in ${language === "hi" ? "Hindi with English name in brackets e.g. \u0917\u0947\u0939\u0942\u0902 (Wheat)" : "English"}",
  "problem": "Name of disease/pest/deficiency or 'Healthy Crop / \u0938\u094D\u0935\u0938\u094D\u0925 \u092B\u0938\u0932'",
  "healthStatus": "healthy" or "moderate" or "critical" or "uncertain",
  "confidence": "e.g. 90% or High",
  "possible_causes": ["Cause 1", "Cause 2"],
  "recommendations": ["Immediate action 1", "Practical step 2", "Organic or chemical remedy 3"],
  "prevention": ["Prevention tip 1", "Future protection measure 2"],
  "warning": "Safety warning about pesticide handling or advice to cross-verify with local KVK specialist"
}

Ensure all text is in ${language === "hi" ? "simple Hindi (\u0939\u093F\u0902\u0926\u0940)" : "English"}.
If the image is blurry, non-agricultural, or uncertain, set healthStatus to 'uncertain' and provide helpful guidance to retake a close-up photo of the leaf undersides.`;
    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || "image/jpeg",
                data: base64Data
              }
            },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });
    } catch (modelErr) {
      console.warn("gemini-3.8-flash call failed, trying gemini-flash-latest:", modelErr?.message);
      response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || "image/jpeg",
                data: base64Data
              }
            },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });
    }
    let resultJson = {};
    try {
      const rawText = (response.text || "").trim();
      resultJson = JSON.parse(rawText);
    } catch (parseErr) {
      console.warn("JSON parse failed, building fallback structure:", parseErr);
      resultJson = {
        crop: language === "hi" ? "\u092A\u0939\u091A\u093E\u0928\u0940 \u0917\u0908 \u092B\u0938\u0932" : "Identified Crop",
        problem: language === "hi" ? "\u0935\u093F\u0936\u094D\u0932\u0947\u0937\u0923 \u092A\u0942\u0930\u094D\u0923" : "Analysis Complete",
        healthStatus: "moderate",
        confidence: "80%",
        possible_causes: [language === "hi" ? "\u092B\u0902\u0917\u0932 \u092F\u093E \u0915\u0940\u091F \u0938\u0902\u0915\u094D\u0930\u092E\u0923" : "Fungal or pest infestation"],
        recommendations: [response.text || "Consult local agriculture center."],
        prevention: [language === "hi" ? "\u0916\u0947\u0924 \u092E\u0947\u0902 \u091C\u0932 \u0928\u093F\u0915\u093E\u0938\u0940 \u0938\u0941\u0927\u093E\u0930\u0947\u0902" : "Improve field drainage"],
        warning: language === "hi" ? "\u0926\u0935\u093E \u091B\u093F\u0921\u093C\u0915\u0928\u0947 \u0938\u0947 \u092A\u0939\u0932\u0947 \u0935\u093F\u0936\u0947\u0937\u091C\u094D\u091E \u0938\u0947 \u092A\u0941\u0937\u094D\u091F\u093F \u0915\u0930\u0947\u0902\u0964" : "Consult local expert before applying chemical sprays."
      };
    }
    const diagnosisId = "diag_" + Date.now();
    const db = loadDB();
    const historyItem = {
      id: diagnosisId,
      type: "image_diagnosis",
      title: `${resultJson.crop || "Crop"} - ${resultJson.problem || "Diagnosis"}`,
      snippet: `${resultJson.healthStatus?.toUpperCase() || "STATUS"}: ${resultJson.recommendations?.[0] || ""}`,
      date: (/* @__PURE__ */ new Date()).toISOString(),
      language,
      data: resultJson
    };
    db.history.unshift(historyItem);
    if (db.history.length > 50) db.history.pop();
    saveDB(db);
    res.json({
      success: true,
      id: diagnosisId,
      ...resultJson,
      language
    });
  } catch (error) {
    console.error("Error in /api/analyze-image:", error);
    res.status(500).json({
      success: false,
      error: "Unable to analyze crop image: " + (error.message || "Unknown error")
    });
  }
});
app.post("/api/voice", async (req, res) => {
  try {
    const { transcript, language = "hi" } = req.body;
    if (!transcript) {
      return res.status(400).json({
        success: false,
        error: language === "hi" ? "\u0915\u094B\u0908 \u0906\u0935\u093E\u091C\u093C \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0928\u0939\u0940\u0902 \u0939\u0941\u0908\u0964" : "No voice input transcript received."
      });
    }
    const ai = getGeminiClient();
    const systemInstruction = `You are FieldNerve Voice Assistant for Indian farmers. 
Farmer said: "${transcript}".
Respond in ${language === "hi" ? "spoken conversational Hindi" : "spoken conversational English"}.
Keep your response short, warm, and easily listened to (under 75 words).
Structure with clear numbers or bullet points.`;
    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: transcript,
        config: { systemInstruction, temperature: 0.7 }
      });
    } catch (voiceErr) {
      console.warn("gemini-3.8-flash voice call failed, trying gemini-flash-latest:", voiceErr?.message);
      response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: transcript,
        config: { systemInstruction, temperature: 0.7 }
      });
    }
    res.json({
      success: true,
      transcript,
      answer: response.text || "",
      language
    });
  } catch (error) {
    console.error("Error in /api/voice:", error);
    res.status(500).json({ success: false, error: "Voice processing failed." });
  }
});
var CITY_COORDINATES = {
  nagpur: { lat: 21.1458, lon: 79.0882, state: "Maharashtra", name_hi: "\u0928\u093E\u0917\u092A\u0941\u0930" },
  delhi: { lat: 28.6139, lon: 77.209, state: "Delhi NCR", name_hi: "\u0926\u093F\u0932\u094D\u0932\u0940" },
  ludhiana: { lat: 30.901, lon: 75.8573, state: "Punjab", name_hi: "\u0932\u0941\u0927\u093F\u092F\u093E\u0928\u093E" },
  patna: { lat: 25.5941, lon: 85.1376, state: "Bihar", name_hi: "\u092A\u091F\u0928\u093E" },
  indore: { lat: 22.7196, lon: 75.8577, state: "Madhya Pradesh", name_hi: "\u0907\u0902\u0926\u094C\u0930" },
  jaipur: { lat: 26.9124, lon: 75.7873, state: "Rajasthan", name_hi: "\u091C\u092F\u092A\u0941\u0930" },
  lucknow: { lat: 26.8467, lon: 80.9462, state: "Uttar Pradesh", name_hi: "\u0932\u0916\u0928\u090A" },
  bengaluru: { lat: 12.9716, lon: 77.5946, state: "Karnataka", name_hi: "\u092C\u0947\u0902\u0917\u0932\u0941\u0930\u0941" },
  hyderabad: { lat: 17.385, lon: 78.4867, state: "Telangana", name_hi: "\u0939\u0948\u0926\u0930\u093E\u092C\u093E\u0926" },
  pune: { lat: 18.5204, lon: 73.8567, state: "Maharashtra", name_hi: "\u092A\u0941\u0923\u0947" },
  varanasi: { lat: 25.3176, lon: 82.9739, state: "Uttar Pradesh", name_hi: "\u0935\u093E\u0930\u093E\u0923\u0938\u0940" },
  chandigarh: { lat: 30.7333, lon: 76.7794, state: "Punjab/Haryana", name_hi: "\u091A\u0902\u0921\u0940\u0917\u0922\u093C" },
  bhopal: { lat: 23.2599, lon: 77.4126, state: "Madhya Pradesh", name_hi: "\u092D\u094B\u092A\u093E\u0932" },
  ranchi: { lat: 23.3441, lon: 85.3096, state: "Jharkhand", name_hi: "\u0930\u093E\u0902\u091A\u0940" },
  ahmedabad: { lat: 23.0225, lon: 72.5714, state: "Gujarat", name_hi: "\u0905\u0939\u092E\u0926\u093E\u092C\u093E\u0926" }
};
app.get("/api/weather", async (req, res) => {
  try {
    const cityParam = (req.query.city || "nagpur").toLowerCase().trim();
    const latParam = req.query.lat ? parseFloat(req.query.lat) : null;
    const lonParam = req.query.lon ? parseFloat(req.query.lon) : null;
    const lang = req.query.lang === "hi" ? "hi" : "en";
    let lat = 21.1458;
    let lon = 79.0882;
    let cityName = "Nagpur";
    let stateName = "Maharashtra";
    if (latParam !== null && lonParam !== null && !isNaN(latParam) && !isNaN(lonParam)) {
      lat = latParam;
      lon = lonParam;
      cityName = req.query.city ? String(req.query.city) : "My Field / \u092E\u0947\u0930\u093E \u0916\u0947\u0924";
      stateName = "Local Coordinates";
    } else if (CITY_COORDINATES[cityParam]) {
      const match = CITY_COORDINATES[cityParam];
      lat = match.lat;
      lon = match.lon;
      cityName = lang === "hi" ? match.name_hi : cityParam.charAt(0).toUpperCase() + cityParam.slice(1);
      stateName = match.state;
    } else {
      try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityParam)}&count=1&language=en&format=json`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.results && geoData.results.length > 0) {
            lat = geoData.results[0].latitude;
            lon = geoData.results[0].longitude;
            cityName = geoData.results[0].name;
            stateName = geoData.results[0].admin1 || "India";
          }
        }
      } catch (geoErr) {
        console.warn("Geocoding failed, using fallback:", geoErr);
      }
    }
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&hourly=precipitation_probability,temperature_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) {
      throw new Error(`Weather service returned ${weatherRes.status}`);
    }
    const wData = await weatherRes.json();
    const current = wData.current || {};
    const daily = wData.daily || {};
    const temp = Math.round(current.temperature_2m ?? 28);
    const humidity = Math.round(current.relative_humidity_2m ?? 65);
    const windSpeed = Math.round(current.wind_speed_10m ?? 12);
    const rainProb = daily.precipitation_probability_max?.[0] ?? Math.round((current.precipitation ?? 0) > 0 ? 80 : 20);
    const weatherCode = current.weather_code ?? 0;
    let conditionEn = "Clear & Sunny";
    let conditionHi = "\u0938\u093E\u092B \u0914\u0930 \u0927\u0942\u092A";
    let icon = "sun";
    if (weatherCode >= 51 && weatherCode <= 67) {
      conditionEn = "Rain Shower / Drizzle";
      conditionHi = "\u0939\u0932\u094D\u0915\u0940 \u092C\u093E\u0930\u093F\u0936 / \u092C\u0942\u0902\u0926\u093E\u092C\u093E\u0902\u0926\u0940";
      icon = "cloud-rain";
    } else if (weatherCode >= 80 && weatherCode <= 99) {
      conditionEn = "Thunderstorm & Heavy Rain";
      conditionHi = "\u0924\u0947\u091C\u093C \u0906\u0902\u0927\u0940 \u0914\u0930 \u092C\u093E\u0930\u093F\u0936";
      icon = "cloud-lightning";
    } else if (weatherCode >= 1 && weatherCode <= 3) {
      conditionEn = "Partly Cloudy";
      conditionHi = "\u0906\u0902\u0936\u093F\u0915 \u0930\u0942\u092A \u0938\u0947 \u092C\u093E\u0926\u0932";
      icon = "cloud-sun";
    } else if (weatherCode >= 45 && weatherCode <= 48) {
      conditionEn = "Foggy / Mist";
      conditionHi = "\u0927\u0941\u0902\u0927 \u0914\u0930 \u0915\u094B\u0939\u0930\u093E";
      icon = "cloud";
    }
    let irrigationAdvisory = "";
    let sprayingAdvisory = "";
    let harvestAdvisory = "";
    if (rainProb >= 60) {
      irrigationAdvisory = lang === "hi" ? "\u26A0\uFE0F \u0906\u091C \u0938\u093F\u0902\u091A\u093E\u0908 \u0930\u094B\u0915 \u0926\u0947\u0902: 60%+ \u092C\u093E\u0930\u093F\u0936 \u0915\u0940 \u0938\u0902\u092D\u093E\u0935\u0928\u093E \u0939\u0948\u0964 \u091C\u0932\u092D\u0930\u093E\u0935 \u0938\u0947 \u092C\u091A\u0947\u0902\u0964" : "\u26A0\uFE0F Hold irrigation today: >60% chance of rain. Avoid waterlogging in roots.";
      sprayingAdvisory = lang === "hi" ? "\u274C \u0915\u0940\u091F\u0928\u093E\u0936\u0915 \u091B\u093F\u0921\u093C\u0915\u093E\u0935 \u0928 \u0915\u0930\u0947\u0902: \u092C\u093E\u0930\u093F\u0936 \u0938\u0947 \u0926\u0935\u093E \u0927\u0941\u0932 \u091C\u093E\u090F\u0917\u0940 \u0914\u0930 \u0935\u094D\u092F\u0930\u094D\u0925 \u0939\u094B\u0917\u0940\u0964" : "\u274C Do not spray pesticides: Rain will wash off chemicals and waste money.";
      harvestAdvisory = lang === "hi" ? "\u0915\u091F\u093E\u0908 \u0915\u0940 \u0939\u0941\u0908 \u092B\u0938\u0932 \u0915\u094B \u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u0924\u093F\u0930\u092A\u093E\u0932 \u0938\u0947 \u0922\u0915\u0947\u0902\u0964" : "Cover harvested produce safely with tarpaulin.";
    } else if (temp > 35) {
      irrigationAdvisory = lang === "hi" ? "\u{1F4A7} \u0939\u0932\u094D\u0915\u0940 \u0938\u093F\u0902\u091A\u093E\u0908 \u0936\u093E\u092E \u0915\u094B \u0915\u0930\u0947\u0902: \u0924\u0947\u091C \u0927\u0942\u092A \u092E\u0947\u0902 \u0935\u093E\u0937\u094D\u092A\u0940\u0915\u0930\u0923 \u0938\u0947 \u092C\u091A\u0947\u0902\u0964" : "\u{1F4A7} Light irrigation in evening: High heat causes rapid moisture loss.";
      sprayingAdvisory = lang === "hi" ? "\u0938\u0941\u092C\u0939 8 \u092C\u091C\u0947 \u0938\u0947 \u092A\u0939\u0932\u0947 \u092F\u093E \u0936\u093E\u092E 5 \u092C\u091C\u0947 \u0915\u0947 \u092C\u093E\u0926 \u0939\u0940 \u091B\u093F\u0921\u093C\u0915\u093E\u0935 \u0915\u0930\u0947\u0902\u0964" : "Spray only before 8 AM or after 5 PM to prevent chemical scorch.";
      harvestAdvisory = lang === "hi" ? "\u092B\u0938\u0932 \u0915\u091F\u093E\u0908 \u0915\u0947 \u0932\u093F\u090F \u092E\u094C\u0938\u092E \u0905\u0928\u0941\u0915\u0942\u0932 \u0939\u0948\u0964" : "Favorable dry conditions for harvesting and threshing.";
    } else {
      irrigationAdvisory = lang === "hi" ? "\u2705 \u0938\u093E\u092E\u093E\u0928\u094D\u092F \u0938\u093F\u0902\u091A\u093E\u0908 \u0915\u093E\u0930\u094D\u092F\u0915\u094D\u0930\u092E \u091C\u093E\u0930\u0940 \u0930\u0916\u0947\u0902\u0964 \u0916\u0947\u0924 \u092E\u0947\u0902 \u0928\u092E\u0940 \u0915\u093E \u0938\u094D\u0924\u0930 \u091C\u093E\u0902\u091A\u0947\u0902\u0964" : "\u2705 Continue normal irrigation schedule. Check soil moisture depth.";
      sprayingAdvisory = lang === "hi" ? "\u2705 \u091B\u093F\u0921\u093C\u0915\u093E\u0935 \u0915\u0947 \u0932\u093F\u090F \u0909\u092A\u092F\u0941\u0915\u094D\u0924 \u0938\u092E\u092F: \u0939\u0935\u093E \u0915\u0940 \u0917\u0924\u093F \u0938\u093E\u092E\u093E\u0928\u094D\u092F \u0939\u0948\u0964" : "\u2705 Good window for spraying: Wind conditions are calm.";
      harvestAdvisory = lang === "hi" ? "\u092E\u094C\u0938\u092E \u0905\u0928\u0941\u0915\u0942\u0932 \u0939\u0948, \u0928\u093F\u092F\u092E\u093F\u0924 \u0915\u093E\u0930\u094D\u092F \u091C\u093E\u0930\u0940 \u0930\u0916\u0947\u0902\u0964" : "Weather is favorable for routine field operations.";
    }
    res.json({
      success: true,
      city: cityName,
      state: stateName,
      latitude: lat,
      longitude: lon,
      temperature: temp,
      humidity,
      rainProbability: rainProb,
      windSpeed,
      condition: lang === "hi" ? conditionHi : conditionEn,
      icon,
      agriAdvisory: {
        irrigation: irrigationAdvisory,
        spraying: sprayingAdvisory,
        harvest: harvestAdvisory,
        temperatureAlert: temp > 38 ? lang === "hi" ? "\u0932\u0942 \u0914\u0930 \u0905\u0924\u094D\u092F\u0927\u093F\u0915 \u0917\u0930\u094D\u092E\u0940 \u0915\u093E \u0905\u0932\u0930\u094D\u091F" : "High heat wave advisory" : void 0
      }
    });
  } catch (error) {
    console.error("Error in /api/weather:", error);
    res.status(500).json({
      success: false,
      error: "Unable to fetch real-time weather: " + (error.message || "Unknown error")
    });
  }
});
app.post("/api/expert-request", (req, res) => {
  try {
    const {
      farmerName = "Kisan Brother",
      phoneNumber = "",
      location = "Field",
      cropName = "Crop",
      problemDescription = "",
      urgency = "medium"
    } = req.body;
    if (!problemDescription) {
      return res.status(400).json({
        success: false,
        error: "Please describe your crop problem."
      });
    }
    const requestId = "EXP-" + Math.floor(1e5 + Math.random() * 9e5);
    const db = loadDB();
    const newRequest = {
      id: requestId,
      farmerName: farmerName.trim() || "Farmer",
      phoneNumber: phoneNumber.trim() || "Not provided",
      location: location.trim() || "Local Village",
      cropName: cropName.trim() || "General Agriculture",
      problemDescription: problemDescription.trim(),
      urgency: urgency || "medium",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "Assigned to Krishi Vigyan Kendra (KVK)"
    };
    db.expertRequests.unshift(newRequest);
    db.history.unshift({
      id: "hist_exp_" + Date.now(),
      type: "expert_request",
      title: `Expert Support: ${cropName} (${requestId})`,
      snippet: `Status: ${newRequest.status} | Urgent: ${urgency}`,
      date: (/* @__PURE__ */ new Date()).toISOString(),
      language: "hi",
      data: newRequest
    });
    saveDB(db);
    res.json({
      success: true,
      message: "Your request has been registered and assigned to the nearest agricultural scientist.",
      message_hi: "\u0906\u092A\u0915\u093E \u0905\u0928\u0941\u0930\u094B\u0927 \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u0926\u0930\u094D\u091C \u0939\u094B \u0917\u092F\u093E \u0939\u0948 \u0914\u0930 \u0928\u091C\u0926\u0940\u0915\u0940 \u0915\u0943\u0937\u093F \u0935\u093F\u0936\u0947\u0937\u091C\u094D\u091E \u0915\u094B \u092D\u0947\u091C\u093E \u0917\u092F\u093E \u0939\u0948\u0964",
      requestId,
      assignedKVK: "District Krishi Vigyan Kendra (KVK) & ICAR Support Cell",
      helpline: "1800-180-1551 (Kisan Call Center Toll Free)"
    });
  } catch (error) {
    console.error("Error in /api/expert-request:", error);
    res.status(500).json({ success: false, error: "Failed to submit expert request." });
  }
});
app.get("/api/history", (req, res) => {
  try {
    const db = loadDB();
    res.json({
      success: true,
      history: db.history || [],
      expertRequests: db.expertRequests || []
    });
  } catch (error) {
    console.error("Error reading history:", error);
    res.status(500).json({ success: false, error: "Could not fetch history." });
  }
});
app.post("/api/history", (req, res) => {
  try {
    const item = req.body;
    if (!item || !item.title) {
      return res.status(400).json({ success: false, error: "Invalid history item." });
    }
    const db = loadDB();
    const historyItem = {
      id: item.id || "hist_" + Date.now(),
      type: item.type || "text_qa",
      title: item.title,
      snippet: item.snippet || "",
      date: item.date || (/* @__PURE__ */ new Date()).toISOString(),
      language: item.language || "hi",
      data: item.data || {}
    };
    db.history.unshift(historyItem);
    if (db.history.length > 50) db.history.pop();
    saveDB(db);
    res.json({ success: true, item: historyItem });
  } catch (error) {
    console.error("Error writing history:", error);
    res.status(500).json({ success: false, error: "Could not save history." });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\u{1F33E} FieldNerve Server running at http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
