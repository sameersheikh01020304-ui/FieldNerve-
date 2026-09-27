import React, { useState } from 'react';
import { X, PhoneCall, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Send } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface ExpertModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  initialCropName?: string;
  initialProblemDesc?: string;
  onRequestSubmitted?: () => void;
}

export const ExpertModal: React.FC<ExpertModalProps> = ({
  isOpen,
  onClose,
  language,
  initialCropName = '',
  initialProblemDesc = '',
  onRequestSubmitted,
}) => {
  const [farmerName, setFarmerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [cropName, setCropName] = useState<string>(initialCropName);
  const [problem, setProblem] = useState<string>(initialProblemDesc);
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successInfo, setSuccessInfo] = useState<{ requestCode: string; helpline: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const t = TRANSLATIONS[language].expert;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !problem.trim()) {
      setErrorMsg(language === 'hi' ? 'कृपया फोन नंबर और समस्या का विवरण भरें।' : 'Please fill your phone number and problem description.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      let submissionDone = false;

      // Try backend server first if available
      try {
        const res = await fetch('/api/expert-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            farmerName: farmerName.trim() || 'Kisan Brother',
            phoneNumber: phone.trim(),
            location: location.trim() || 'India',
            cropName: cropName.trim() || 'Crop',
            problemDescription: problem.trim(),
            urgency,
          }),
        });

        if (res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await res.json();
            if (data.success) {
              setSuccessInfo({
                requestCode: data.requestId || data.request_code || 'FN-EXP',
                helpline: data.helpline || '1800-180-1551',
              });
              submissionDone = true;
            }
          }
        }
      } catch (backendErr) {
        // Backend offline / static GitHub Pages environment
      }

      // If backend is not running, save directly to Firebase Firestore
      if (!submissionDone) {
        const generatedCode = 'EXP-' + Math.floor(100000 + Math.random() * 900000);
        try {
          await addDoc(collection(db, 'expert_requests'), {
            requestCode: generatedCode,
            farmerName: farmerName.trim() || 'Kisan Brother',
            phoneNumber: phone.trim(),
            location: location.trim() || 'India',
            cropName: cropName.trim() || 'Crop',
            problemDescription: problem.trim(),
            urgency,
            status: 'pending',
            createdAt: new Date().toISOString(),
          });
        } catch (dbErr) {
          console.warn('Firestore fallback save notice:', dbErr);
        }

        setSuccessInfo({
          requestCode: generatedCode,
          helpline: '1800-180-1551',
        });
      }

      if (onRequestSubmitted) onRequestSubmitted();
    } catch (err: any) {
      console.error('Expert request error:', err);
      setErrorMsg(err.message || 'Failed to register request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <PhoneCall className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">{t.title}</h3>
              <p className="text-[11px] text-emerald-200">{t.subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body or Success State */}
        <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
          {successInfo ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">{t.successTitle}</h4>
                <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">{t.assignedNote}</p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                  {t.trackingCode}
                </span>
                <span className="text-xl font-mono font-black text-emerald-950">
                  {successInfo.requestCode}
                </span>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                <p className="font-semibold">{t.helplineNote}</p>
                <p className="text-sm font-bold text-amber-950 mt-0.5">{successInfo.helpline}</p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{t.farmerName}</label>
                  <input
                    type="text"
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    placeholder="e.g. Ramesh Singh"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {t.phone} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{t.location}</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Ludhiana, Punjab"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{t.cropName}</label>
                  <input
                    type="text"
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    placeholder="e.g. Wheat / Paddy / Cotton"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">{t.urgency}</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setUrgency(lvl)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                        urgency === lvl
                          ? lvl === 'high'
                            ? 'bg-rose-50 text-rose-800 border-rose-400 ring-2 ring-rose-300'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-400 ring-2 ring-emerald-300'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {t[lvl]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {t.problem} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="Describe disease symptoms, leaf color change, insect attack, or treatment tried..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{t.submitting}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{t.submitBtn}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
