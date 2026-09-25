import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Wheat,
  LogOut,
  Save,
  CheckCircle2,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth, saveUserProfile } from '../lib/firebase';
import { Language, UserProfile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  profile: UserProfile | null;
  onProfileUpdated: (updated: UserProfile) => void;
  onSignOut: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  language,
  profile,
  onProfileUpdated,
  onSignOut,
}) => {
  if (!isOpen || !profile) return null;

  const [name, setName] = useState<string>(profile.name || '');
  const [phone, setPhone] = useState<string>(profile.phone || '');
  const [village, setVillage] = useState<string>(profile.village || '');
  const [state, setState] = useState<string>(profile.state || '');
  const [cropsStr, setCropsStr] = useState<string>((profile.crops || []).join(', '));
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const updated: UserProfile = {
        ...profile,
        name: name.trim(),
        phone: phone.trim(),
        village: village.trim(),
        state: state.trim(),
        crops: cropsStr
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
      };

      await saveUserProfile(updated);
      onProfileUpdated(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onSignOut();
      onClose();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-emerald-800 p-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center font-bold text-base">
              👤
            </div>
            <div>
              <h3 className="text-base font-bold">
                {language === 'hi' ? 'किसान प्रोफ़ाइल व खेत विवरण' : 'Farmer Profile & Field Details'}
              </h3>
              <p className="text-xs text-emerald-200">
                {language === 'hi' ? 'क्लाउड स्टोरेज से सुरक्षित' : 'Synced with Firebase Cloud'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto flex-1 scrollbar-thin">
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                {language === 'hi'
                  ? 'प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई!'
                  : 'Profile successfully updated in Firestore!'}
              </span>
            </div>
          )}

          {/* Account Overview Tag */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900">{profile.email}</p>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>FieldNerve UID: {profile.uid.slice(0, 8)}...</span>
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              Active Farmer
            </span>
          </div>

          {/* Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'hi' ? 'किसान का नाम' : 'Farmer Name'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'hi' ? 'मोबाइल नंबर' : 'Phone Number'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'hi' ? 'गाँव / जिला' : 'Village / District'}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="e.g. Karnal, Haryana"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'hi' ? 'उगाई जाने वाली फसलें (कॉमा से अलग करें)' : 'Primary Crops (comma separated)'}
              </label>
              <div className="relative">
                <Wheat className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={cropsStr}
                  onChange={(e) => setCropsStr(e.target.value)}
                  placeholder="Wheat, Rice, Mustard, Sugarcane"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSignOut}
              className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{language === 'hi' ? 'लॉग आउट' : 'Sign Out'}</span>
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>
                {isSaving
                  ? language === 'hi'
                    ? 'सहेजा जा रहा है...'
                    : 'Saving...'
                  : language === 'hi'
                  ? 'अपडेट सहेजें'
                  : 'Save Changes'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
