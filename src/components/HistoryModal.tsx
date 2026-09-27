import React, { useEffect, useState } from 'react';
import { X, Clock, FileText, Camera, PhoneCall, RefreshCw, Volume2, Cloud } from 'lucide-react';
import { Language, HistoryItem } from '../types';
import { speakText, stopSpeaking } from '../utils/speech';
import { getUserScansFromCloud, getUserQueriesFromCloud } from '../lib/firebase';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentUserUid?: string;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  language,
  currentUserUid,
}) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, currentUserUid]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const merged: HistoryItem[] = [];

      // 1. If user is logged in, pull from Firebase Firestore
      if (currentUserUid) {
        try {
          const [cloudQueries, cloudScans] = await Promise.all([
            getUserQueriesFromCloud(currentUserUid),
            getUserScansFromCloud(currentUserUid),
          ]);

          merged.push(...cloudQueries);

          cloudScans.forEach((scan) => {
            merged.push({
              id: scan.id,
              type: 'image_diagnosis',
              title: `${scan.crop || 'Crop'} - ${scan.problem || 'Diagnosis'}`,
              snippet: (scan.recommendations || []).slice(0, 2).join('. '),
              date: scan.timestamp || new Date().toISOString(),
              language: scan.language || 'hi',
              data: scan,
            });
          });
        } catch (cloudErr) {
          console.warn('Could not fetch cloud history:', cloudErr);
        }
      }

      // 2. Also fetch server local history for any items if backend is available
      try {
        const res = await fetch('/api/history');
        if (res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await res.json();
            if (data.success && Array.isArray(data.history)) {
              // Add non-duplicate items
              const existingIds = new Set(merged.map((m) => m.id));
              data.history.forEach((h: HistoryItem) => {
                if (!existingIds.has(h.id)) {
                  merged.push(h);
                }
              });
            }
          }
        }
      } catch (srvErr) {
        // Backend offline / static GitHub Pages environment
      }

      // Sort by date descending
      merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setHistoryItems(merged);
    } catch (e) {
      console.error('History fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSpeakItem = (item: HistoryItem) => {
    stopSpeaking();
    let text = `${item.title}. ${item.snippet}`;
    if (item.data?.answer) text = item.data.answer;
    speakText(text, language);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-emerald-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-200" />
            <div>
              <h3 className="text-base font-bold">
                {language === 'hi' ? 'पिछली सलाह व जांच इतिहास' : 'Consultation & Diagnosis History'}
              </h3>
              {currentUserUid && (
                <p className="text-[10px] text-emerald-200 flex items-center gap-1">
                  <Cloud className="w-3 h-3" />
                  <span>Synced with Firebase Firestore</span>
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500">
              {language === 'hi'
                ? 'आपके द्वारा पूछे गए सवाल और फसल फोटो जांच रिकॉर्ड'
                : 'Your agricultural questions and scanned crop records'}
            </p>
            <button
              type="button"
              onClick={loadHistory}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {isLoading && historyItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
              <span>Loading records...</span>
            </div>
          ) : historyItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="font-semibold text-slate-700 mb-1">
                {language === 'hi' ? 'कोई पुराना रिकॉर्ड नहीं मिला' : 'No previous history yet'}
              </p>
              <p className="text-[11px] text-slate-400">
                {language === 'hi'
                  ? 'फसल की फोटो स्कैन करें या एआई से सवाल पूछें, वह यहाँ सहेज लिया जाएगा।'
                  : 'Scan a crop leaf or ask AI assistant to see your history logged here.'}
              </p>
            </div>
          ) : (
            historyItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all cursor-pointer bg-white shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                      {item.type === 'image_diagnosis' ? (
                        <Camera className="w-3.5 h-3.5" />
                      ) : item.type === 'expert_request' ? (
                        <PhoneCall className="w-3.5 h-3.5" />
                      ) : (
                        <FileText className="w-3.5 h-3.5" />
                      )}
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(item.date).toLocaleDateString()} at{' '}
                        {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeakItem(item);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-100/60"
                    title="Listen aloud"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {item.snippet}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Selected Item Detail Modal */}
        {selectedItem && (
          <div className="p-4 bg-slate-50 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {selectedItem.title}
              </h4>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Close View
              </button>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 max-h-40 overflow-y-auto whitespace-pre-line leading-relaxed">
              {selectedItem.data?.answer || selectedItem.data?.recommendations?.join('\n• ') || selectedItem.snippet}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
