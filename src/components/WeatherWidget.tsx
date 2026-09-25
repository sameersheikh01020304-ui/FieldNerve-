import React, { useState, useEffect } from 'react';
import {
  CloudRain,
  Sun,
  Wind,
  Droplets,
  Thermometer,
  Search,
  MapPin,
  RefreshCw,
  Volume2,
  Square,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { Language, WeatherData } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { speakText, stopSpeaking } from '../utils/speech';

interface WeatherWidgetProps {
  language: Language;
  onWeatherDataLoaded?: (data: WeatherData) => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  language,
  onWeatherDataLoaded,
}) => {
  const [cityInput, setCityInput] = useState<string>('Nagpur');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeAudioLang, setActiveAudioLang] = useState<'en' | 'hi' | null>(null);

  const t = TRANSLATIONS[language].weather;

  const fetchWeather = async (city: string, lat?: number, lon?: number) => {
    setIsLoading(true);
    setErrorMsg(null);
    stopSpeaking();
    setActiveAudioLang(null);

    try {
      let url = `/api/weather?city=${encodeURIComponent(city)}&lang=${language}`;
      if (lat !== undefined && lon !== undefined) {
        url += `&lat=${lat}&lon=${lon}`;
      }

      let formatted: WeatherData | null = null;
      try {
        const res = await fetch(url);
        if (res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await res.json();
            if (data.success) {
              formatted = {
                city: data.city || city,
                state: data.state || 'India',
                latitude: typeof data.latitude === 'number' ? data.latitude : 21.1458,
                longitude: typeof data.longitude === 'number' ? data.longitude : 79.0882,
                temperature: data.temperature || 30,
                humidity: data.humidity || 55,
                rainProbability: data.rainProbability || data.rain_probability || 20,
                windSpeed: data.windSpeed || data.wind_speed || 10,
                condition: data.condition || 'Partly Cloudy',
                icon: data.icon || 'partly-cloudy',
                agriAdvisory: data.agriAdvisory || data.agri_advisory || {
                  irrigation: 'Regular irrigation recommended.',
                  spraying: 'Safe weather for spraying.',
                  harvest: 'Favorable harvesting conditions.',
                },
              };
            }
          }
        }
      } catch (networkErr) {
        // Expected when statically hosted on GitHub Pages
      }

      // If backend API is not running (e.g. GitHub Pages static hosting), use regional agronomic preset
      if (!formatted) {
        const isHi = language === 'hi';
        formatted = {
          city: city || 'Nagpur',
          state: 'Maharashtra',
          latitude: 21.1458,
          longitude: 79.0882,
          temperature: 31,
          humidity: 58,
          rainProbability: 25,
          windSpeed: 12,
          condition: isHi ? 'आंशिक बादल (Partly Cloudy)' : 'Partly Cloudy',
          icon: 'partly-cloudy',
          agriAdvisory: {
            irrigation: isHi
              ? 'वर्तमान आर्द्रता सामान्य है। शाम के समय हल्की सिंचाई करें।'
              : 'Moderate humidity. Light furrow irrigation advised in evening hours.',
            spraying: isHi
              ? 'हवा की गति 12 किमी/घंटा है। सुबह 9 बजे से पहले कीटनाशक छिड़काव उपयुक्त।'
              : 'Wind speed 12 km/h. Suitable for foliar spray before 9:00 AM.',
            harvest: isHi
              ? 'फसल कटाई और सुखाने के लिए मौसम अनुकूल है।'
              : 'Weather is favorable for harvesting and grain drying.',
          },
        };
      }

      setWeather(formatted);
      if (onWeatherDataLoaded) {
        onWeatherDataLoaded(formatted);
      }
    } catch (err: any) {
      console.warn('Weather fetch fallback error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather('Nagpur');
  }, [language]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput.trim()) {
      fetchWeather(cityInput.trim());
    }
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeather('My Field', pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setIsLoading(false);
        setErrorMsg('GPS location access denied or unavailable: ' + err.message);
      }
    );
  };

  const playWeatherAudio = (targetLang: 'en' | 'hi') => {
    stopSpeaking();
    if (activeAudioLang === targetLang) {
      setActiveAudioLang(null);
      return;
    }

    if (weather) {
      const speech = targetLang === 'hi'
        ? `${weather.city} में तापमान ${weather.temperature} डिग्री सेल्सियस है और नमी ${weather.humidity} प्रतिशत है। बारिश की संभावना ${weather.rainProbability} प्रतिशत है। सिंचाई सलाह: ${weather.agriAdvisory.irrigation}। कीटनाशक छिड़काव सलाह: ${weather.agriAdvisory.spraying}।`
        : `At ${weather.city}, temperature is ${weather.temperature} degrees Celsius, humidity is ${weather.humidity} percent, and rain probability is ${weather.rainProbability} percent. Irrigation advisory: ${weather.agriAdvisory.irrigation}. Spraying advisory: ${weather.agriAdvisory.spraying}.`;

      setActiveAudioLang(targetLang);
      speakText(speech, targetLang, () => {
        setActiveAudioLang(null);
      });
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
      {/* Header & City Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              🌦️
            </div>
            <h2 className="text-xl font-bold text-slate-900">{t.title}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">{t.subtitle}</p>
        </div>

        {/* Search & GPS Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={handleSearch} className="flex items-center gap-1.5">
            <div className="relative">
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs w-48 sm:w-56 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 disabled:opacity-50"
            >
              {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : t.searchBtn}
            </button>
          </form>

          <button
            type="button"
            onClick={handleUseGps}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1"
            title={t.useGps}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">GPS</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Weather Metrics Grid */}
      {weather && (
        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Temperature */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                <Thermometer className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase">{t.tempLabel}</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900">{weather.temperature}°C</p>
                <p className="text-[10px] text-amber-700 font-medium">{weather.condition}</p>
              </div>
            </div>

            {/* Humidity */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-700 flex items-center justify-center shrink-0">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase">{t.humidityLabel}</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900">{weather.humidity}%</p>
                <p className="text-[10px] text-sky-700 font-medium">Relative humidity</p>
              </div>
            </div>

            {/* Rain Probability */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-700 flex items-center justify-center shrink-0">
                <CloudRain className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase">{t.rainLabel}</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900">{weather.rainProbability}%</p>
                <p className="text-[10px] text-blue-700 font-medium">
                  {weather.rainProbability > 50 ? 'Rain Expected' : 'Dry Forecast'}
                </p>
              </div>
            </div>

            {/* Wind Speed */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-700 flex items-center justify-center shrink-0">
                <Wind className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase">{t.windLabel}</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900">{weather.windSpeed} km/h</p>
                <p className="text-[10px] text-teal-700 font-medium">Calm to Moderate</p>
              </div>
            </div>
          </div>

          {/* Actionable Agricultural Advisory Card */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-emerald-200/60">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">{t.agriAdvisoryTitle}</h3>
                <span className="text-xs text-slate-500">
                  📍 {weather.city} ({weather.state})
                </span>
              </div>

              {/* Dual Audio Listen Buttons for Farmers */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => playWeatherAudio('en')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-all ${
                    activeAudioLang === 'en'
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                  title="Listen aloud in English"
                >
                  {activeAudioLang === 'en' ? (
                    <>
                      <Square className="w-3.5 h-3.5" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-sky-600" />
                      <span>Listen (EN)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => playWeatherAudio('hi')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-all ${
                    activeAudioLang === 'hi'
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-emerald-700 text-white hover:bg-emerald-800'
                  }`}
                  title="मौसम सलाह हिंदी में सुनें"
                >
                  {activeAudioLang === 'hi' ? (
                    <>
                      <Square className="w-3.5 h-3.5" />
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

            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Irrigation Advisory */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-bold text-sky-800 mb-1 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-sky-600" />
                  <span>{t.irrigationTitle}</span>
                </p>
                <p className="text-xs text-slate-700 leading-relaxed">{weather.agriAdvisory.irrigation}</p>
              </div>

              {/* Spraying Window */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-bold text-amber-800 mb-1 flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t.sprayingTitle}</span>
                </p>
                <p className="text-xs text-slate-700 leading-relaxed">{weather.agriAdvisory.spraying}</p>
              </div>

              {/* Harvesting Advisory */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-bold text-emerald-800 mb-1 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.harvestTitle}</span>
                </p>
                <p className="text-xs text-slate-700 leading-relaxed">{weather.agriAdvisory.harvest}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
