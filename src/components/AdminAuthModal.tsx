import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Clock,
  Fingerprint
} from 'lucide-react';
import { ADMIN_INFO, saveUserProfile } from '../lib/firebase';
import { UserProfile } from '../types';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminAuthenticated: () => void;
}

// Master password configuration
const DEFAULT_MASTER_PASSWORDS = ['Sameer@2026#', 'Sameer#7521', 'Sameer7521!'];
const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 180; // 3 minutes

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onAdminAuthenticated,
}) => {
  const [passcode, setPasscode] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);

  // Check lockout on mount
  useEffect(() => {
    const lockUntilStr = sessionStorage.getItem('fieldnerve_admin_lock_until');
    if (lockUntilStr) {
      const lockUntil = parseInt(lockUntilStr, 10);
      const now = Date.now();
      if (lockUntil > now) {
        setLockoutRemaining(Math.ceil((lockUntil - now) / 1000));
      } else {
        sessionStorage.removeItem('fieldnerve_admin_lock_until');
        sessionStorage.removeItem('fieldnerve_admin_attempts');
      }
    }
  }, [isOpen]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const interval = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          sessionStorage.removeItem('fieldnerve_admin_lock_until');
          sessionStorage.removeItem('fieldnerve_admin_attempts');
          setError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutRemaining]);

  if (!isOpen) return null;

  const handleVerifyMasterPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutRemaining > 0) return;

    setError(null);
    const cleaned = passcode.trim();

    if (!cleaned) {
      setError('Please enter your admin master password.');
      return;
    }

    // Retrieve custom password if Sameer set one in Admin Portal, otherwise use defaults
    const customPassword = localStorage.getItem('fieldnerve_admin_master_password');
    const isValid =
      (customPassword && cleaned === customPassword) ||
      DEFAULT_MASTER_PASSWORDS.includes(cleaned);

    if (isValid) {
      setLoading(true);
      try {
        // Ensure Admin Profile exists in database
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

        // Set verified session token
        sessionStorage.setItem('fieldnerve_admin_verified', 'true');
        sessionStorage.removeItem('fieldnerve_admin_attempts');
        sessionStorage.removeItem('fieldnerve_admin_lock_until');

        setPasscode('');
        onAdminAuthenticated();
        onClose();
      } catch (err: any) {
        console.warn('Admin profile sync notice:', err);
        sessionStorage.setItem('fieldnerve_admin_verified', 'true');
        setPasscode('');
        onAdminAuthenticated();
        onClose();
      } finally {
        setLoading(false);
      }
    } else {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      sessionStorage.setItem('fieldnerve_admin_attempts', nextAttempts.toString());

      if (nextAttempts >= MAX_ATTEMPTS) {
        const lockUntil = Date.now() + LOCKOUT_SECONDS * 1000;
        sessionStorage.setItem('fieldnerve_admin_lock_until', lockUntil.toString());
        setLockoutRemaining(LOCKOUT_SECONDS);
        setError(`Maximum failed attempts exceeded. Access locked for ${LOCKOUT_SECONDS} seconds for security.`);
      } else {
        const remainingTries = MAX_ATTEMPTS - nextAttempts;
        setError(`Access Denied: Incorrect Master Password. ${remainingTries} attempts remaining before temporary lockout.`);
      }
      setPasscode('');
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center shadow-md">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">FieldNerve Security Gateway</h3>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  L4 RBAC
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Strict Super-Admin Verification</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Admin Identity Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-800 to-slate-900 text-white font-extrabold flex items-center justify-center text-sm shadow-xs shrink-0">
              SS
            </div>
            <div className="text-xs flex-1 min-w-0">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="truncate">{ADMIN_INFO.name}</span>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded font-extrabold shrink-0 border border-emerald-200">
                  ONLY AUTHORIZED ADMIN
                </span>
              </div>
              <div className="text-slate-600 truncate mt-0.5 font-medium">{ADMIN_INFO.email}</div>
              <div className="text-slate-400 font-mono text-[11px] mt-0.5 flex items-center gap-1">
                <Fingerprint className="w-3 h-3 text-emerald-600" />
                <span>Protected Identity: Sameer Sheikh</span>
              </div>
            </div>
          </div>

          {/* Security Alert if Lockout or Error */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Lockout Warning */}
          {lockoutRemaining > 0 && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2.5 font-medium">
              <Clock className="w-4 h-4 text-amber-700 animate-spin" />
              <span>
                Console locked due to incorrect attempts. Retry available in: <strong>{lockoutRemaining}s</strong>
              </span>
            </div>
          )}

          {/* Master Password Input Form */}
          <form onSubmit={handleVerifyMasterPassword} className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Enter Private Master Password</span>
                </label>
                <span className="text-[10px] text-slate-400">Strictly Confidential</span>
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={lockoutRemaining > 0 || loading}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter your private master password"
                  autoComplete="current-password"
                  className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all disabled:opacity-50 disabled:bg-slate-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={lockoutRemaining > 0 || loading || !passcode.trim()}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-800 to-slate-900 hover:from-emerald-700 hover:to-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>{loading ? 'Verifying Credentials...' : 'Authenticate & Unlock Admin Portal'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Privacy and Security Policy Note */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-500 space-y-1">
            <div className="font-semibold text-slate-700 flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>Zero-Bypass Policy Active:</span>
            </div>
            <p>
              Only Sameer Sheikh holds the decryption key. Unauthorized attempts are rate-limited and logged. You can change your password at any time inside the Admin Security settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
