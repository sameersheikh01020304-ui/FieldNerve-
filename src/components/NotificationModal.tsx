import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  CloudRain,
  Leaf,
  AlertTriangle,
  CheckCircle2,
  Send,
  Smartphone,
  Copy,
  Check,
  ShieldCheck,
  Wheat,
  Clock,
  Volume2,
  Trash2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Info
} from 'lucide-react';
import { Language, FarmerNotificationItem } from '../types';
import {
  requestFCMToken,
  triggerLocalPush,
  saveNotificationToFirestore,
  fetchFarmerNotifications,
  WEATHER_ALERT_TEMPLATES,
  CROP_HEALTH_TEMPLATES,
  checkFCMSupport
} from '../lib/fcmService';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  userId?: string;
  onNotificationsUpdated?: (unreadCount: number) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  language,
  userId = 'guest_farmer',
  onNotificationsUpdated,
}) => {
  const [notifications, setNotifications] = useState<FarmerNotificationItem[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'weather' | 'crop'>('all');
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Initialize status on modal open
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
      const cachedToken = localStorage.getItem('fieldnerve_fcm_token');
      if (cachedToken) {
        setFcmToken(cachedToken);
      }
    }

    checkFCMSupport().then((supported) => {
      setIsSupported(supported);
    });

    loadNotifications();
  }, [isOpen, userId]);

  const loadNotifications = async () => {
    try {
      const items = await fetchFarmerNotifications(userId);
      setNotifications(items);
      const unread = items.filter((n) => !n.read).length;
      if (onNotificationsUpdated) onNotificationsUpdated(unread);
    } catch (err) {
      console.warn('Error loading notifications:', err);
    }
  };

  if (!isOpen) return null;

  const handleEnablePush = async () => {
    setLoading(true);
    setActionSuccess(null);
    try {
      const result = await requestFCMToken(userId);
      setPermission(result.permission);
      if (result.token) {
        setFcmToken(result.token);
        setActionSuccess(
          language === 'hi'
            ? '✅ पुश नोटिफिकेशन सफलतापूर्वक सक्रिय किए गए!'
            : '✅ Push notifications enabled on your device!'
        );

        // Send a celebratory welcome notification
        await triggerLocalPush(
          language === 'hi' ? '🌾 फील्डनर्व अलर्ट सक्रिय' : '🌾 FieldNerve Alerts Active',
          language === 'hi'
            ? 'अब आपको मौसम की चेतावनी और फसल स्वास्थ्य के रिमाइंडर समय पर मिलते रहेंगे।'
            : 'You will now receive timely weather advisories and crop reminders.',
          'advisory'
        );
      } else if (result.permission === 'denied') {
        setActionSuccess(
          language === 'hi'
            ? '⚠️ ब्राउज़र सेटिंग्स में नोटिफिकेशन अनुमति ब्लॉक है। कृपया अनुमति प्रदान करें।'
            : '⚠️ Notification permission is blocked in browser settings. Please enable it.'
        );
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
      loadNotifications();
    }
  };

  const handleSendTestWeatherAlert = async () => {
    setLoading(true);
    const template = WEATHER_ALERT_TEMPLATES[Math.floor(Math.random() * WEATHER_ALERT_TEMPLATES.length)];

    const title = language === 'hi' ? template.titleHi : template.title;
    const body = language === 'hi' ? template.bodyHi : template.body;

    // 1. Dispatch real device push notification
    await triggerLocalPush(title, body, template.type);

    // 2. Save to Firestore
    const saved = await saveNotificationToFirestore(userId, {
      userId,
      type: template.type,
      title: template.title,
      titleHi: template.titleHi,
      body: template.body,
      bodyHi: template.bodyHi,
      severity: template.severity,
      crop: 'Regional Advisory',
      read: false,
    });

    setNotifications((prev) => [saved, ...prev]);
    setActionSuccess(
      language === 'hi'
        ? '📢 मौसम चेतावनी का नोटिफिकेशन आपके डिवाइस पर भेजा गया!'
        : '📢 Weather alert sent to your device!'
    );
    setLoading(false);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleSendTestCropReminder = async () => {
    setLoading(true);
    const template = CROP_HEALTH_TEMPLATES[Math.floor(Math.random() * CROP_HEALTH_TEMPLATES.length)];

    const title = language === 'hi' ? template.titleHi : template.title;
    const body = language === 'hi' ? template.bodyHi : template.body;

    // 1. Dispatch real device push notification
    await triggerLocalPush(title, body, template.type);

    // 2. Save to Firestore
    const saved = await saveNotificationToFirestore(userId, {
      userId,
      type: template.type,
      title: template.title,
      titleHi: template.titleHi,
      body: template.body,
      bodyHi: template.bodyHi,
      severity: template.severity,
      crop: template.crop,
      read: false,
    });

    setNotifications((prev) => [saved, ...prev]);
    setActionSuccess(
      language === 'hi'
        ? '🌿 फसल स्वास्थ्य रिमाइंडर आपके डिवाइस पर भेजा गया!'
        : '🌿 Crop health reminder sent to your device!'
    );
    setLoading(false);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleMarkAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    try {
      localStorage.setItem(`fieldnerve_notifications_${userId}`, JSON.stringify(updated));
    } catch (e) {}
    const unread = updated.filter((n) => !n.read).length;
    if (onNotificationsUpdated) onNotificationsUpdated(unread);
  };

  const handleClearAll = () => {
    setNotifications([]);
    try {
      localStorage.removeItem(`fieldnerve_notifications_${userId}`);
    } catch (e) {}
    if (onNotificationsUpdated) onNotificationsUpdated(0);
  };

  const handleCopyToken = () => {
    if (!fcmToken) return;
    navigator.clipboard.writeText(fcmToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'weather') return item.type === 'weather_alert';
    if (activeFilter === 'crop') return item.type === 'crop_health' || item.type === 'pest_alert';
    return true;
  });

  return (
    <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg">
                  {language === 'hi' ? 'पुश नोटिफिकेशन व मौसम अलर्ट' : 'Push Notification Service'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Firebase Cloud Messaging
                </span>
              </div>
              <p className="text-xs text-emerald-100/70 mt-0.5">
                {language === 'hi'
                  ? 'मौसम की चेतावनी, वर्षा पूर्व सूचना और फसल स्वास्थ्य रिमाइंडर सीधे आपके फोन पर'
                  : 'Instant weather advisories and personalized agronomy health alerts on your device'}
              </p>
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

        {/* Action Banner for Success/Alerts */}
        {actionSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-800 flex items-center justify-between animate-in fade-in">
            <span>{actionSuccess}</span>
            <button
              type="button"
              onClick={() => setActionSuccess(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Permission Status & FCM Activation Banner */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  {language === 'hi' ? 'डिवाइस नोटिफिकेशन स्थिति:' : 'Device Push Status:'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold uppercase ${
                    permission === 'granted'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : permission === 'denied'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {permission === 'granted'
                    ? (language === 'hi' ? 'सक्रिय (Active)' : 'Active (Granted)')
                    : permission === 'denied'
                    ? (language === 'hi' ? 'अस्वीकृत (Denied)' : 'Blocked')
                    : (language === 'hi' ? 'अस्वीकृत नहीं (Click to enable)' : 'Not Enabled')}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {permission === 'granted'
                  ? (language === 'hi'
                    ? 'आपका डिवाइस फील्डनर्व रियल-टाइम पुश सर्विस से जुड़ा हुआ है।'
                    : 'FCM Token registered. Background alerts enabled for weather & crop care.')
                  : (language === 'hi'
                    ? 'खेत में अप्रत्याशित वर्षा या कीट आक्रमण की पूर्व चेतावनी पाने के लिए अनुमति दें।'
                    : 'Allow notification permission to receive instant alerts before storms or pest outbreaks.')}
              </p>
            </div>

            {permission !== 'granted' ? (
              <button
                type="button"
                onClick={handleEnablePush}
                disabled={loading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
              >
                <Smartphone className="w-4 h-4" />
                <span>{language === 'hi' ? 'नोटिफिकेशन चालू करें' : 'Enable Push Notifications'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-white px-3 py-1.5 rounded-lg border border-emerald-200 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{language === 'hi' ? 'डिवाइस कनेक्टेड' : 'Device Connected'}</span>
              </div>
            )}
          </div>

          {/* Real-time Notification Dispatch Trigger Buttons */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{language === 'hi' ? 'लाइव पुश अलर्ट भेजें (टेस्ट करें):' : 'Trigger Live Push Alerts:'}</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {language === 'hi' ? 'डिवाइस पर तुरंत प्रदर्शित होगा' : 'Delivered directly to this device'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Trigger Weather Alert */}
              <button
                type="button"
                onClick={handleSendTestWeatherAlert}
                disabled={loading}
                className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/60 hover:bg-sky-100/80 text-left transition-all flex items-start gap-3 cursor-pointer group shadow-2xs"
              >
                <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <CloudRain className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-sky-950 flex items-center gap-1">
                    <span>{language === 'hi' ? 'मौसम चेतावनी भेजें' : 'Send Weather Alert'}</span>
                    <Send className="w-3 h-3 text-sky-600" />
                  </div>
                  <p className="text-[11px] text-sky-800 line-clamp-2 mt-0.5">
                    {language === 'hi'
                      ? 'असामयिक वर्षा, तेज आंधी या तापमान वृद्धि की तत्काल चेतावनी।'
                      : 'Simulate high rainfall, heatwave, or frost alert with real-time push.'}
                  </p>
                </div>
              </button>

              {/* Trigger Crop Health Reminder */}
              <button
                type="button"
                onClick={handleSendTestCropReminder}
                disabled={loading}
                className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/80 text-left transition-all flex items-start gap-3 cursor-pointer group shadow-2xs"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Leaf className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                    <span>{language === 'hi' ? 'फसल रिमाइंडर भेजें' : 'Send Crop Health Reminder'}</span>
                    <Send className="w-3 h-3 text-emerald-600" />
                  </div>
                  <p className="text-[11px] text-emerald-800 line-clamp-2 mt-0.5">
                    {language === 'hi'
                      ? 'नाइट्रोजन टॉप-ड्रेसिंग, कीट निगरानी व सिंचाई का समयबद्ध अनुस्मारक।'
                      : 'Simulate fertilizer timing, yellow rust scouting, or moisture advisory.'}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* FCM Device Token Pill (Collapsible / Informative) */}
          {fcmToken && (
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                  <span>FCM Device Registration Token:</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyToken}
                  className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="font-mono text-[10px] text-slate-500 break-all bg-white p-2 rounded-lg border border-slate-200 select-all">
                {fcmToken}
              </p>
            </div>
          )}

          {/* Notifications History List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900">
                  {language === 'hi' ? 'हालिया अलर्ट व संदेश इतिहास' : 'Recent Alerts & Advisory History'}
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                  {notifications.length}
                </span>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    activeFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {language === 'hi' ? 'सभी' : 'All'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('weather')}
                  className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    activeFilter === 'weather' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {language === 'hi' ? 'मौसम' : 'Weather'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('crop')}
                  className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    activeFilter === 'crop' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {language === 'hi' ? 'फसल' : 'Crops'}
                </button>
              </div>
            </div>

            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
                <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">
                  {language === 'hi'
                    ? 'कोई नया अलर्ट उपलब्ध नहीं है। ऊपर दिए गए बटन से टेस्ट अलर्ट भेजें।'
                    : 'No notifications in this filter. Use the buttons above to test alerts.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredNotifications.map((notif) => {
                  const isWeather = notif.type === 'weather_alert';
                  const isCritical = notif.severity === 'critical';

                  return (
                    <div
                      key={notif.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                        notif.read
                          ? 'bg-white border-slate-200 opacity-80'
                          : isCritical
                          ? 'bg-rose-50/70 border-rose-200 shadow-2xs'
                          : isWeather
                          ? 'bg-sky-50/70 border-sky-200 shadow-2xs'
                          : 'bg-emerald-50/70 border-emerald-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isCritical
                              ? 'bg-rose-600 text-white'
                              : isWeather
                              ? 'bg-sky-600 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {isWeather ? (
                            <CloudRain className="w-4 h-4" />
                          ) : isCritical ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : (
                            <Leaf className="w-4 h-4" />
                          )}
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-bold text-slate-900">
                              {language === 'hi' && notif.titleHi ? notif.titleHi : notif.title}
                            </h5>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {language === 'hi' && notif.bodyHi ? notif.bodyHi : notif.body}
                          </p>

                          <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-400">
                            {notif.crop && (
                              <span className="font-semibold text-emerald-800 bg-white/80 px-1.5 py-0.2 rounded border border-slate-200">
                                🌾 {notif.crop}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {!notif.read && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold px-2 py-1 rounded bg-white border border-slate-200 shrink-0 cursor-pointer"
                        >
                          {language === 'hi' ? 'पढ़ा हुआ' : 'Mark Read'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>
              {language === 'hi'
                ? 'नोटिफिकेशन आने पर सौम्य अलर्ट टोन बजेगी।'
                : 'Gentle notification chime is played when alerts are delivered.'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-slate-500 hover:text-rose-700 flex items-center gap-1 font-semibold cursor-pointer mr-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'इतिहास साफ़ करें' : 'Clear History'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-all cursor-pointer"
            >
              {language === 'hi' ? 'बंद करें' : 'Done'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
