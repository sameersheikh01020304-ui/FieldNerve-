import { getMessaging, getToken, onMessage, isSupported, type Messaging } from 'firebase/messaging';
import { doc, setDoc, collection, addDoc, getDocs, updateDoc, query, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { app, db } from './firebase';
import { FarmerNotificationItem, NotificationType, NotificationSeverity } from '../types';

let messagingInstance: Messaging | null = null;
let isMessagingSupportedPromise: Promise<boolean> | null = null;

/**
 * Checks if Firebase Cloud Messaging and Web Push Notifications are supported in current browser
 */
export async function checkFCMSupport(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
    return false;
  }

  if (!isMessagingSupportedPromise) {
    isMessagingSupportedPromise = isSupported().catch((err) => {
      console.warn('FCM isSupported check failed:', err);
      return false;
    });
  }

  return isMessagingSupportedPromise;
}

/**
 * Lazily retrieves the Firebase Messaging instance if supported
 */
export async function getFCMInstance(): Promise<Messaging | null> {
  const supported = await checkFCMSupport();
  if (!supported) return null;

  if (!messagingInstance) {
    try {
      messagingInstance = getMessaging(app);
    } catch (err) {
      console.warn('Failed to initialize getMessaging(app):', err);
      return null;
    }
  }
  return messagingInstance;
}

/**
 * Registers the Service Worker for Firebase Messaging
 */
export async function registerMessagingServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });
    console.log('[FCM] Service Worker registered successfully with scope:', registration.scope);
    return registration;
  } catch (err) {
    console.warn('[FCM] Service Worker registration failed:', err);
    return null;
  }
}

/**
 * Requests Notification permission and registers FCM device token
 */
export async function requestFCMToken(userId?: string): Promise<{
  token: string | null;
  permission: NotificationPermission;
  error?: string;
}> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { token: null, permission: 'denied', error: 'Notifications not supported on this browser' };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { token: null, permission, error: 'Notification permission was not granted by user' };
    }

    const messaging = await getFCMInstance();
    const swReg = await registerMessagingServiceWorker();

    let fcmToken: string | null = null;

    if (messaging && swReg) {
      try {
        fcmToken = await getToken(messaging, {
          serviceWorkerRegistration: swReg,
        });
        console.log('[FCM] Device Token generated:', fcmToken);
      } catch (tokenErr: any) {
        console.warn('[FCM] getToken notice (VAPID key or network):', tokenErr);
        // Fallback: Generate a unique device identifier for local push tracking
        fcmToken = localStorage.getItem('fieldnerve_fcm_token') || `dev_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      }
    } else {
      fcmToken = localStorage.getItem('fieldnerve_fcm_token') || `dev_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    if (fcmToken) {
      localStorage.setItem('fieldnerve_fcm_token', fcmToken);
      localStorage.setItem('fieldnerve_notif_permission', 'granted');

      // Persist to Firestore if user is identified
      if (userId) {
        try {
          const tokenRef = doc(db, 'users', userId, 'fcm_tokens', fcmToken.substring(0, 32));
          await setDoc(tokenRef, {
            token: fcmToken,
            userId,
            deviceInfo: `${navigator.userAgent.substring(0, 80)}`,
            lastSeenAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          }, { merge: true });
        } catch (dbErr) {
          console.warn('[FCM] Notice saving token to Firestore:', dbErr);
        }
      }
    }

    return { token: fcmToken, permission: 'granted' };
  } catch (err: any) {
    console.error('[FCM] Error requesting token:', err);
    return { token: null, permission: Notification.permission, error: err.message || 'Unknown error' };
  }
}

/**
 * Sets up foreground push listener when the app is actively open
 */
export function setupFCMForegroundListener(
  onNotificationReceived: (notification: FarmerNotificationItem) => void
): () => void {
  let unsubscribe = () => {};

  checkFCMSupport().then(async (supported) => {
    if (!supported) return;

    const messaging = await getFCMInstance();
    if (!messaging) return;

    try {
      unsubscribe = onMessage(messaging, (payload) => {
        console.log('[FCM] Foreground notification received:', payload);

        const newNotif: FarmerNotificationItem = {
          id: `fcm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: 'current',
          type: (payload.data?.type as NotificationType) || 'weather_alert',
          title: payload.notification?.title || payload.data?.title || 'FieldNerve Alert',
          body: payload.notification?.body || payload.data?.body || 'Important agricultural notification.',
          severity: (payload.data?.severity as NotificationSeverity) || 'warning',
          crop: payload.data?.crop,
          read: false,
          createdAt: new Date().toISOString(),
        };

        onNotificationReceived(newNotif);

        // Also trigger native browser notification if allowed and tab isn't focused
        if (Notification.permission === 'granted' && document.hidden) {
          triggerLocalPush(newNotif.title, newNotif.body, newNotif.type);
        }
      });
    } catch (err) {
      console.warn('[FCM] Foreground listener registration error:', err);
    }
  });

  return () => {
    unsubscribe();
  };
}

/**
 * Triggers a direct native browser push notification through ServiceWorker or Web Notification API
 */
export async function triggerLocalPush(
  title: string,
  body: string,
  type: NotificationType = 'weather_alert',
  extraData?: any
): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    // Try via ServiceWorkerRegistration first (most reliable on Android/Chrome)
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.showNotification) {
        await registration.showNotification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: type,
          data: extraData,
        });
        playChime();
        return true;
      }
    }

    // Direct Notification fallback
    new Notification(title, {
      body,
      icon: '/icon-192.png',
      tag: type,
      data: extraData,
    });
    playChime();
    return true;
  } catch (err) {
    console.warn('[FCM] Local push trigger fallback notice:', err);
    return false;
  }
}

/**
 * Plays a short, soft chime when an alert is delivered
 */
function playChime() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  } catch (e) {
    // Audio context not allowed before user interaction
  }
}

/**
 * Saves a notification to Firestore under the farmer's account
 */
export async function saveNotificationToFirestore(
  userId: string,
  notification: Omit<FarmerNotificationItem, 'id' | 'createdAt'>
): Promise<FarmerNotificationItem> {
  const newNotif: FarmerNotificationItem = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    read: false,
  };

  // Cache locally
  try {
    const existingStr = localStorage.getItem(`fieldnerve_notifications_${userId}`);
    const existing: FarmerNotificationItem[] = existingStr ? JSON.parse(existingStr) : [];
    const updated = [newNotif, ...existing].slice(0, 30);
    localStorage.setItem(`fieldnerve_notifications_${userId}`, JSON.stringify(updated));
  } catch (e) {}

  // Sync to Firestore
  try {
    const notifRef = doc(db, 'users', userId, 'notifications', newNotif.id);
    await setDoc(notifRef, newNotif);
  } catch (err) {
    console.warn('[FCM] Error saving notification to Firestore:', err);
  }

  return newNotif;
}

/**
 * Fetches recent notifications for a farmer
 */
export async function fetchFarmerNotifications(userId: string): Promise<FarmerNotificationItem[]> {
  // Check local cache first for instant UI response
  let localItems: FarmerNotificationItem[] = [];
  try {
    const existingStr = localStorage.getItem(`fieldnerve_notifications_${userId}`);
    if (existingStr) {
      localItems = JSON.parse(existingStr);
    }
  } catch (e) {}

  try {
    const notifCol = collection(db, 'users', userId, 'notifications');
    const q = query(notifCol, orderBy('createdAt', 'desc'), limit(25));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const items: FarmerNotificationItem[] = [];
      snap.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as FarmerNotificationItem);
      });
      // Update cache
      localStorage.setItem(`fieldnerve_notifications_${userId}`, JSON.stringify(items));
      return items;
    }
  } catch (err) {
    console.warn('[FCM] Notice fetching notifications from Firestore:', err);
  }

  // Return local cache or default starter alerts if empty
  if (localItems.length > 0) return localItems;

  return [
    {
      id: 'default_weather_1',
      userId,
      type: 'weather_alert',
      title: '⚠️ Unseasonal Rain Advisory (असामयिक वर्षा चेतावनी)',
      titleHi: '⚠️ असामयिक वर्षा चेतावनी - फसल सुरक्षा',
      body: 'Moderate to heavy rain predicted in next 48 hours. Ensure harvested crops are sheltered and drainage channels open.',
      bodyHi: 'आगामी 48 घंटों में हल्की से मध्यम वर्षा की संभावना। कटी हुई फसल को ढकें व जल निकासी मार्ग खोलें।',
      severity: 'warning',
      crop: 'Wheat / Mustard',
      read: false,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'default_crop_2',
      userId,
      type: 'crop_health',
      title: '🌾 Tillering Stage Nitrogen Boost (नाइट्रोजन टॉप ड्रेसिंग)',
      titleHi: '🌾 कल्ले फूटने की अवस्था - यूरिया खुराक',
      body: 'Optimal window for 2nd irrigation and top-dressing 45 kg Urea per acre to maximize productive tillers.',
      bodyHi: 'दूसरी सिंचाई के बाद 45 किलो यूरिया प्रति एकड़ का दूसरा टॉप ड्रेसिंग करें ताकि अधिक कल्ले फूटें।',
      severity: 'info',
      crop: 'Wheat (गेहूं)',
      read: false,
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    },
    {
      id: 'default_pest_3',
      userId,
      type: 'pest_alert',
      title: '🔍 Yellow Rust / Aphid Scout Alert (पीला रतुआ व चेपा निगरानी)',
      titleHi: '🔍 पीला रतुआ व माहू (चेपा) की निगरानी',
      body: 'Cloudy weather favorable for aphid & fungal spread. Inspect lower leaves for yellow powdery pustules.',
      bodyHi: 'बादल छाए रहने से माहू व रतुआ का खतरा बढ़ सकता है। निचली पत्तियों पर पीले धब्बों की नियमित जांच करें।',
      severity: 'critical',
      crop: 'Mustard / Wheat',
      read: true,
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
  ];
}

/**
 * Pre-curated Weather Alert Templates for quick simulation or real dispatch
 */
export const WEATHER_ALERT_TEMPLATES = [
  {
    title: '⚠️ Heavy Rainfall Alert (भारी वर्षा की चेतावनी)',
    titleHi: '⚠️ भारी वर्षा की चेतावनी - जल निकासी सुनिश्चित करें',
    body: 'Continuous rain expected in next 24-36 hrs. Postpone fertilizer/pesticide sprays and protect harvested produce.',
    bodyHi: 'अगले 24-36 घंटों में लगातार वर्षा की संभावना। कीटनाशक व खाद का छिड़काव रोकें और कटी फसल सुरक्षित रखें।',
    severity: 'critical' as NotificationSeverity,
    type: 'weather_alert' as NotificationType,
  },
  {
    title: '🌡️ High Temperature & Heat Stress Warning (लू व तापमान वृद्धि)',
    titleHi: '🌡️ तापमान में अचानक वृद्धि की चेतावनी',
    body: 'Max temp reaching 36°C with dry winds. Provide light evening irrigation to prevent premature grain shriveling.',
    bodyHi: 'तापमान में वृद्धि व शुष्क हवाएं। दानों को सिकुड़ने से बचाने के लिए शाम के समय हल्की सिंचाई करें।',
    severity: 'warning' as NotificationSeverity,
    type: 'weather_alert' as NotificationType,
  },
  {
    title: '💨 Strong Winds & Lodging Risk (तेज हवा व फसल गिरने का जोखिम)',
    titleHi: '💨 तेज आंधी व फसल गिरने (Lodging) का खतरा',
    body: 'Gusts up to 45 km/h predicted. Avoid deep irrigation in tall standing crops like wheat & mustard.',
    bodyHi: '45 किमी/घंटा तक तेज हवाएं चलने का अनुमान। लंबी फसलों में गहरी सिंचाई न करें ताकि फसल गिरे नहीं।',
    severity: 'warning' as NotificationSeverity,
    type: 'weather_alert' as NotificationType,
  },
];

/**
 * Pre-curated Crop Health Reminder Templates
 */
export const CROP_HEALTH_TEMPLATES = [
  {
    title: '🌾 CRI & Root Growth Reminder (ताज जड़ अवस्था देखभाल)',
    titleHi: '🌾 सीआरआई अवस्था (21-25 दिन) - पहली सिंचाई',
    body: 'Crown Root Initiation stage active. Apply 1st irrigation now for vigorous root penetration and tiller formation.',
    bodyHi: 'सीआरआई अवस्था सक्रिय। जड़ों के फैलाव व मजबूत कल्लों के लिए पहली सिंचाई तुरंत करें।',
    severity: 'info' as NotificationSeverity,
    type: 'crop_health' as NotificationType,
    crop: 'Wheat',
  },
  {
    title: '🛡️ Aphid / Chepa Spray Advisory (माहू कीट नियंत्रण)',
    titleHi: '🛡️ सरसों में चेपा (माहू) कीट नियंत्रण छिड़काव',
    body: 'Aphid population threshold crossed. Foliar spray of Thiamethoxam 25% WG @ 80g/acre recommended.',
    bodyHi: 'चेपा कीट दिखने पर थायोमेथोक्सम 25% WG (80 ग्राम/एकड़) का 150 लीटर पानी में घोल बनाकर छिड़काव करें।',
    severity: 'critical' as NotificationSeverity,
    type: 'pest_alert' as NotificationType,
    crop: 'Mustard',
  },
  {
    title: '💧 Soil Aeration & Weed Control (निराई-गुड़ाई व खरपतवार नियंत्रण)',
    titleHi: '💧 हल्की निराई-गुड़ाई व खरपतवार नियंत्रण',
    body: 'Light hoeing improves root aeration and breaks soil crust after recent moisture changes.',
    bodyHi: 'नमी के बाद मिट्टी की पपड़ी तोड़ने और जड़ों में हवा संचार के लिए हल्की निराई-गुड़ाई करें।',
    severity: 'info' as NotificationSeverity,
    type: 'crop_health' as NotificationType,
    crop: 'General',
  },
];
