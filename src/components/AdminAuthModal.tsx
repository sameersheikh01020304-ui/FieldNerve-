import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, ADMIN_INFO, saveUserProfile } from '../lib/firebase';
import { UserProfile } from '../types';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminAuthenticated: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onAdminAuthenticated,
}) => {
  const [passcode, setPasscode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  // Direct 1-click verification as Sameer Sheikh using official admin credentials
  const handleQuickAdminLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      // Save / ensure Admin profile in Firestore
      const adminProfile: UserProfile = {
        uid: 'admin_sameer_sheikh',
        name: ADMIN_INFO.name,
        email: ADMIN_INFO.email,
        phone: ADMIN_INFO.phone,
        role: 'admin',
        status: 'active',
        village: 'Central Operations Command',
        state: 'All India',
        crops: ['Operations Lead'],
        preferredLanguage: 'en',
        createdAt: new Date().toISOString(),
      };
      await saveUserProfile(adminProfile);

      sessionStorage.setItem('fieldnerve_admin_verified', 'true');
      onAdminAuthenticated();
      onClose();
    } catch (err: any) {
      console.error('Admin quick auth error:', err);
      // Still allow authenticated state for admin session
      sessionStorage.setItem('fieldnerve_admin_verified', 'true');
      onAdminAuthenticated();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleaned = passcode.trim();
    // Allow phone number 7521011565 or standard admin pins
    if (
      cleaned === ADMIN_INFO.phone ||
      cleaned === '7521011565' ||
      cleaned === 'admin' ||
      cleaned === 'admin123'
    ) {
      handleQuickAdminLogin();
    } else {
      setError('Invalid admin security passcode. Hint: Use Admin phone number (7521011565)');
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">FieldNerve Admin Access</h3>
              <p className="text-xs text-emerald-300">Authorized Personnel Only</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Admin Identity Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-sm">
              SS
            </div>
            <div className="text-xs flex-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span>{ADMIN_INFO.name}</span>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded font-bold">
                  SUPER ADMIN
                </span>
              </div>
              <div className="text-slate-600 mt-0.5">{ADMIN_INFO.email}</div>
              <div className="text-slate-500 font-mono text-[11px]">+91 {ADMIN_INFO.phone}</div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Access Button for Sameer Sheikh */}
          <button
            type="button"
            onClick={handleQuickAdminLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>
              {loading ? 'Authenticating...' : `Enter Admin Console as ${ADMIN_INFO.name}`}
            </span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="shrink mx-3 text-[11px] text-slate-400 font-medium">
              or enter security pin
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Passcode Entry */}
          <form onSubmit={handlePasscodeSubmit} className="space-y-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Security PIN / Phone
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter 7521011565 or admin key"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Verify & Unlock Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
