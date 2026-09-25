import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Square,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  PhoneCall,
  Image as ImageIcon
} from 'lucide-react';
import { Language, CropAnalysisResult } from '../types';
import { TRANSLATIONS, SAMPLE_IMAGES } from '../data/translations';
import { speakText, stopSpeaking } from '../utils/speech';
import { saveUserScanToCloud } from '../lib/firebase';

interface CropScannerProps {
  language: Language;
  onOpenExpert: (cropName?: string, problemDesc?: string) => void;
  onScanSaved?: () => void;
  currentUserUid?: string;
}

export const CropScanner: React.FC<CropScannerProps> = ({
  language,
  onOpenExpert,
  onScanSaved,
  currentUserUid,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<CropAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cameraPermissionBlocked, setCameraPermissionBlocked] = useState<boolean>(false);
  const [activeAudioLang, setActiveAudioLang] = useState<'en' | 'hi' | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const cancelAudioRef = useRef<(() => void) | null>(null);

  const t = TRANSLATIONS[language].scanner;

  // Cleanup speech and camera on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const triggerNativeCamera = () => {
    setErrorMsg(null);
    setCameraPermissionBlocked(false);
    stopCameraStream();
    setIsCameraActive(false);
    const cameraInput = document.getElementById('fieldnerve-camera-input') as HTMLInputElement;
    if (cameraInput) {
      cameraInput.click();
    } else {
      const fileInput = document.getElementById('fieldnerve-file-input') as HTMLInputElement;
      fileInput?.click();
    }
  };

  const startCamera = async () => {
    setErrorMsg(null);
    setCameraPermissionBlocked(false);
    stopCameraStream();

    // Check if mediaDevices API is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('getUserMedia not supported in this browser/iframe, launching native camera capture');
      triggerNativeCamera();
      return;
    }

    let stream: MediaStream | null = null;

    // Step 1: Try ideal environment/facing mode resolution
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
    } catch (err1: any) {
      console.warn('Initial camera constraint failed, attempting ideal facingMode fallback:', err1);
      // Step 2: Try relaxed facingMode without resolution constraint
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: cameraFacing } },
        });
      } catch (err2: any) {
        console.warn('Relaxed facingMode failed, attempting any available webcam { video: true }:', err2);
        // Step 3: Try generic video: true (works on laptops with single webcam)
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
        } catch (err3: any) {
          console.error('All WebRTC camera constraints failed:', err3);
          // Check if permission was denied or device not found
          setCameraPermissionBlocked(true);
          setErrorMsg(
            language === 'hi'
              ? 'ब्राउज़र या सिस्टम में कैमरा अनुमति नहीं मिली। आप सीधे "डिवाइस कैमरा से फोटो लें" बटन का उपयोग कर सकते हैं।'
              : 'Camera access is blocked or unavailable in this window. You can snap a photo directly using your device camera below.'
          );
          // On mobile or blocked iframes, trigger native camera capture automatically
          triggerNativeCamera();
          return;
        }
      }
    }

    if (stream) {
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((playErr) => {
          console.warn('Video play error:', playErr);
        });
      }
      setIsCameraActive(true);
    }
  };

  const switchCamera = () => {
    const newFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(newFacing);
    // Restart camera with new facing mode
    setTimeout(() => {
      startCamera();
    }, 100);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    stopCameraStream();
    setIsCameraActive(false);
    setSelectedImage(dataUrl);
    setResult(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg(language === 'hi' ? 'कृपया केवल फोटो (JPG, PNG, WEBP) चुनें।' : 'Please select an image file (JPG, PNG, WEBP).');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      stopCameraStream();
      setIsCameraActive(false);
      setSelectedImage(reader.result as string);
      setResult(null);
      setErrorMsg(null);
      setCameraPermissionBlocked(false);
    };
    reader.onerror = () => {
      setErrorMsg(language === 'hi' ? 'फोटो पढ़ने में त्रुटि हुई। कृपया पुनः प्रयास करें।' : 'Error reading photo. Please try again.');
    };
    reader.readAsDataURL(file);
    // Reset value so re-selecting same photo triggers onChange every time
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg(language === 'hi' ? 'कृपया केवल फोटो (JPG, PNG, WEBP) फाइल डालें।' : 'Please drop an image file (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      stopCameraStream();
      setIsCameraActive(false);
      setSelectedImage(reader.result as string);
      setResult(null);
      setErrorMsg(null);
      setCameraPermissionBlocked(false);
    };
    reader.onerror = () => {
      setErrorMsg(language === 'hi' ? 'फोटो पढ़ने में त्रुटि हुई।' : 'Error reading photo.');
    };
    reader.readAsDataURL(file);
  };

  const selectSampleImage = async (sampleUrl: string) => {
    setErrorMsg(null);
    setResult(null);
    stopCameraStream();
    setIsCameraActive(false);
    setSelectedImage(sampleUrl);
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setErrorMsg(null);
    setResult(null);
    stopSpeaking();
    setActiveAudioLang(null);

    try {
      // If selectedImage is an external sample URL, fetch it and convert to base64
      let base64Image = selectedImage;
      if (selectedImage.startsWith('http')) {
        const resp = await fetch(selectedImage);
        const blob = await resp.blob();
        base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }

      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          language,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Crop analysis failed');
      }

      const formattedResult: CropAnalysisResult = {
        id: data.id || 'diag_' + Date.now(),
        timestamp: new Date().toISOString(),
        imageUrl: selectedImage,
        crop: data.crop || (language === 'hi' ? 'पहचानी गई फसल' : 'Identified Crop'),
        problem: data.problem || (language === 'hi' ? 'रोग विश्लेषण' : 'Disease Diagnosis'),
        healthStatus: data.health_status || data.healthStatus || 'moderate',
        confidence: data.confidence || '85%',
        possible_causes: data.possible_causes || [],
        recommendations: data.recommendations || [],
        prevention: data.prevention || [],
        warning: data.warning || '',
        language,
      };

      setResult(formattedResult);
      if (currentUserUid) {
        saveUserScanToCloud(currentUserUid, formattedResult).catch((e) =>
          console.warn('Could not persist scan to Firebase:', e)
        );
      }
      if (onScanSaved) onScanSaved();

      // Audio reading preview for uneducated farmers
      playAudioSummary(formattedResult, language);
    } catch (err: any) {
      console.error('Diagnosis error:', err);
      setErrorMsg(err.message || (language === 'hi' ? 'फसल विश्लेषण में त्रुटि। कृपया पुनः प्रयास करें।' : 'Analysis failed. Please try again.'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const playAudioSummary = (res: CropAnalysisResult, targetLang: 'en' | 'hi') => {
    stopSpeaking();
    if (activeAudioLang === targetLang) {
      setActiveAudioLang(null);
      return;
    }

    const speechScript = targetLang === 'hi'
      ? `पहचानी गई फसल: ${res.crop}। स्थिति: ${res.problem}। मुख्य उपचार: ${res.recommendations.slice(0, 2).join('. ')}। सुरक्षा सलाह: ${res.warning || 'दवा उपयोग से पहले कृषि विशेषज्ञ से सलाह लें।'}`
      : `Crop diagnosed: ${res.crop}. Condition: ${res.problem}. Key recommendation: ${res.recommendations.slice(0, 2).join('. ')}. Safety tip: ${res.warning || 'Consult local expert before chemical application.'}`;

    setActiveAudioLang(targetLang);
    cancelAudioRef.current = speakText(speechScript, targetLang, () => {
      setActiveAudioLang(null);
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {language === 'hi' ? 'स्वस्थ फसल' : 'Healthy Crop'}
          </span>
        );
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            {language === 'hi' ? 'गंभीर रोग' : 'Critical Threat'}
          </span>
        );
      case 'moderate':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            {language === 'hi' ? 'मध्यम समस्या' : 'Moderate Issue'}
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              📸
            </div>
            <h2 className="text-xl font-bold text-slate-900">{t.title}</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">{t.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenExpert()}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-1.5"
          >
            <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
            <span>KVK Helpline: 1800-180-1551</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-amber-950">{errorMsg}</p>
              <p className="text-[11px] text-amber-800 mt-1">
                {language === 'hi'
                  ? 'टिप: यदि लाइव वीडियो ब्लॉक है, तो आप नीचे दिए गए बटन से अपने डिवाइस के कैमरे से तुरंत फोटो खींच सकते हैं:'
                  : 'Tip: If browser permissions or iframe security restricted live streaming, you can snap a photo directly using your device camera or pick an existing photo:'}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <label
                  htmlFor="fieldnerve-camera-input"
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer select-none"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'डिवाइस कैमरा से फोटो खींचें' : 'Snap with Device Camera'}</span>
                </label>
                <label
                  htmlFor="fieldnerve-file-input"
                  className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer select-none"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{language === 'hi' ? 'फाइल/गैलरी से चुनें' : 'Upload from Files'}</span>
                </label>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{language === 'hi' ? 'पुनः प्रयास' : 'Retry Live'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Interaction Area */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Source Selection (Camera / Upload / Samples) */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* Live Camera Viewfinder */}
          {isCameraActive ? (
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video sm:aspect-square flex items-center justify-center border-2 border-emerald-500 shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Scanning reticle overlay */}
              <div className="absolute inset-8 border-2 border-emerald-400/80 rounded-xl pointer-events-none flex items-center justify-center">
                <div className="w-full h-0.5 bg-emerald-400/70 shadow-[0_0_8px_#34d399] animate-bounce" />
              </div>

              {/* Camera Controls Bar */}
              <div className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-2 z-10 bg-slate-950/70 backdrop-blur-md p-2 rounded-xl">
                <button
                  type="button"
                  onClick={switchCamera}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-xs font-medium text-white hover:bg-slate-700"
                >
                  {t.switchCamera}
                </button>
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-5 py-2.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 shadow-lg flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>{t.capturePhoto}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopCameraStream();
                    setIsCameraActive(false);
                  }}
                  className="px-3 py-2 rounded-lg bg-rose-900/80 text-xs font-medium text-rose-200 hover:bg-rose-800"
                >
                  {t.closeCamera}
                </button>
              </div>
            </div>
          ) : selectedImage ? (
            /* Selected Image Preview */
            <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-300 aspect-video sm:aspect-square flex items-center justify-center group">
              <img
                src={selectedImage}
                alt="Selected crop specimen"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <label
                  htmlFor="fieldnerve-file-input"
                  className="px-3 py-1.5 rounded-lg bg-white/95 text-slate-900 text-xs font-semibold shadow hover:bg-white flex items-center gap-1 cursor-pointer select-none"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{language === 'hi' ? 'गैलरी' : 'Files'}</span>
                </label>
                <label
                  htmlFor="fieldnerve-camera-input"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold shadow hover:bg-emerald-500 flex items-center gap-1 cursor-pointer select-none"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'फोटो खींचें' : 'Snap Photo'}</span>
                </label>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold shadow hover:bg-slate-700 flex items-center gap-1"
                >
                  <span>{language === 'hi' ? 'लाइव स्कैनर' : 'Live'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Upload / Camera Hero Box */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center transition-all aspect-video sm:aspect-square ${
                isDragging
                  ? 'border-emerald-600 bg-emerald-100/90 scale-[1.01]'
                  : 'border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50/80'
              }`}
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 shadow-xs">
                <Camera className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                {language === 'hi' ? 'पत्ती या फसल की फोटो लें' : 'Photograph Your Crop Specimen'}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                {language === 'hi'
                  ? 'रोगग्रस्त पत्ती की साफ फोटो लें या चुनें। AI तुरंत बीमारी और सटीक उपचार बताएगा।'
                  : 'Take or choose a clear close-up of leaf spots. AI provides instant disease identification & remedies.'}
              </p>

              {/* Multi-mode Camera & Upload Buttons (Native labels for 100% reliable opening) */}
              <div className="mt-4 sm:mt-5 flex flex-wrap items-center justify-center gap-2">
                {/* 1. Native Direct Camera (Opens native device camera without WebRTC permissions) */}
                <label
                  htmlFor="fieldnerve-camera-input"
                  className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-transform active:scale-95 cursor-pointer select-none"
                >
                  <Camera className="w-4 h-4" />
                  <span>{language === 'hi' ? 'कैमरे से फोटो लें' : 'Snap Photo (Camera)'}</span>
                </label>

                {/* 2. Gallery / File Picker */}
                <label
                  htmlFor="fieldnerve-file-input"
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer select-none"
                >
                  <Upload className="w-4 h-4 text-emerald-700" />
                  <span>{language === 'hi' ? 'गैलरी / फाइल से चुनें' : 'Upload from Gallery'}</span>
                </label>

                {/* 3. Live WebRTC Stream with progressive fallback */}
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-transform active:scale-95"
                >
                  <span>{language === 'hi' ? 'लाइव वीडियो स्कैनर' : 'Live Scanner'}</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-400 mt-3 hidden sm:inline-block">
                {language === 'hi' ? 'या फोटो को यहां ड्रैग और ड्रॉप करें' : 'or drag & drop your crop photo here'}
              </span>
            </div>
          )}

          {/* Standard File Picker (sr-only ensures browser activates via label with 100% reliability) */}
          <input
            id="fieldnerve-file-input"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
          />

          {/* Native Device Camera Capture */}
          <input
            id="fieldnerve-camera-input"
            ref={nativeCameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={handleFileChange}
          />

          {/* Action Button: Diagnose */}
          {selectedImage && !isCameraActive && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={analyzeImage}
                disabled={isAnalyzing}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t.analyzing}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{t.diagnoseBtn}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  setResult(null);
                }}
                className="px-3.5 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-600"
              >
                Reset
              </button>
            </div>
          )}

          {/* Sample Pictures Section (Instant Click-to-Test for Judges/Farmers) */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-600 mb-2">{t.sampleLabel}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SAMPLE_IMAGES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectSampleImage(sample.url)}
                  className="flex flex-col items-center p-1.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left group"
                >
                  <img
                    src={sample.url}
                    alt={sample.name}
                    className="w-full h-14 object-cover rounded-lg mb-1"
                  />
                  <span className="text-[11px] font-semibold text-slate-800 line-clamp-1 group-hover:text-emerald-700">
                    {language === 'hi' && sample.nameHi ? sample.nameHi : sample.name}
                  </span>
                  <span className="text-[10px] text-slate-500 line-clamp-1">
                    {sample.crop}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Agricultural Diagnosis Card */}
        <div className="lg:col-span-6 flex flex-col">
          {result ? (
            <div className="flex-1 rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50/40 via-white to-slate-50 p-5 flex flex-col justify-between shadow-sm">
              <div>
                {/* Result Title and Badges */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-emerald-100">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-bold text-emerald-700">
                      🌾 {result.crop}
                    </span>
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
                      {result.problem}
                    </h3>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {getStatusBadge(result.healthStatus)}
                    <span className="text-[11px] font-medium text-slate-500">
                      Confidence: {result.confidence}
                    </span>
                  </div>
                </div>

                {/* Audio Reader Toolbar (Crucial for uneducated farmers!) */}
                <div className="my-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-xs">
                      🔊
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-950">
                        {language === 'hi' ? 'सलाह आवाज़ में सुनें' : 'Listen Aloud to Diagnosis'}
                      </p>
                      <p className="text-[10px] text-amber-700">
                        {language === 'hi' ? 'उपचार सुनने के लिए प्ले करें' : 'Tap to hear remedies read aloud'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/* Listen in English Button */}
                    <button
                      type="button"
                      onClick={() => playAudioSummary(result, 'en')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-all ${
                        activeAudioLang === 'en'
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                      title="Listen aloud in English"
                    >
                      {activeAudioLang === 'en' ? (
                        <>
                          <Square className="w-3 h-3" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-sky-600" />
                          <span>Listen (EN)</span>
                        </>
                      )}
                    </button>

                    {/* Listen in Hindi Button */}
                    <button
                      type="button"
                      onClick={() => playAudioSummary(result, 'hi')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-all ${
                        activeAudioLang === 'hi'
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-emerald-700 text-white hover:bg-emerald-800'
                      }`}
                      title="उपचार हिंदी में सुनें"
                    >
                      {activeAudioLang === 'hi' ? (
                        <>
                          <Square className="w-3 h-3" />
                          <span>रोकें</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-emerald-200" />
                          <span>हिंदी में सुनें</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Recommendations (Remedies) */}
                <div className="mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{t.recommendations}</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {result.recommendations.map((item, idx) => (
                      <li
                        key={idx}
                        className="text-xs sm:text-sm text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200 flex items-start gap-2 shadow-2xs"
                      >
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Causes & Prevention */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.possible_causes && result.possible_causes.length > 0 && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <p className="text-xs font-bold text-slate-700 mb-1.5">{t.possibleCauses}</p>
                      <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                        {result.possible_causes.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.prevention && result.prevention.length > 0 && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <p className="text-xs font-bold text-slate-700 mb-1.5">{t.prevention}</p>
                      <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                        {result.prevention.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Safety Warning */}
                {result.warning && (
                  <div className="mt-4 p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span className="leading-normal">{result.warning}</span>
                  </div>
                )}
              </div>

              {/* Bottom Escalation Action */}
              <div className="mt-5 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onOpenExpert(result.crop, `${result.problem}: ${result.recommendations[0] || ''}`)}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1.5 underline underline-offset-4"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{t.escalateToExpert}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setResult(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800"
                >
                  {t.newScan}
                </button>
              </div>
            </div>
          ) : (
            /* Empty State / Instruction Graphic */
            <div className="flex-1 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl mb-3">
                🌿
              </div>
              <h4 className="text-base font-bold text-slate-800">
                {language === 'hi' ? 'फसल डॉक्टर सहायता कक्ष' : 'Awaiting Leaf Photo'}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                {language === 'hi'
                  ? 'बाएं ओर अपने पत्ते या फसल की फोटो अपलोड करें या कैमरे से खींचें। एआई तुरंत रोग पहचान कर सही दवा व उपाय बताएगा।'
                  : 'Upload or capture a close-up photo on the left. Gemini Agriculture AI will analyze leaf discolorations, fungus spots, and insect bites.'}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2 text-left max-w-xs w-full">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-700">
                  <span className="font-bold text-emerald-700 block">1. Clear Light</span>
                  Take photo in daylight
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-700">
                  <span className="font-bold text-emerald-700 block">2. Close Up</span>
                  Focus on infected leaves
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
