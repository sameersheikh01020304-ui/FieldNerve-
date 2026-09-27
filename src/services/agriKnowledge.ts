// Comprehensive FieldNerve Agronomic Intelligence Engine
// Provides verified, scientific, acre-wise fertilizer dosages, pest management,
// crop schedules, and natural language query resolution for Indian agriculture.

export interface AgriKnowledgeResponse {
  answer: string;
  answerHindi: string;
  answerEnglish: string;
  audioScriptHindi: string;
  audioScriptEnglish: string;
  category: 'fertilizer' | 'pest_disease' | 'irrigation' | 'crop_schedule' | 'organic' | 'general';
}

interface CropFertilizerPlan {
  cropHindi: string;
  cropEnglish: string;
  dapPerAcre: string;
  ureaPerAcre: string;
  mopPerAcre: string;
  zincPerAcre: string;
  applicationScheduleHindi: string[];
  applicationScheduleEnglish: string[];
  mixingGuidelinesHindi: string;
  mixingGuidelinesEnglish: string;
}

export const CROP_FERTILIZER_DATABASE: Record<string, CropFertilizerPlan> = {
  wheat: {
    cropHindi: 'गेहूं (Wheat)',
    cropEnglish: 'Wheat',
    dapPerAcre: '50-55 किलो (1 बोरी)',
    ureaPerAcre: '90-100 किलो (2 बोरी, दो किश्तों में)',
    mopPerAcre: '20-25 किलो (पोटाश)',
    zincPerAcre: '5 किलो जिंक सल्फेट (33%) या 10 किलो (21%)',
    applicationScheduleHindi: [
      '1. बुवाई के समय (बेसल डोज): 50-55 किलो DAP + 20-25 किलो पोटाश (MOP) + 20 किलो यूरिया को खेत की अंतिम जुताई या सीड-कम-फर्टिलाइजर ड्रिल से बीज से 4-5 सेमी नीचे दें।',
      '2. पहली सिंचाई (21-25 दिन, सीआरआई अवस्था): 40-45 किलो यूरिया + 5 किलो जिंक सल्फेट (33%) को सिंचाई के तुरंत बाद नमी में छिड़कें।',
      '3. दूसरी सिंचाई (40-45 दिन, कल्ले फूटने पर): शेष 40-45 किलो यूरिया का दूसरा टॉप-ड्रेसिंग छिड़काव करें।',
      '4. बालियां निकलने पर (बूटिंग स्टेज): 1 किलो NPK 19:19:19 या 0:52:34 का 150-200 लीटर पानी में घोल बनाकर फोलियर स्प्रे करें।'
    ],
    applicationScheduleEnglish: [
      '1. Basal Application (At Sowing): 50-55 kg DAP (1 bag) + 20-25 kg MOP (Potash) + 20 kg Urea placed 4-5 cm below seed depth.',
      '2. First Irrigation (CRI Stage, 21-25 days): Top dress 40-45 kg Urea mixed with 5 kg Zinc Sulphate (33%) after irrigation.',
      '3. Second Irrigation (Tillering Stage, 40-45 days): Broadcast remaining 40-45 kg Urea.',
      '4. Booting / Heading Stage: Foliar spray of NPK 19:19:19 or 0:52:34 @ 1 kg in 150-200 liters of water per acre.'
    ],
    mixingGuidelinesHindi: '⚠️ डीएपी (DAP) और यूरिया को पहले से मिलाकर कभी न रखें! यूरिया वातावरण से नमी खींचता है जिससे डीएपी गीला होकर ढेला (लंप) बन जाता है और अमोनिया गैस बनकर उड़ जाती है। अगर मिलाना हो, तो बुवाई या छिड़काव से मात्र 15-20 मिनट पहले ही मिलाएं और तुरंत खेत में डाल दें। डीएपी को हमेशा बुवाई के समय दें, क्योंकि फॉस्फोरस जमीन में गतिहीन रहता है।',
    mixingGuidelinesEnglish: '⚠️ Never pre-mix and store DAP and Urea together! Urea is hygroscopic (absorbs moisture) and reacts with DAP, turning it into a wet slurry that clogs seed drills and loses nitrogen as ammonia gas. If mixing is necessary, mix immediately before application (within 15-20 minutes) and apply to dry soil. Always place DAP at root depth during sowing because phosphorus is immobile in soil.'
  },
  rice: {
    cropHindi: 'धान / चावल (Paddy / Rice)',
    cropEnglish: 'Paddy / Rice',
    dapPerAcre: '40-50 किलो (1 बोरी)',
    ureaPerAcre: '80-90 किलो (3 किश्तों में विभाजित)',
    mopPerAcre: '25 किलो (म्यूरेट ऑफ पोटाश)',
    zincPerAcre: '10 किलो जिंक सल्फेट (21%) या 5 किलो (33%)',
    applicationScheduleHindi: [
      '1. रोपाई के समय (बेसल): 40-50 किलो DAP + 25 किलो MOP + 25 किलो यूरिया खेत तैयार करते समय कीचड़ (पडलिंग) में मिलाएं।',
      '2. कल्ले फूटते समय (रोपाई के 20-25 दिन बाद): 30-35 किलो यूरिया + 5 किलो जिंक सल्फेट छिड़कें (खेत में हल्का पानी हो)।',
      '3. बालियां बनते समय (रोपाई के 40-45 दिन बाद): शेष 30 किलो यूरिया का अंतिम टॉप ड्रेसिंग करें।',
      '4. जिंक की कमी (खैरा रोग) दिखने पर: 5 किलो जिंक सल्फेट + 2.5 किलो बुझा हुआ चूना 200 लीटर पानी में घोलकर प्रति एकड़ छिड़कें।'
    ],
    applicationScheduleEnglish: [
      '1. Basal at Transplanting: Apply 40-50 kg DAP + 25 kg MOP + 25 kg Urea during last puddling.',
      '2. Tillering Stage (20-25 days after transplanting): Broadcast 30-35 kg Urea along with 5 kg Zinc Sulphate in shallow standing water.',
      '3. Panicle Initiation (40-45 days): Broadcast final 30 kg Urea top dressing.',
      '4. For Khaira Disease (Zinc deficiency): Spray 5 kg Zinc Sulphate + 2.5 kg Slaked Lime in 200 liters of water per acre.'
    ],
    mixingGuidelinesHindi: 'धान में डीएपी को हमेशा रोपाई के समय ही दें। यूरिया को 3 भागों में बांटकर दें ताकि नाइट्रोजन का रिसाव न हो। यूरिया और जिंक सल्फेट को अलग-अलग समय पर डालें या छिड़कने से ठीक 10 मिनट पहले ही मिलाएं।',
    mixingGuidelinesEnglish: 'Apply full DAP at transplanting time. Split Urea into 3 equal doses to prevent leaching. Avoid mixing Zinc Sulphate and DAP together as they form insoluble Zinc Phosphate.'
  },
  mustard: {
    cropHindi: 'सरसों / तोरिया (Mustard)',
    cropEnglish: 'Mustard',
    dapPerAcre: '30-35 किलो',
    ureaPerAcre: '45-50 किलो (2 किश्तों में)',
    mopPerAcre: '15 किलो पोटाश',
    zincPerAcre: '15-20 किलो सल्फर (बेंटोनाइट 90% या सिंगल सुपर फास्फेट)',
    applicationScheduleHindi: [
      '1. बुवाई के समय: 30-35 किलो DAP + 15 किलो MOP + 15-20 किलो सल्फर + 20 किलो यूरिया बेसल डोज में दें। सरसों में सल्फर तेल की मात्रा 3-5% बढ़ाता है।',
      '2. पहली सिंचाई (25-30 दिन, शाखाएं निकलते समय): 25-30 किलो यूरिया का छिड़काव करें।',
      '3. फूल व फलियां बनते समय: घुलनशील सल्फर (80% WDG) 3 ग्राम/लीटर या NPK 0:52:34 का 1 किलो/एकड़ स्प्रे करें।'
    ],
    applicationScheduleEnglish: [
      '1. Basal at Sowing: 30-35 kg DAP + 15 kg MOP + 15-20 kg Bentonite Sulphur (90%) + 20 kg Urea. Sulphur is essential to boost oil content by 3-5%.',
      '2. First Irrigation (25-30 days): Top dress 25-30 kg Urea.',
      '3. Flowering / Pod formation: Foliar spray of NPK 0:52:34 @ 1 kg/acre for bold seeds.'
    ],
    mixingGuidelinesHindi: 'सरसों में सल्फर का प्रयोग अत्यंत आवश्यक है। डीएपी और सल्फर को बुवाई के समय कतारों में डालें। यूरिया को पहली सिंचाई के बाद ही दें।',
    mixingGuidelinesEnglish: 'Sulphur is crucial for mustard seed and oil development. Apply DAP and Sulphur in furrows at sowing. Top dress Urea post-irrigation.'
  },
  potato: {
    cropHindi: 'आलू (Potato)',
    cropEnglish: 'Potato',
    dapPerAcre: '75-100 किलो (1.5 से 2 बोरी)',
    ureaPerAcre: '75-80 किलो (2 किश्तों में)',
    mopPerAcre: '50-60 किलो (पोटाश कंद के आकार के लिए अति आवश्यक है)',
    zincPerAcre: '10 किलो जिंक सल्फेट + 5 किलो बोरॉन (20%)',
    applicationScheduleHindi: [
      '1. बुवाई के समय: 75-100 किलो DAP + 40 किलो MOP + 35 किलो यूरिया कतारों में बीज के नीचे दें।',
      '2. मिट्टी चढ़ाते समय (25-30 दिन बाद): शेष 40-45 किलो यूरिया + 15-20 किलो पोटाश छिड़ककर तुरंत मिट्टी चढ़ाएं व हल्की सिंचाई करें।',
      '3. कंद बनते समय (45-50 दिन): 0:0:50 (पोटेशियम सल्फेट) 1 किलो प्रति 150 लीटर पानी में फोलियर स्प्रे करें।'
    ],
    applicationScheduleEnglish: [
      '1. Basal at Planting: 75-100 kg DAP + 40 kg MOP + 35 kg Urea placed in furrows.',
      '2. Earthing Up (25-30 days): Apply remaining 40-45 kg Urea + 15-20 kg MOP and earth up immediately.',
      '3. Tuber Bulking (45-50 days): Foliar spray of 0:0:50 (SOP) @ 1 kg in 150 liters water for uniform tuber size.'
    ],
    mixingGuidelinesHindi: 'आलू में पोटाश की अधिक आवश्यकता होती है। म्यूरेट ऑफ पोटाश (MOP) या पोटेशियम सल्फेट का उपयोग करें। डीएपी की पूरी मात्रा बुवाई पर ही दे दें।',
    mixingGuidelinesEnglish: 'Potatoes are heavy potash feeders. High potassium improves tuber size and storage quality. Apply full DAP at planting time.'
  },
  maize: {
    cropHindi: 'मक्का (Maize / Corn)',
    cropEnglish: 'Maize',
    dapPerAcre: '45-50 किलो',
    ureaPerAcre: '90-100 किलो (3 किश्तों में)',
    mopPerAcre: '20 किलो MOP',
    zincPerAcre: '5 किलो जिंक सल्फेट',
    applicationScheduleHindi: [
      '1. बुवाई के समय: 45-50 किलो DAP + 20 किलो पोटाश + 25 किलो यूरिया।',
      '2. घुटने की ऊंचाई पर (30-35 दिन): 35-40 किलो यूरिया का पहला टॉप ड्रेसिंग।',
      '3. नर मंजरी (टैसल्स) निकलते समय (50-55 दिन): 30-35 किलो यूरिया का दूसरा टॉप ड्रेसिंग।'
    ],
    applicationScheduleEnglish: [
      '1. Basal at Sowing: 45-50 kg DAP + 20 kg MOP + 25 kg Urea.',
      '2. Knee-high Stage (30-35 days): Top dress 35-40 kg Urea.',
      '3. Tasseling Stage (50-55 days): Top dress final 30-35 kg Urea.'
    ],
    mixingGuidelinesHindi: 'मक्के में यूरिया को हमेशा मिट्टी में नमी रहने पर ही दें। डीएपी को बीज से 5 सेमी दूर डालें ताकि बीज का अंकुरण प्रभावित न हो।',
    mixingGuidelinesEnglish: 'In maize, apply Urea only when soil has adequate moisture. Place DAP 5 cm away from seeds to avoid germination damage.'
  },
  cotton: {
    cropHindi: 'कपास (Cotton)',
    cropEnglish: 'Cotton',
    dapPerAcre: '45-50 किलो',
    ureaPerAcre: '70-80 किलो (3 किश्तों में)',
    mopPerAcre: '25-30 किलो पोटाश',
    zincPerAcre: '5 किलो मैग्नीशियम सल्फेट + 5 किलो जिंक',
    applicationScheduleHindi: [
      '1. बुवाई के समय: 45-50 किलो DAP + 15 किलो MOP + 20 किलो यूरिया।',
      '2. चौकोर बनते समय (स्क्वेयरिंग, 35-40 दिन): 30 किलो यूरिया + 5 किलो मैग्नीशियम सल्फेट।',
      '3. फूल व टिंडे बनते समय (60-70 दिन): 25-30 किलो यूरिया + 15 किलो MOP।'
    ],
    applicationScheduleEnglish: [
      '1. Basal at Sowing: 45-50 kg DAP + 15 kg MOP + 20 kg Urea.',
      '2. Squaring Stage (35-40 days): 30 kg Urea + 5 kg Magnesium Sulphate.',
      '3. Flowering / Boll Formation (60-70 days): 25-30 kg Urea + 15 kg MOP.'
    ],
    mixingGuidelinesHindi: 'कपास में मैग्नीशियम की कमी से पत्तियां लाल होती हैं (लाल पत्ती रोग)। इसके लिए 1% मैग्नीशियम सल्फेट का फोलियर स्प्रे करें।',
    mixingGuidelinesEnglish: 'Magnesium deficiency causes reddening of cotton leaves. Spray 1% Magnesium Sulphate during boll development.'
  },
  sugarcane: {
    cropHindi: 'गन्ना (Sugarcane)',
    cropEnglish: 'Sugarcane',
    dapPerAcre: '70-80 किलो (1.5 बोरी)',
    ureaPerAcre: '150-180 किलो (3-4 किश्तों में)',
    mopPerAcre: '40-50 किलो पोटाश',
    zincPerAcre: '10 किलो जिंक सल्फेट + 25 किलो फेरस सल्फेट',
    applicationScheduleHindi: [
      '1. बुवाई (कूड़ों में): 70-80 किलो DAP + 25 किलो MOP + 35 किलो यूरिया टुकड़ों के नीचे दें।',
      '2. कल्ले फूटते समय (45-60 दिन): 45-50 किलो यूरिया।',
      '3. मिट्टी चढ़ाते समय (90-100 दिन): 45-50 किलो यूरिया + 20 किलो MOP।',
      '4. मानसून से पूर्व (120-130 दिन): 30-40 किलो यूरिया अंतिम टॉप ड्रेसिंग।'
    ],
    applicationScheduleEnglish: [
      '1. Basal in Furrows: 70-80 kg DAP + 25 kg MOP + 35 kg Urea below setts.',
      '2. Tillering Stage (45-60 days): 45-50 kg Urea.',
      '3. Earthing Up (90-100 days): 45-50 kg Urea + 20 kg MOP.',
      '4. Pre-monsoon (120-130 days): Final 30-40 kg Urea.'
    ],
    mixingGuidelinesHindi: 'गन्ने की फसल लंबी अवधि की होती है, इसलिए फॉस्फोरस (DAP) की पूरी मात्रा बुवाई पर ही कूड़ों में दें और यूरिया को किश्तों में डालें।',
    mixingGuidelinesEnglish: 'Sugarcane is a long duration crop. Apply entire DAP in furrows at planting and split Urea across 3-4 stages.'
  }
};

// Natural language query processor for common agriculture questions
export function resolveAgriQueryLocally(question: string, targetLang: 'hi' | 'en' = 'hi'): AgriKnowledgeResponse {
  const q = question.toLowerCase().trim();

  // 1. Check for DAP + Urea specific question (e.g. "How much DAP should I give in one acre?", "1 acre me kitna dap", "dap urea kaise milaye")
  const isDapQuery = q.includes('dap') || q.includes('डीएपी') || q.includes('डी ए पी');
  const isUreaQuery = q.includes('urea') || q.includes('यूरिया') || q.includes('युरिया');
  const isAcreQuery = q.includes('acre') || q.includes('एकड़') || q.includes('एकड') || q.includes('ekad') || q.includes('ekad me');
  const isMixQuery = q.includes('mix') || q.includes('मिला') || q.includes('mix kaise') || q.includes('milaye') || q.includes('milana');

  // Detect specific crop in query
  let matchedCropKey: string = 'wheat'; // default to wheat as it is the most common rabi staple
  if (q.includes('dhan') || q.includes('rice') || q.includes('paddy') || q.includes('धान') || q.includes('चावल')) {
    matchedCropKey = 'rice';
  } else if (q.includes('sarson') || q.includes('mustard') || q.includes('सरसों') || q.includes('राई') || q.includes('toriya')) {
    matchedCropKey = 'mustard';
  } else if (q.includes('aalu') || q.includes('potato') || q.includes('आलू')) {
    matchedCropKey = 'potato';
  } else if (q.includes('makka') || q.includes('maize') || q.includes('corn') || q.includes('मक्का')) {
    matchedCropKey = 'maize';
  } else if (q.includes('kapas') || q.includes('cotton') || q.includes('कपास') || q.includes('narma')) {
    matchedCropKey = 'cotton';
  } else if (q.includes('ganna') || q.includes('sugarcane') || q.includes('गन्ना')) {
    matchedCropKey = 'sugarcane';
  } else if (q.includes('gehu') || q.includes('wheat') || q.includes('गेहूं') || q.includes('गेंहू')) {
    matchedCropKey = 'wheat';
  }

  const cropData = CROP_FERTILIZER_DATABASE[matchedCropKey];

  // Specific Answer for: DAP & Urea Dosage per Acre / Mixing
  if (isDapQuery || isUreaQuery || (isAcreQuery && (q.includes('fertilizer') || q.includes('khad') || q.includes('खाद')))) {
    const isSpecificMixing = isMixQuery;

    const answerHindi = `🌾 **${cropData.cropHindi} में प्रति 1 एकड़ खाद एवं डीएपी/यूरिया की सही मात्रा:**

📌 **मात्रा प्रति 1 एकड़:**
• **डीएपी (DAP):** ${cropData.dapPerAcre}
• **यूरिया (Urea):** ${cropData.ureaPerAcre}
• **पोटाश (MOP):** ${cropData.mopPerAcre}
• **जिंक सल्फेट:** ${cropData.zincPerAcre}

⏱️ **डालने का सही समय और तरीका:**
${cropData.applicationScheduleHindi.join('\n')}

🧪 **डीएपी और यूरिया को मिलाने के नियम:**
${cropData.mixingGuidelinesHindi}

💡 **विशेष सलाह:** डीएपी को कभी भी यूरिया के साथ मिलाकर घर पर स्टोर न करें। डीएपी हमेशा बुवाई के समय मिट्टी के अंदर जड़ के पास दें, और यूरिया को पहली व दूसरी सिंचाई के बाद शाम के समय छिड़कें।`;

    const answerEnglish = `🌾 **Recommended Fertilizer, DAP & Urea Dosage for 1 Acre of ${cropData.cropEnglish}:**

📌 **Exact Dosage per 1 Acre:**
• **DAP (Di-ammonium Phosphate):** ${cropData.dapPerAcre}
• **Urea:** ${cropData.ureaPerAcre}
• **MOP (Potash):** ${cropData.mopPerAcre}
• **Zinc Sulphate:** ${cropData.zincPerAcre}

⏱️ **Step-by-Step Application Timeline:**
${cropData.applicationScheduleEnglish.join('\n')}

🧪 **Can you mix DAP and Urea?**
${cropData.mixingGuidelinesEnglish}

💡 **Expert Advice:** Never pre-mix and store DAP and Urea. Apply 100% of DAP at sowing as a basal dose near the root zone, and split Urea into 2-3 applications after irrigation.`;

    const audioHi = `${cropData.cropHindi} में प्रति एकड़ 50 किलो डीएपी बुवाई के समय दें, और 90 किलो यूरिया को दो किश्तों में सिंचाई के बाद छिड़कें। डीएपी और यूरिया को पहले से मिलाकर न रखें।`;
    const audioEn = `For one acre of ${cropData.cropEnglish}, apply 50 kg DAP at sowing time and split 90 kg Urea into two top dressings after irrigation. Do not pre-mix DAP and Urea.`;

    return {
      answer: targetLang === 'hi' ? answerHindi : answerEnglish,
      answerHindi,
      answerEnglish,
      audioScriptHindi: audioHi,
      audioScriptEnglish: audioEn,
      category: 'fertilizer',
    };
  }

  // 2. Yellow leaves / Rust / पीली पत्तियां / रतुआ
  if (q.includes('yellow') || q.includes('पीली') || q.includes('पीला') || q.includes('rust') || q.includes('रतुआ') || q.includes('chlorosis')) {
    const answerHindi = `🌾 **पत्तियों का पीला पड़ना (Yellow Leaves / Yellow Rust):**

🔍 **कारण:**
1. **पीला रतुआ (Yellow Rust):** पत्तियों पर पीले पाउडर की धारियां बनती हैं। छूने पर हाथ में पीला पाउडर लगता है।
2. **नाइट्रोजन की कमी:** निचली पुरानी पत्तियां सिरे से V-आकार में पीली पड़ती हैं।
3. **पानी का भराव या जिंक की कमी:** जड़ों में हवा न मिलने से पौधा पीला पड़ता है।

💊 **समाधान:**
• **रतुआ रोग के लिए:** प्रोपिकोनाजोल 25% EC (टिल्ट) की 1 मिली प्रति लीटर पानी (200 मिली प्रति 200 लीटर पानी प्रति एकड़) में घोल बनाकर साफ धूप में छिड़कें।
• **नाइट्रोजन की कमी के लिए:** 2% यूरिया घोल (2 किलो यूरिया 100 लीटर पानी में) का फोलियर स्प्रे करें।
• **जिंक की कमी के लिए:** 0.5% जिंक सल्फेट + 0.25% बुझा हुआ चूना मिलाकर छिड़कें।`;

    const answerEnglish = `🌾 **Yellow Leaves & Yellow Rust Management:**

🔍 **Causes:**
1. **Yellow Rust (Fungal):** Linear yellow powdery stripes on leaves that rub off on fingers.
2. **Nitrogen Deficiency:** Lower/older leaves turn pale yellow from the tip in a V-shape.
3. **Waterlogging or Zinc Deficiency:** Poor root aeration causes generalized chlorosis.

💊 **Remedies:**
• **For Yellow Rust:** Spray Propiconazole 25% EC @ 1 ml per liter of water (200 ml in 200 liters of water per acre) in clear weather.
• **For Nitrogen Deficiency:** Foliar spray of 2% Urea solution (2 kg Urea in 100 liters water per acre).
• **For Zinc Deficiency:** Spray 0.5% Zinc Sulphate + 0.25% lime mixture.`;

    return {
      answer: targetLang === 'hi' ? answerHindi : answerEnglish,
      answerHindi,
      answerEnglish,
      audioScriptHindi: 'पत्तियों में पीले रतुए के लिए प्रोपिकोनाजोल 25 प्रतिशत का एक मिली प्रति लीटर पानी में घोल बनाकर छिड़कें।',
      audioScriptEnglish: 'For yellow leaves and rust, spray Propiconazole 25 EC at 1 ml per liter of water.',
      category: 'pest_disease',
    };
  }

  // 3. Pest Attack / Aphids / कीट / माहू / सुंडी / सफेद मक्खी
  if (q.includes('pest') || q.includes('कीट') || q.includes('कीड़ा') || q.includes('माहू') || q.includes('aphid') || q.includes('sundi') || q.includes('worm') || q.includes('fly')) {
    const answerHindi = `🐛 **फसल कीट व रस चूसक कीड़ों का संपूर्ण नियंत्रण:**

🌱 **जैविक व प्राथमिक उपचार (Organic First):**
• 5 मिली नीम का तेल (10,000 PPM) + 1 मिली तरल साबुन प्रति लीटर पानी में मिलाकर शाम के समय छिड़कें।
• माहू और सफेद मक्खी के लिए खेत में प्रति एकड़ 8-10 **पीले चिपचिपे कार्ड (Yellow Sticky Traps)** लगाएं।

🧪 **रासायनिक उपचार (गंभीर प्रकोप होने पर):**
• **माहू (Aphid) व चूसक कीट:** इमिडाक्लोप्रिड 17.8% SL (0.5 मिली प्रति लीटर) या थायमेथोक्सम 25% WG (0.5 ग्राम प्रति लीटर पानी)।
• **सुंडी / इल्ली (Caterpillar/Borer):** कोराजन (क्लोरेंट्रानिलिप्रोल 18.5% SC) 0.4 मिली प्रति लीटर या इमामेक्टिन बेंजोएट 5% SG (0.5 ग्राम प्रति लीटर)।`;

    const answerEnglish = `🐛 **Comprehensive Pest & Insect Control Guide:**

🌱 **Organic & Integrated Pest Management:**
• Spray Neem Oil (10,000 PPM) @ 5 ml/liter + 1 ml liquid soap during evening hours.
• Install 8-10 Yellow Sticky Traps per acre to control aphids and whiteflies naturally.

🧪 **Chemical Recommendations (For Severe Infestation):**
• **Aphids & Sucking Pests:** Imidacloprid 17.8% SL @ 0.5 ml/L or Thiamethoxam 25% WG @ 0.5 g/L.
• **Stem Borer / Armyworm / Caterpillars:** Coragen (Chlorantraniliprole 18.5% SC) @ 0.4 ml/L or Emamectin Benzoate 5% SG @ 0.5 g/L.`;

    return {
      answer: targetLang === 'hi' ? answerHindi : answerEnglish,
      answerHindi,
      answerEnglish,
      audioScriptHindi: 'कीट नियंत्रण के लिए पांच मिली नीम का तेल प्रति लीटर पानी में मिलाकर शाम को छिड़कें। अधिक प्रकोप में इमिडाक्लोप्रिड का प्रयोग करें।',
      audioScriptEnglish: 'Spray neem oil at 5 ml per liter in the evening. For severe pest attack, apply Imidacloprid.',
      category: 'pest_disease',
    };
  }

  // 4. Irrigation / Sinchai / पानी कब दें
  if (q.includes('irrigation') || q.includes('water') || q.includes('सिंचाई') || q.includes('पानी कब') || q.includes('sinchai')) {
    const answerHindi = `💧 **फसल सिंचाई की क्रांतिक अवस्थाएं (Critical Irrigation Stages):**

🌾 **गेहूं (Wheat):**
1. **पहली सिंचाई:** बुवाई के 21-25 दिन बाद (CRI - ताज जड़ निकलने पर) - यह सबसे महत्वपूर्ण है!
2. **दूसरी सिंचाई:** 40-45 दिन (कल्ले फूटते समय / Tillering)
3. **तीसरी सिंचाई:** 60-65 दिन (गांठ बनते समय / Jointing)
4. **चौथी सिंचाई:** 80-85 दिन (फूल / बालियां निकलते समय / Flowering)
5. **पांचवीं सिंचाई:** 100-105 दिन (दूधिया अवस्था / Milking)
6. **छठी सिंचाई:** 115-120 दिन (दाना भरते समय / Dough stage)

💡 **सावधानी:** तेज हवा चलने पर सिंचाई न करें, वरना फसल गिर (Lodging) सकती है।`;

    const answerEnglish = `💧 **Critical Irrigation Stages:**

🌾 **For Wheat:**
1. **1st Irrigation:** 21-25 days after sowing (Crown Root Initiation - CRI stage) - Most critical!
2. **2nd Irrigation:** 40-45 days (Tillering stage)
3. **3rd Irrigation:** 60-65 days (Late jointing stage)
4. **4th Irrigation:** 80-85 days (Flowering / Heading stage)
5. **5th Irrigation:** 100-105 days (Milking stage)
6. **6th Irrigation:** 115-120 days (Grain filling / Dough stage)

💡 **Caution:** Never irrigate during high winds to avoid crop lodging.`;

    return {
      answer: targetLang === 'hi' ? answerHindi : answerEnglish,
      answerHindi,
      answerEnglish,
      audioScriptHindi: 'गेहूं में पहली और सबसे जरूरी सिंचाई बुवाई के 21 से 25 दिन बाद सीआरआई अवस्था में करें।',
      audioScriptEnglish: 'The first and most critical irrigation for wheat is at 21 to 25 days after sowing at the CRI stage.',
      category: 'irrigation',
    };
  }

  // 5. General Fallback with Comprehensive Agricultural Knowledge
  const answerHindi = `🌾 **किसान सलाहकार उत्तर ("${question}"):**

1. **संतुलित पोषण:** खेत में मिट्टी जांच के अनुसार ही खाद दें। 1 एकड़ में सामान्यतः 1 बोरी डीएपी बुवाई के समय तथा 2 बोरी यूरिया को 2 किश्तों में सिंचाई के बाद दें।
2. **रोग व कीट रोकथाम:** किसी भी रोग के शुरुआती लक्षण दिखते ही जैविक नीम तेल (5 मिली/लीटर) का छिड़काव करें।
3. **नमी प्रबंधन:** खेत में जल-निकासी की अच्छी व्यवस्था रखें ताकि जड़ों में सड़न न लगे।
4. **निशुल्क किसान हेल्पलाइन:** किसी भी आपातकालीन स्थिति में राष्ट्रीय किसान कॉल सेंटर 1800-180-1551 पर कॉल करें।`;

  const answerEnglish = `🌾 **Agricultural Advisory for ("${question}"):**

1. **Balanced Nutrition:** Apply fertilizers based on soil test. For 1 acre, standard dosage is 1 bag DAP at sowing and 2 bags Urea split across irrigations.
2. **Disease & Pest Defense:** At first visible symptoms, apply organic Neem Oil (5 ml/L) or targeted biocontrol.
3. **Moisture Balance:** Ensure adequate field drainage to prevent root fungal decay.
4. **Toll-Free Kisan Support:** Dial National Kisan Call Centre at 1800-180-1551 for government agricultural scientist consultation.`;

  return {
    answer: targetLang === 'hi' ? answerHindi : answerEnglish,
    answerHindi,
    answerEnglish,
    audioScriptHindi: 'खेत में संतुलित खाद दें, डीएपी बुवाई के समय और यूरिया को सिंचाई के बाद किश्तों में डालें।',
    audioScriptEnglish: 'Apply balanced fertilizers with DAP at sowing and split Urea post-irrigation.',
    category: 'general',
  };
}
