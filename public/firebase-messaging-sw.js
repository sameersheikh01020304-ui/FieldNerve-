// Firebase Cloud Messaging Service Worker for FieldNerve
// Handles background push notifications for weather alerts & crop reminders

importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

// Initialize Firebase inside the Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyBUrFXo5V62EpVktrqnPNRkCNlkb6uwHus",
  authDomain: "fieldnerve.firebaseapp.com",
  projectId: "fieldnerve",
  storageBucket: "fieldnerve.firebasestorage.app",
  messagingSenderId: "390410057924",
  appId: "1:390410057924:web:9fd0698812ea49516eb191"
});

const messaging = firebase.messaging();

// Background message listener
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message received: ', payload);

  const title = payload.notification?.title || payload.data?.title || '🌾 FieldNerve Alert';
  const body = payload.notification?.body || payload.data?.body || 'Important weather alert or crop health advisory.';
  const type = payload.data?.type || 'crop_alert';

  const notificationOptions = {
    body: body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: type,
    renotify: true,
    data: {
      url: payload.data?.url || '/',
      type: type,
      timestamp: Date.now()
    },
    actions: [
      { action: 'open_app', title: 'Open FieldNerve' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  self.registration.showNotification(title, notificationOptions);
});

// Notification click event handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Open or focus the app window
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
