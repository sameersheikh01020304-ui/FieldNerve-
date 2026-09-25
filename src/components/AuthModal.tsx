import React, { useState } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Wheat,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, saveUserProfile, getUserProfile } from '../lib/firebase';
import { Language, UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSuccess: (profile: UserProfile) => void;
}

// Helper to format input into a valid Firebase Auth email
// Allows farmers to enter standard email OR 10-digit mobile number seamlessly
const formatAuthEmail = (
  input: string
): { authEmail: string; isValid: boolean; isPhone: boolean; phoneDigits: string } => {
  const cleaned = input.trim().toLowerCase();
  if (!cleaned) return { authEmail: '', isValid: false, isPhone: false, phoneDigits: '' };

  // Check if input is a 10-12 digit phone number (e.g. 7521011565 or +917521011565)
  const phoneDigits = cleaned.replace(/[\s\-+()]/g, '');
  if (/^\d{10,12}$/.test(phoneDigits)) {
    const standardMobile = phoneDigits.slice(-10);
    return {
      authEmail: `${standardMobile}@kisan.fieldnerve.com`,
      isValid: true,
      isPhone: true,
      phoneDigits: standardMobile,
    };
  }

  // Standard email validation (e.g., kisan@gmail.com)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (emailRegex.test(cleaned)) {
    return {
      authEmail: cleaned,
      isValid: true,
      isPhone: false,
      phoneDigits: '',
    };
  }

  return {
    authEmail: cleaned,
    isValid: false,
    isPhone: false,
    phoneDigits: '',
  };
};

// Friendly translated error messages for all Firebase Auth error codes
const getFriendlyAuthError = (err: any, lang: Language): string => {
  const code = err?.code || '';
  if (code === 'auth/invalid-email') {
    return lang === 'hi'
      ? 'अमान्य ईमेल या मोबाइल नंबर। कृपया सही ईमेल (उदा. kisan@gmail.com) या 10 अंकों का मोबाइल नंबर दर्ज करें।'
      : 'Invalid email or mobile. Please enter a valid email (e.g. kisan@gmail.com) or 10-digit phone number.';
  }
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
    return lang === 'hi'
      ? 'गलत ईमेल/मोबाइल नंबर या पासवर्ड। कृपया दोबारा जांचें।'
      : 'Incorrect email/phone or password. Please try again.';
  }
  if (code === 'auth/user-not-found') {
    return lang === 'hi'
      ? 'इस खाते का कोई रिकॉर्ड नहीं मिला। कृपया पहले नया पंजीकरण (Register) करें।'
      : 'No account found with this email/phone. Please create an account first.';
  }
  if (code === 'auth/email-already-in-use') {
    return lang === 'hi'
      ? 'यह ईमेल या मोबाइल नंबर पहले से पंजीकृत है। कृपया लॉगिन (Sign In) करें।'
      : 'This email or phone is already registered. Please sign in instead.';
  }
  if (code === 'auth/weak-password') {
    return lang === 'hi'
      ? 'पासवर्ड बहुत कमजोर है। कृपया कम से कम 6 अक्षरों का सुरक्षित पासवर्ड चुनें।'
      : 'Password is too weak. Please choose at least 6 characters.';
  }
  if (code === 'auth/network-request-failed') {
    return lang === 'hi'
      ? 'नेटवर्क त्रुटि। कृपया इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।'
      : 'Network error. Please check your internet connection and retry.';
  }
  if (code === 'auth/too-many-requests') {
    return lang === 'hi'
      ? 'सुरक्षा के लिए कुछ समय के लिए प्रयास रोके गए हैं। कृपया थोड़ी देर बाद प्रयास करें।'
      : 'Too many attempts. Access is temporarily restricted. Please try again shortly.';
  }
  return (
    err?.message ||
    (lang === 'hi'
      ? 'प्रमाणीकरण में त्रुटि हुई। कृपया पुनः प्रयास करें।'
      : 'An authentication error occurred. Please try again.')
  );
};

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  language,
  onSuccess,
}) => {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);

  // Form states
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [village, setVillage] = useState<string>('');
  const [state, setState] = useState<string>('Haryana');
  const [crops, setCrops] = useState<string>('Wheat, Rice');

  if (!isOpen) return null;

  const resetForm = () => {
    setError(null);
    setSuccessMsg(null);
    setShowForgotPassword(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const { authEmail, isValid } = formatAuthEmail(email);
    if (!isValid) {
      setError(
        language === 'hi'
          ? 'कृपया एक मान्य ईमेल पता (उदा. kisan@gmail.com) या 10 अंकों का मोबाइल नंबर दर्ज करें।'
          : 'Please enter a valid email address (e.g. kisan@gmail.com) or 10-digit mobile number.'
      );
      return;
    }

    if (!password) {
      setError(language === 'hi' ? 'कृपया अपना पासवर्ड दर्ज करें।' : 'Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, authEmail, password);
      const user = cred.user;

      const existingProfile = await getUserProfile(user.uid);
      let profile: UserProfile;

      if (existingProfile) {
        profile = existingProfile;
      } else {
        profile = {
          uid: user.uid,
          name: user.displayName || name || 'Farmer',
          email: user.email || (email.includes('@') ? email : `${user.uid.slice(0, 8)}@kisan.fieldnerve.com`),
          phone: user.phoneNumber || phone,
          village: village || 'Local Village',
          state: state || 'India',
          crops: crops.split(',').map((c) => c.trim()).filter(Boolean),
          preferredLanguage: language,
          createdAt: new Date().toISOString(),
        };
        await saveUserProfile(profile);
      }

      onSuccess(profile);
      onClose();
    } catch (err: any) {
      console.warn('Sign in notification:', err?.message || err);
      setError(getFriendlyAuthError(err, language));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setError(language === 'hi' ? 'कृपया अपना पूरा नाम दर्ज करें।' : 'Please enter your full name.');
      return;
    }

    const { authEmail, isValid, isPhone, phoneDigits } = formatAuthEmail(email);
    if (!isValid) {
      setError(
        language === 'hi'
          ? 'कृपया एक मान्य ईमेल पता (उदा. kisan@gmail.com) या 10 अंकों का मोबाइल नंबर दर्ज करें।'
          : 'Please enter a valid email address (e.g. kisan@gmail.com) or 10-digit mobile number.'
      );
      return;
    }

    if (password.length < 6) {
      setError(
        language === 'hi'
          ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।'
          : 'Password must be at least 6 characters.'
      );
      return;
    }

    setLoading(true);

    try {
      const cred = await createUserWithEmailAndPassword(auth, authEmail, password);
      const user = cred.user;

      await updateProfile(user, { displayName: name.trim() });

      const parsedCrops = crops
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

      const effectivePhone = phone.trim() || (isPhone ? phoneDigits : '');

      const newProfile: UserProfile = {
        uid: user.uid,
        name: name.trim(),
        email: user.email || authEmail,
        phone: effectivePhone,
        village: village.trim() || 'My Village',
        state: state.trim() || 'India',
        crops: parsedCrops.length > 0 ? parsedCrops : ['Wheat', 'Rice'],
        preferredLanguage: language,
        createdAt: new Date().toISOString(),
      };

      await saveUserProfile(newProfile);
      setSuccessMsg(
        language === 'hi'
          ? 'पंजीकरण सफल! फील्डनर्व में आपका स्वागत है।'
          : 'Registration successful! Welcome to FieldNerve.'
      );
      setTimeout(() => {
        onSuccess(newProfile);
        onClose();
      }, 700);
    } catch (err: any) {
      console.warn('Sign up notification:', err?.message || err);
      setError(getFriendlyAuthError(err, language));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const existingProfile = await getUserProfile(user.uid);
      let profile: UserProfile;

      if (existingProfile) {
        profile = existingProfile;
      } else {
        profile = {
          uid: user.uid,
          name: user.displayName || 'Farmer',
          email: user.email || '',
          phone: user.phoneNumber || '',
          village: 'Kisan Kendra',
          state: 'India',
          crops: ['Wheat', 'Paddy', 'Mustard'],
          preferredLanguage: language,
          createdAt: new Date().toISOString(),
        };
        await saveUserProfile(profile);
      }

      onSuccess(profile);
      onClose();
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request'
      ) {
        // Normal user action or preview iframe dismissal - not a fatal code error
        console.info('Google Sign In popup closed by user.');
        setError(
          language === 'hi'
            ? 'साइन-इन विंडो बंद कर दी गई। आप नीचे ईमेल या 10-अंक मोबाइल नंबर से भी लॉगिन कर सकते हैं।'
            : 'Google Sign-in was cancelled. You can also sign in using email or mobile number below.'
        );
      } else if (err?.code === 'auth/popup-blocked') {
        console.warn('Google Sign In popup blocked by browser.');
        setError(
          language === 'hi'
            ? 'ब्राउज़र ने पॉपअप विंडो ब्लॉक कर दी। कृपया पॉपअप की अनुमति दें या नीचे ईमेल/मोबाइल से लॉगिन करें।'
            : 'Popup was blocked by the browser. Please allow popups or use email/mobile below.'
        );
      } else {
        console.warn('Google Sign In notice:', err?.message || err);
        setError(getFriendlyAuthError(err, language));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const { authEmail, isValid, isPhone } = formatAuthEmail(email);
    if (!isValid || isPhone) {
      setError(
        language === 'hi'
          ? 'कृपया पासवर्ड रीसेट के लिए एक मान्य ईमेल पता दर्ज करें (उदा. kisan@gmail.com)।'
          : 'Please enter a valid email address (e.g. kisan@gmail.com) for password reset.'
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, authEmail);
      setSuccessMsg(
        language === 'hi'
          ? 'पासवर्ड रीसेट लिंक आपके ईमेल पर भेज दिया गया है।'
          : 'Password reset email sent! Check your inbox.'
      );
    } catch (err: any) {
      setError(getFriendlyAuthError(err, language));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-5 text-white flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-xl shadow-xs">
              🌾
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-lg font-bold">FieldNerve</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-400 text-slate-900">
                  SIH 2026
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                {language === 'hi'
                  ? 'किसान खाता - फसल डेटा व इतिहास सुरक्षित रखें'
                  : 'Farmer Portal - Save Scans & Q&A to Cloud'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Sign In vs Sign Up */}
        <div className="flex border-b border-slate-200 bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={() => {
              setTab('signin');
              resetForm();
            }}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              tab === 'signin'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-4 h-4 text-emerald-600" />
            <span>{language === 'hi' ? 'लॉगिन (Sign In)' : 'Sign In'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('signup');
              resetForm();
            }}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              tab === 'signup'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>{language === 'hi' ? 'नया पंजीकरण (Register)' : 'New Farmer Register'}</span>
          </button>
        </div>

        {/* Alerts */}
        <div className="overflow-y-auto p-5 space-y-4 flex-1 scrollbar-thin">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick Google Sign In */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-2xs flex items-center justify-center gap-2.5 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{language === 'hi' ? 'Google खाते से लॉगिन करें' : 'Continue with Google'}</span>
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider text-slate-400 bg-white px-2">
                <span>{language === 'hi' ? 'या ईमेल से जारी रखें' : 'Or with Email'}</span>
              </div>
            </div>
          </div>

          {/* Form */}
          {tab === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'hi' ? 'ईमेल पता या मोबाइल नंबर' : 'Email Address or Mobile Number'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      language === 'hi'
                        ? 'kisan@gmail.com या 9876543210'
                        : 'kisan@gmail.com or 9876543210'
                    }
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  {language === 'hi'
                    ? 'आप अपना 10 अंकों का फोन नंबर या ईमेल उपयोग कर सकते हैं।'
                    : 'You can use your 10-digit mobile number or email.'}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    {language === 'hi' ? 'पासवर्ड' : 'Password'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-[11px] text-emerald-700 hover:underline font-medium"
                  >
                    {language === 'hi' ? 'पासवर्ड भूल गए?' : 'Forgot Password?'}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>
                  {loading
                    ? language === 'hi'
                      ? 'लॉगिन हो रहा है...'
                      : 'Signing In...'
                    : language === 'hi'
                    ? 'खाते में प्रवेश करें'
                    : 'Sign In to FieldNerve'}
                </span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'hi' ? 'किसान का पूरा नाम *' : 'Farmer Full Name *'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar / राम कुमार"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'hi' ? 'ईमेल पता या 10-अंक मोबाइल नंबर *' : 'Email Address or Mobile Number *'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      language === 'hi'
                        ? 'kisan@gmail.com या 9876543210'
                        : 'kisan@gmail.com or 9876543210'
                    }
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {language === 'hi'
                    ? 'आप अपना फोन नंबर (उदा: 9876543210) या ईमेल दर्ज कर सकते हैं।'
                    : 'Enter your 10-digit mobile number or standard email address.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {language === 'hi' ? 'मोबाइल नंबर' : 'Phone'}
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full pl-8 pr-2.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {language === 'hi' ? 'गाँव / जिला' : 'Village / District'}
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder="e.g. Karnal"
                      className="w-full pl-8 pr-2.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  {language === 'hi' ? 'उगाई जाने वाली फसलें' : 'Primary Crops Grown'}
                </label>
                <div className="relative">
                  <Wheat className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={crops}
                    onChange={(e) => setCrops(e.target.value)}
                    placeholder="Wheat, Paddy, Mustard, Cotton"
                    className="w-full pl-8 pr-2.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'hi' ? 'सुरक्षित पासवर्ड (न्यूनतम 6 अक्षर) *' : 'Password (min 6 characters) *'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>
                  {loading
                    ? language === 'hi'
                      ? 'पंजीकरण हो रहा है...'
                      : 'Creating Account...'
                    : language === 'hi'
                    ? 'नया किसान खाता बनाएं'
                    : 'Create Farmer Account'}
                </span>
              </button>
            </form>
          )}

          {/* Forgot Password mini view */}
          {showForgotPassword && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs">
              <p className="font-semibold text-amber-900 mb-1">
                {language === 'hi' ? 'पासवर्ड रीसेट ईमेल भेजें' : 'Send Password Reset Link'}
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your-email@gmail.com"
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-amber-300 bg-white"
                />
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="px-3 py-1.5 bg-amber-700 text-white rounded-lg font-bold"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer: Guest mode button */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Firebase Auth & Firestore Secured</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-semibold underline text-xs"
          >
            {language === 'hi' ? 'अतिथि मोड में जारी रखें' : 'Continue as Guest'}
          </button>
        </div>
      </div>
    </div>
  );
};
