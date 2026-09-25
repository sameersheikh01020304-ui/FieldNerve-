import React from 'react';
import {
  Sprout,
  Languages,
  PhoneCall,
  Clock,
  Camera,
  MessageSquareText,
  CloudSun,
  Boxes,
  User as UserIcon,
  ShieldCheck,
} from 'lucide-react';
import { type User } from 'firebase/auth';
import { Language, UserProfile } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  activeTab: 'scanner' | 'chat' | 'weather' | 'threed';
  onTabChange: (tab: 'scanner' | 'chat' | 'weather' | 'threed') => void;
  onOpenExpert: () => void;
  onOpenHistory: () => void;
  currentUser: User | null;
  userProfile: UserProfile | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
  isAdmin: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  activeTab,
  onTabChange,
  onOpenExpert,
  onOpenHistory,
  currentUser,
  userProfile,
  onOpenAuth,
  onOpenProfile,
  onOpenAdmin,
  isAdmin,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => onTabChange('scanner')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 text-white flex items-center justify-center shadow-xs transition-colors">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold text-slate-900 tracking-tight">FieldNerve</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                AI
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal">
              {language === 'hi' ? 'स्मार्ट कृषि सहायक' : 'Smart Agriculture'}
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => onTabChange('scanner')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'scanner'
                ? 'bg-white text-emerald-800 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4 text-emerald-600" />
            <span>{t.tabs.cropDoctor}</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'chat'
                ? 'bg-white text-emerald-800 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquareText className="w-4 h-4 text-emerald-600" />
            <span>{t.tabs.agriChat}</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('weather')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'weather'
                ? 'bg-white text-emerald-800 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CloudSun className="w-4 h-4 text-sky-600" />
            <span>{t.tabs.climate}</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('threed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'threed'
                ? 'bg-white text-emerald-800 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Boxes className="w-4 h-4 text-indigo-600" />
            <span>{t.tabs.threeD}</span>
          </button>
        </nav>

        {/* Right Tools: Language Toggle & Support */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <button
            type="button"
            onClick={() => onLanguageChange(language === 'hi' ? 'en' : 'hi')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
            title="Switch Language"
          >
            <Languages className="w-4 h-4 text-emerald-700" />
            <span>{language === 'hi' ? 'English' : 'हिन्दी'}</span>
          </button>

          {/* History */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Consultation History"
          >
            <Clock className="w-4 h-4" />
          </button>

          {/* Farmer Auth / Profile Button */}
          {currentUser ? (
            <button
              type="button"
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-900 transition-colors shadow-2xs"
              title="Farmer Profile & Settings"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[10px] flex items-center justify-center font-bold">
                {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : '👨‍🌾'}
              </div>
              <span className="hidden sm:inline max-w-[90px] truncate">
                {userProfile?.name || 'Farmer'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-2xs"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'लॉगिन' : 'Sign In'}</span>
            </button>
          )}

          {/* Admin Portal Entry */}
          <button
            type="button"
            onClick={onOpenAdmin}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all shadow-2xs ${
              isAdmin
                ? 'bg-slate-900 border-slate-700 text-emerald-400 hover:bg-slate-800'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
            }`}
            title="FieldNerve Admin Portal (Sameer Sheikh)"
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${isAdmin ? 'text-emerald-400' : 'text-slate-600'}`} />
            <span>Admin</span>
          </button>

          {/* Expert Support Button */}
          <button
            type="button"
            onClick={onOpenExpert}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
            <span>{t.tabs.expertHelp}</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden grid grid-cols-4 border-t border-slate-200 bg-slate-50 py-1 px-1 text-xs text-slate-600">
        <button
          type="button"
          onClick={() => onTabChange('scanner')}
          className={`flex flex-col items-center py-1.5 px-1 rounded-md transition-colors ${
            activeTab === 'scanner' ? 'text-emerald-700 font-bold bg-white shadow-2xs' : 'hover:bg-slate-100'
          }`}
        >
          <Camera className="w-4 h-4 mb-0.5" />
          <span className="text-[11px] truncate">{t.tabs.cropDoctor}</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange('chat')}
          className={`flex flex-col items-center py-1.5 px-1 rounded-md transition-colors ${
            activeTab === 'chat' ? 'text-emerald-700 font-bold bg-white shadow-2xs' : 'hover:bg-slate-100'
          }`}
        >
          <MessageSquareText className="w-4 h-4 mb-0.5" />
          <span className="text-[11px] truncate">{t.tabs.agriChat}</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange('weather')}
          className={`flex flex-col items-center py-1.5 px-1 rounded-md transition-colors ${
            activeTab === 'weather' ? 'text-sky-700 font-bold bg-white shadow-2xs' : 'hover:bg-slate-100'
          }`}
        >
          <CloudSun className="w-4 h-4 mb-0.5" />
          <span className="text-[11px] truncate">{t.tabs.climate}</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange('threed')}
          className={`flex flex-col items-center py-1.5 px-1 rounded-md transition-colors ${
            activeTab === 'threed' ? 'text-indigo-700 font-bold bg-white shadow-2xs' : 'hover:bg-slate-100'
          }`}
        >
          <Boxes className="w-4 h-4 mb-0.5" />
          <span className="text-[11px] truncate">{t.tabs.threeD}</span>
        </button>
      </div>
    </header>
  );
};
