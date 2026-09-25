import { Language } from '../types';

export const TRANSLATIONS = {
  en: {
    appName: "FieldNerve",
    tagline: "AI Crop Health & Climate Advisory Platform",
    sihBadge: "SIH 2026 Project",
    emergencyHelpline: "Kisan Helpline: 1800-180-1551",
    audioGuide: "Audio Narration Available",
    tabs: {
      cropDoctor: "Crop Doctor",
      agriChat: "AI Assistant",
      climate: "Field Climate",
      threeD: "3D Farm",
      expertHelp: "Expert Support",
      history: "History"
    },
    hero: {
      badge: "Smart Agriculture Assistant",
      title: "Know Your Crops, Protect Your Harvest",
      subtitle: "Instant leaf disease detection, hyper-local climate advisories, and voice-assisted farming guidance.",
      scanBtn: "Diagnose Crop",
      askBtn: "Ask AI",
      weatherBtn: "Field Climate",
      threeDBtn: "3D Farm View",
      uneducatedFarmerNote: "Voice enabled: Click the speaker icon to listen to any advice."
    },
    scanner: {
      title: "Crop Photo Diagnosis",
      subtitle: "Upload or click a photo of your leaf or crop to get an instant diagnosis and remedy.",
      dragDrop: "Drag & drop leaf photo here, or click to browse",
      useCamera: "Open Camera",
      capturePhoto: "Take Photo",
      switchCamera: "Switch Camera",
      closeCamera: "Cancel",
      analyzing: "Analyzing leaf patterns with Agriculture AI...",
      sampleLabel: "Or test with common crop samples:",
      diagnoseBtn: "Analyze Photo",
      healthStatus: "Crop Health Status",
      problemTitle: "Identified Problem / Disease",
      possibleCauses: "Possible Causes",
      recommendations: "Recommended Remedies",
      prevention: "Prevention & Soil Care",
      warningLabel: "Safety Warning",
      listenDiagnosis: "Listen Diagnosis",
      stopListening: "Stop Audio",
      escalateToExpert: "Need more help? Connect with KVK Expert",
      newScan: "Scan Another Crop"
    },
    chat: {
      title: "Agri AI Assistant",
      subtitle: "Ask anything about fertilizers, seeds, watering, pest control, and seasonal care.",
      inputPlaceholder: "Type your question or click the mic to speak...",
      speakPrompt: "Click to speak",
      listening: "Listening... Speak your crop question",
      sendBtn: "Ask AI",
      quickQuestionsTitle: "Popular Questions:",
      presets: [
        "How to control yellow rust in wheat?",
        "Right dose of DAP and Urea for paddy crop",
        "How to prevent fruit borer in tomato?",
        "Organic preparation of Jeevamrit at home"
      ],
      listenAnswer: "Listen",
      stopAudio: "Stop Voice"
    },
    weather: {
      title: "Field Micro-Climate & Advisories",
      subtitle: "Hyper-local weather metrics linked to real-time farming decisions.",
      searchPlaceholder: "Search city or district (e.g. Ludhiana, Patna, Nagpur)...",
      searchBtn: "Search",
      useGps: "Use My GPS Location",
      tempLabel: "Temperature",
      humidityLabel: "Humidity",
      rainLabel: "Rain Probability",
      windLabel: "Wind Speed",
      agriAdvisoryTitle: "Actionable Farming Advisories",
      irrigationTitle: "Irrigation Advisory",
      sprayingTitle: "Pesticide Spraying Window",
      harvestTitle: "Harvesting Condition",
      listenWeather: "Listen to Advisory"
    },
    expert: {
      title: "Agricultural Expert (KVK) Escalation",
      subtitle: "If diagnosis is uncertain or disease is severe, get connected with an agricultural scientist.",
      farmerName: "Farmer Full Name",
      phone: "Mobile Number",
      location: "Village / District / State",
      cropName: "Crop Name",
      problem: "Describe the Issue",
      urgency: "Urgency Level",
      low: "Low (General Advice)",
      medium: "Medium (Spreading slowly)",
      high: "High (Severe crop damage risk)",
      submitBtn: "Submit Escalation Request",
      submitting: "Registering Request...",
      successTitle: "Request Registered Successfully!",
      assignedNote: "Assigned to the nearest District Agricultural Office.",
      trackingCode: "Your Tracking Code:",
      helplineNote: "For immediate assistance, call the Kisan Helpline:"
    },
    threeD: {
      title: "3D Farm & Crop Visualizer",
      subtitle: "Interactive 3D model simulating crop vitality, soil moisture, and weather impact.",
      hint: "Drag to rotate the 3D field, scroll to zoom.",
      vitality: "Crop Vitality",
      moisture: "Soil Moisture",
      sunlight: "Solar Exposure",
      statusSunny: "Sunny & Normal Sway",
      statusRain: "Precipitation Simulation"
    }
  },
  hi: {
    appName: "FieldNerve",
    tagline: "भारतीय किसानों के लिए एआई फसल स्वास्थ्य व मौसम सलाहकार",
    sihBadge: "SIH 2026 प्रोजेक्ट",
    emergencyHelpline: "किसान हेल्पलाइन: 1800-180-1551",
    audioGuide: "आवाज़ में सुनने की सुविधा उपलब्ध है",
    tabs: {
      cropDoctor: "फसल डॉक्टर",
      agriChat: "एआई सहायक",
      climate: "मौसम व सलाह",
      threeD: "3D खेत",
      expertHelp: "विशेषज्ञ सहायता",
      history: "इतिहास"
    },
    hero: {
      badge: "स्मार्ट कृषि सहायक",
      title: "अपनी फसल को जानें, खेत को सुरक्षित बनाएं",
      subtitle: "पत्ते की फोटो खींचकर तुरंत रोग पहचानें, मौसम सलाह पाएं, और बोलकर खेती के सवालों के जवाब पाएं।",
      scanBtn: "फसल जांचें",
      askBtn: "सवाल पूछें",
      weatherBtn: "खेत का मौसम",
      threeDBtn: "3D खेत दृश्य",
      uneducatedFarmerNote: "आवाज़ सुविधा: किसी भी सलाह को सुनने के लिए स्पीकर 🔊 पर क्लिक करें।"
    },
    scanner: {
      title: "फसल फोटो जांच",
      subtitle: "अपने पौधे या पत्ते की फोटो अपलोड करें या कैमरे से खींचकर रोग और उपचार जानें।",
      dragDrop: "यहां पत्ते की फोटो खींचे या चुनें",
      useCamera: "कैमरा चालू करें",
      capturePhoto: "फोटो खींचें",
      switchCamera: "कैमरा बदलें",
      closeCamera: "रद्द करें",
      analyzing: "एआई द्वारा पत्ते की जांच की जा रही है...",
      sampleLabel: "या जांच के लिए इन उदाहरण तस्वीरों पर क्लिक करें:",
      diagnoseBtn: "फोटो जांचें",
      healthStatus: "फसल की स्थिति",
      problemTitle: "पहचाना गया रोग या समस्या",
      possibleCauses: "संभावित कारण",
      recommendations: "उपचार व समाधान",
      prevention: "बचाव व मिट्टी की देखभाल",
      warningLabel: "सुरक्षा सावधानी",
      listenDiagnosis: "आवाज़ में सुनें",
      stopListening: "आवाज़ रोकें",
      escalateToExpert: "विशेषज्ञ से सलाह लें",
      newScan: "दूसरी फसल जांचें"
    },
    chat: {
      title: "कृषि एआई सहायक",
      subtitle: "खाद, बीज, सिंचाई, कीट रोकथाम या फसलों के बारे में कुछ भी पूछें।",
      inputPlaceholder: "अपना सवाल लिखें या माइक दबाकर बोलें...",
      speakPrompt: "बोलने के लिए क्लिक करें",
      listening: "सुन रहे हैं... अभी अपना सवाल बोलें",
      sendBtn: "पूछें",
      quickQuestionsTitle: "अक्सर पूछे जाने वाले सवाल:",
      presets: [
        "गेहूं में पीला रतुआ का सबसे असरदार इलाज क्या है?",
        "धान की फसल में यूरिया और डीएपी की सही मात्रा",
        "टमाटर में फल सड़ने और पत्ती मुड़ने से कैसे बचाएं?",
        "घर पर जीवामृत और जैविक खाद बनाने का तरीका"
      ],
      listenAnswer: "उत्तर सुनें",
      stopAudio: "आवाज़ रोकें"
    },
    weather: {
      title: "खेत का मौसम व कृषि सलाह",
      subtitle: "मौसम के आधार पर सिंचाई और दवा छिड़काव का सही फैसला लें।",
      searchPlaceholder: "शहर या जिला खोजें (उदा: नागपुर, पटना, लुधियाना)...",
      searchBtn: "खोजें",
      useGps: "मेरा वर्तमान स्थान (GPS)",
      tempLabel: "तापमान",
      humidityLabel: "हवा में नमी",
      rainLabel: "बारिश की संभावना",
      windLabel: "हवा की गति",
      agriAdvisoryTitle: "कृषि कार्य सलाह",
      irrigationTitle: "सिंचाई सलाह",
      sprayingTitle: "कीटनाशक छिड़काव समय",
      harvestTitle: "कटाई की अनुकूलता",
      listenWeather: "सलाह सुनें"
    },
    expert: {
      title: "कृषि वैज्ञानिक (KVK) विशेषज्ञ सहायता",
      subtitle: "यदि रोग गंभीर है, तो सरकारी कृषि वैज्ञानिक से संपर्क करें।",
      farmerName: "किसान का पूरा नाम",
      phone: "मोबाइल नंबर",
      location: "गांव / जिला / राज्य",
      cropName: "फसल का नाम",
      problem: "फसल की समस्या विस्तार से बताएं",
      urgency: "समस्या की गंभीरता",
      low: "सामान्य (सामान्य जानकारी)",
      medium: "मध्यम (धीरे-धीरे फैल रहा है)",
      high: "गंभीर (फसल नुकसान का खतरा)",
      submitBtn: "विशेषज्ञ सहायता दर्ज करें",
      submitting: "दर्ज हो रहा है...",
      successTitle: "अनुरोध सफलतापूर्वक दर्ज हुआ!",
      assignedNote: "आपका अनुरोध नजदीकी कृषि विज्ञान केंद्र को भेज दिया गया है।",
      trackingCode: "आपका संदर्भ कोड:",
      helplineNote: "तत्काल सहायता के लिए किसान कॉल सेंटर पर कॉल करें:"
    },
    threeD: {
      title: "3D खेत व फसल दृश्य",
      subtitle: "फसल स्वास्थ्य, मिट्टी की नमी और मौसम का 3D सिमुलेशन।",
      hint: "खेत को 3D में घुमाकर या ज़ूम करके स्थिति देखें।",
      vitality: "फसल स्वास्थ्य",
      moisture: "मिट्टी में नमी",
      sunlight: "सूर्य का प्रकाश",
      statusSunny: "साफ धूप व सामान्य हवा",
      statusRain: "बारिश का प्रभाव सिमुलेशन"
    }
  }
};

export const SAMPLE_IMAGES = [
  {
    name: "Wheat Yellow Rust",
    nameHi: "गेहूं पीला रतुआ",
    crop: "Wheat",
    url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80",
    description: "Yellow powdery stripes on wheat leaves indicating Puccinia striiformis."
  },
  {
    name: "Tomato Early Blight",
    nameHi: "टमाटर झुलसा रोग",
    crop: "Tomato",
    url: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600&auto=format&fit=crop&q=80",
    description: "Concentric brown spots and chlorosis on tomato foliage."
  },
  {
    name: "Healthy Paddy Crop",
    nameHi: "स्वस्थ धान की फसल",
    crop: "Rice",
    url: "https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=600&auto=format&fit=crop&q=80",
    description: "Vibrant green lush paddy stems in early tillering stage."
  },
  {
    name: "Cotton Pest Damage",
    nameHi: "कपास कीट प्रकोप",
    crop: "Cotton",
    url: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600&auto=format&fit=crop&q=80",
    description: "Bollworm and sucking pest injury on cotton vegetative parts."
  }
];
