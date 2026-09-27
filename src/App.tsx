import React, { useState, useEffect } from 'react';
import {
  Camera,
  MessageSquareText,
  CloudSun,
  Boxes,
  PhoneCall,
  Terminal,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Volume2,
  User as UserIcon,
  Cloud,
  CheckCircle2,
  TrendingUp,
  Lock,
  Bell,
  CloudRain
} from 'lucide-react';
import { onAuthStateChanged, type User } from 'firebase/auth';

import { Language, WeatherData, UserProfile, FarmerNotificationItem } from './types';
import { TRANSLATIONS } from './data/translations';
import { Navbar } from './components/Navbar';
import { FarmCanvas3D } from './components/FarmCanvas3D';
import { CropScanner } from './components/CropScanner';
import { AgriChat } from './components/AgriChat';
import { WeatherWidget } from './components/WeatherWidget';
import { ExpertModal } from './components/ExpertModal';
import { HistoryModal } from './components/HistoryModal';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { AdminPortal } from './components/AdminPortal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { CropGrowthProjection } from './components/CropGrowthProjection';
import { NotificationModal } from './components/NotificationModal';
import {
  registerMessagingServiceWorker,
  setupFCMForegroundListener,
  fetchFarmerNotifications
} from './lib/fcmService';
import { auth, getUserProfile, saveUserProfile, ADMIN_INFO, isAdminUser } from './lib/firebase';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<'scanner' | 'chat' | 'weather' | 'threed' | 'growth'>('scanner');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  // Admin Portal State (Sameer Sheikh)
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState<boolean>(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);
  const [adminSessionVerified, setAdminSessionVerified] = useState<boolean>(() => {
    return typeof window !== 'undefined' && sessionStorage.getItem('fieldnerve_admin_verified') === 'true';
  });

  const isCurrentAdmin =
    isAdminUser(currentUser?.email) ||
    userProfile?.role === 'admin' ||
    adminSessionVerified;

  const [isExpertModalOpen, setIsExpertModalOpen] = useState<boolean>(false);
  const [expertInitialCrop, setExpertInitialCrop] = useState<string>('');
  const [expertInitialProblem, setExpertInitialProblem] = useState<string>('');

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);

  // Push Notification Service States
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const [incomingPushToast, setIncomingPushToast] = useState<FarmerNotificationItem | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  const t = TRANSLATIONS[language];

  // Initialize notifications & FCM service listeners
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Register Firebase Messaging Service Worker
    registerMessagingServiceWorker();

    // Listen for real-time foreground push alerts
    const unsubscribeFCM = setupFCMForegroundListener((incoming) => {
      setIncomingPushToast(incoming);
      setUnreadNotificationsCount((prev) => prev + 1);
      // Auto dismiss in-app toast after 6 seconds
      setTimeout(() => {
        setIncomingPushToast((curr) => (curr?.id === incoming.id ? null : curr));
      }, 6000);
    });

    // Fetch initial notifications unread count
    fetchFarmerNotifications(currentUser?.uid || 'guest_farmer').then((items) => {
      setUnreadNotificationsCount(items.filter((n) => !n.read).length);
    });

    return () => {
      unsubscribeFCM();
    };
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthChecked(true);

      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          const isUserAdmin = isAdminUser(user.email);
          if (profile) {
            if (isUserAdmin && profile.role !== 'admin') {
              const updated = { ...profile, role: 'admin' as const, name: ADMIN_INFO.name, phone: ADMIN_INFO.phone };
              await saveUserProfile(updated);
              setUserProfile(updated);
            } else {
              setUserProfile(profile);
            }
          } else {
            const newProfile: UserProfile = {
              uid: user.uid,
              name: isUserAdmin ? ADMIN_INFO.name : (user.displayName || 'Farmer'),
              email: user.email || '',
              phone: isUserAdmin ? ADMIN_INFO.phone : (user.phoneNumber || ''),
              village: isUserAdmin ? 'Central Operations HQ' : 'Local Village',
              state: isUserAdmin ? 'All India' : 'India',
              crops: isUserAdmin ? ['Operations Lead'] : ['Wheat', 'Rice'],
              preferredLanguage: language,
              role: isUserAdmin ? 'admin' : 'farmer',
              status: 'active',
              createdAt: new Date().toISOString(),
            };
            await saveUserProfile(newProfile);
            setUserProfile(newProfile);
          }
        } catch (e) {
          console.error('Profile fetch error:', e);
        }
      } else {
        // Check if user has an offline/instant farmer profile
        try {
          const cachedKisan = localStorage.getItem('fieldnerve_kisan_profile');
          if (cachedKisan) {
            setUserProfile(JSON.parse(cachedKisan));
          } else {
            setUserProfile(null);
            const hasPrompted = sessionStorage.getItem('fieldnerve_auth_prompted');
            if (!hasPrompted) {
              sessionStorage.setItem('fieldnerve_auth_prompted', 'true');
              setIsAuthModalOpen(true);
            }
          }
        } catch {
          setUserProfile(null);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleOpenExpert = (cropName?: string, problemDesc?: string) => {
    setExpertInitialCrop(cropName || '');
    setExpertInitialProblem(problemDesc || '');
    setIsExpertModalOpen(true);
  };

  const handleOpenAdmin = () => {
    if (adminSessionVerified) {
      setIsAdminPortalOpen(true);
    } else {
      setIsAdminAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-100">
      {/* Navigation Header */}
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenExpert={() => handleOpenExpert()}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        unreadNotificationsCount={unreadNotificationsCount}
        currentUser={currentUser}
        userProfile={userProfile}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        isAdmin={adminSessionVerified}
      />

      {/* Real-time Floating Push Alert Toast */}
      {incomingPushToast && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/40 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  {incomingPushToast.type === 'weather_alert' ? 'Weather Warning' : 'Crop Reminder'}
                </span>
                <h5 className="text-xs font-bold text-white mt-0.5">
                  {language === 'hi' && incomingPushToast.titleHi ? incomingPushToast.titleHi : incomingPushToast.title}
                </h5>
                <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                  {language === 'hi' && incomingPushToast.bodyHi ? incomingPushToast.bodyHi : incomingPushToast.body}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIncomingPushToast(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-end">
            <button
              type="button"
              onClick={() => {
                setIncomingPushToast(null);
                setIsNotificationModalOpen(true);
              }}
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline"
            >
              {language === 'hi' ? 'विवरण देखें' : 'View Full Alert'}
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Admin Quick Launch Bar for Sameer Sheikh (Only after master password verification) */}
        {adminSessionVerified && (
          <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-xs shadow-xs">
                🛡️
              </div>
              <div className="text-xs">
                <div className="font-bold flex items-center gap-1.5">
                  <span>Welcome Admin, {ADMIN_INFO.name}</span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded">
                    SUPER ADMIN
                  </span>
                </div>
                <div className="text-slate-300 text-[11px] mt-0.5">
                  {ADMIN_INFO.email} • Phone: +91 {ADMIN_INFO.phone} • Authorized Session
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setIsAdminPortalOpen(true)}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Open Admin Portal</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdminSessionVerified(false);
                  sessionStorage.removeItem('fieldnerve_admin_verified');
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-all border border-slate-600 cursor-pointer"
                title="Lock session"
              >
                Lock
              </button>
            </div>
          </div>
        )}

        {/* Farmer Cloud Status Pill */}
        {currentUser ? (
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                🌾
              </div>
              <div className="text-xs">
                <span className="font-bold text-emerald-950">
                  {language === 'hi' ? 'स्वागत है' : 'Welcome'}, {userProfile?.name || 'Farmer'}
                </span>
                <span className="text-emerald-700 ml-1.5 font-medium">
                  • {userProfile?.village || 'My Farm'} {userProfile?.crops?.length ? `(${userProfile.crops.slice(0, 2).join(', ')})` : ''}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200">
                <Cloud className="w-3 h-3 text-emerald-600" />
                <span>{language === 'hi' ? 'क्लाउड सिंक सक्रिय' : 'Firebase Synced'}</span>
              </span>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline underline-offset-2"
              >
                {language === 'hi' ? 'प्रोफ़ाइल देखें' : 'View Profile'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2 text-xs text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                {language === 'hi'
                  ? 'अपनी फसल जांच व सवाल क्लाउड में सुरक्षित रखने के लिए कृपया लॉगिन करें।'
                  : 'Sign in to save your crop leaf scans and Q&A history securely to Firebase cloud.'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-2xs self-start sm:self-auto"
            >
              {language === 'hi' ? 'लॉगिन / साइन-अप करें' : 'Sign In / Register'}
            </button>
          </div>
        )}

        {/* Weather Alerts & Crop Push Notification Prompt Banner */}
        {notificationPermission !== 'granted' && (
          <div className="bg-gradient-to-r from-sky-50 via-emerald-50 to-teal-50 border border-sky-200 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                <Bell className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-sky-950">
                  {language === 'hi' ? 'खेत मौसम व फसल स्वास्थ्य अलर्ट' : 'Weather & Crop Health Push Alerts'}
                </span>
                <span className="text-slate-600 ml-1.5 hidden sm:inline">
                  {language === 'hi'
                    ? 'असामयिक वर्षा व कीट प्रकोप की सूचना सीधे फोन पर पाने के लिए पुश सर्विस चालू करें।'
                    : 'Get real-time push notifications for rain warnings & crop care.'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsNotificationModalOpen(true)}
              className="px-3 py-1 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold transition-all shadow-2xs self-start sm:self-auto flex items-center gap-1.5 cursor-pointer"
            >
              <Bell className="w-3 h-3" />
              <span>{language === 'hi' ? 'अलर्ट चालू करें' : 'Enable Alerts'}</span>
            </button>
          </div>
        )}

        {/* Clean, Decongested Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-3 pt-1 pb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.hero.badge}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            {t.hero.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {t.hero.subtitle}
          </p>

          {/* Quick Feature Selection Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-3 text-left">
            <button
              type="button"
              onClick={() => setActiveTab('scanner')}
              className={`p-3.5 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                activeTab === 'scanner'
                  ? 'bg-white border-emerald-600 shadow-sm ring-1 ring-emerald-600'
                  : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeTab === 'scanner' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Camera className="w-4 h-4" />
                </div>
                <ChevronRight className={`w-4 h-4 ${activeTab === 'scanner' ? 'text-emerald-600' : 'text-slate-400'}`} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">{t.tabs.cropDoctor}</h3>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {language === 'hi' ? 'फोटो से रोग पहचानें' : 'Photo leaf diagnosis'}
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`p-3.5 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-white border-emerald-600 shadow-sm ring-1 ring-emerald-600'
                  : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeTab === 'chat' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  <MessageSquareText className="w-4 h-4" />
                </div>
                <ChevronRight className={`w-4 h-4 ${activeTab === 'chat' ? 'text-emerald-600' : 'text-slate-400'}`} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">{t.tabs.agriChat}</h3>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {language === 'hi' ? 'बोलकर या लिखकर पूछें' : 'Voice & text answers'}
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('weather')}
              className={`p-3.5 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                activeTab === 'weather'
                  ? 'bg-white border-sky-600 shadow-sm ring-1 ring-sky-600'
                  : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeTab === 'weather' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  <CloudSun className="w-4 h-4" />
                </div>
                <ChevronRight className={`w-4 h-4 ${activeTab === 'weather' ? 'text-sky-600' : 'text-slate-400'}`} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">{t.tabs.climate}</h3>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {language === 'hi' ? 'मौसम व कृषि सलाह' : 'Weather & advisories'}
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('threed')}
              className={`p-3.5 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                activeTab === 'threed'
                  ? 'bg-white border-indigo-600 shadow-sm ring-1 ring-indigo-600'
                  : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeTab === 'threed' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Boxes className="w-4 h-4" />
                </div>
                <ChevronRight className={`w-4 h-4 ${activeTab === 'threed' ? 'text-indigo-600' : 'text-slate-400'}`} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">{t.tabs.threeD}</h3>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {language === 'hi' ? '3D व एरियल खेत' : '3D & Aerial View'}
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('growth')}
              className={`p-3.5 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer col-span-2 sm:col-span-1 ${
                activeTab === 'growth'
                  ? 'bg-white border-teal-600 shadow-sm ring-1 ring-teal-600'
                  : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeTab === 'growth' ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  <TrendingUp className="w-4 h-4" />
                </div>
                <ChevronRight className={`w-4 h-4 ${activeTab === 'growth' ? 'text-teal-600' : 'text-slate-400'}`} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">{t.tabs.growth}</h3>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {language === 'hi' ? 'उपज व विकास रुझान' : 'Yield Trends & NDVI'}
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* Primary Interactive Workspace */}
        <section className="transition-all duration-150">
          {activeTab === 'growth' && (
            <CropGrowthProjection language={language} />
          )}
          {activeTab === 'scanner' && (
            <CropScanner
              language={language}
              onOpenExpert={handleOpenExpert}
              currentUserUid={currentUser?.uid}
            />
          )}

          {activeTab === 'chat' && (
            <AgriChat
              language={language}
              onOpenExpert={handleOpenExpert}
              currentUserUid={currentUser?.uid}
            />
          )}

          {activeTab === 'weather' && (
            <WeatherWidget
              language={language}
              onWeatherDataLoaded={(data) => setWeatherData(data)}
            />
          )}

          {activeTab === 'threed' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Boxes className="w-5 h-5 text-indigo-600" />
                    <span>{t.threeD.title}</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    {t.threeD.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md">
                    {t.threeD.hint}
                  </span>
                </div>
              </div>

              {/* Spacious 3D Interactive Canvas */}
              <div className="h-[460px] sm:h-[520px] w-full rounded-2xl overflow-hidden border border-slate-200">
                <FarmCanvas3D
                  language={language}
                  rainProbability={weatherData?.rainProbability ?? 20}
                />
              </div>
            </div>
          )}
        </section>

        {/* Crop Growth Projection Quick Widget (When on other tabs) */}
        {activeTab !== 'growth' && (
          <section className="mt-8 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white p-4 sm:p-5 rounded-2xl border border-emerald-500/30 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-xs">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">
                    {language === 'hi' ? 'फसल विकास व उपज पूर्वानुमान विजेट (2021-2026)' : 'Crop Growth & Predictive Yield Widget'}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    Recharts AI
                  </span>
                </div>
                <p className="text-xs text-emerald-100/70 mt-0.5">
                  {language === 'hi'
                    ? 'स्थानीय ऐतिहासिक डेटा व मौसम के अनुसार आगामी कटाई लक्ष्य: 24.1 क्विंटल/एकड़ (+25.3% लाभ)'
                    : 'Target yield based on historical regional trends: 24.1 Qtl/Acre (+25.3% AI Boost)'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveTab('growth');
                window.scrollTo({ top: 380, behavior: 'smooth' });
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 self-stretch sm:self-auto justify-center cursor-pointer shrink-0"
            >
              <span>{language === 'hi' ? '📊 संपूर्ण विकास डैशबोर्ड खोलें' : '📊 View Yield Dashboard'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </section>
        )}
      </main>

      {/* Clean, Non-intrusive Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-800">FieldNerve</span>
            <span>•</span>
            <span>Agriculture AI & Crop Health Intelligence</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <a
              href="tel:18001801551"
              className="hover:text-emerald-700 font-medium transition-colors text-slate-600"
            >
              Helpline: 1800-180-1551
            </a>
            <span>•</span>
            <span>Privacy & Agronomy Terms</span>
            <span>•</span>
            {/* Discrete, secured at the very last for Authorized Administrator */}
            <button
              type="button"
              onClick={handleOpenAdmin}
              className="text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
              title="Restricted Access"
            >
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Admin Console</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Admin Portal Modal (Sameer Sheikh) */}
      <AdminPortal
        isOpen={isAdminPortalOpen}
        onClose={() => setIsAdminPortalOpen(false)}
        currentAdminEmail={currentUser?.email || undefined}
        onSwitchToFarmerMode={() => setIsAdminPortalOpen(false)}
        onLockSession={() => {
          setAdminSessionVerified(false);
          sessionStorage.removeItem('fieldnerve_admin_verified');
          setIsAdminPortalOpen(false);
        }}
      />

      {/* Admin Security Verification Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onAdminAuthenticated={() => {
          setAdminSessionVerified(true);
          setIsAdminPortalOpen(true);
        }}
      />

      {/* Farmer Sign In / Sign Up Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        language={language}
        onSuccess={(profile) => {
          setUserProfile(profile);
          setIsAuthModalOpen(false);
        }}
      />

      {/* Farmer Profile & Field Details Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        language={language}
        profile={userProfile}
        onProfileUpdated={(updated) => setUserProfile(updated)}
        onSignOut={() => {
          setUserProfile(null);
          setCurrentUser(null);
        }}
      />

      {/* Krishi Vigyan Kendra (KVK) Escalation Modal */}
      <ExpertModal
        isOpen={isExpertModalOpen}
        onClose={() => setIsExpertModalOpen(false)}
        language={language}
        initialCropName={expertInitialCrop}
        initialProblemDesc={expertInitialProblem}
      />

      {/* History Drawer / Modal with Cloud Sync */}
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        language={language}
        currentUserUid={currentUser?.uid}
      />

      {/* Push Notification Service Modal (FCM Weather Alerts & Crop Health Reminders) */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        language={language}
        userId={currentUser?.uid || 'guest_farmer'}
        onNotificationsUpdated={(unread) => setUnreadNotificationsCount(unread)}
      />
    </div>
  );
}
