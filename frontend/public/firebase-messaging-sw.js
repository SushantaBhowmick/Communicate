// Firebase messaging service worker - simplified version for push notifications only
importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js");

// Firebase configuration - using the same config as main app
firebase.initializeApp({
  apiKey: "AIzaSyAiKj1W0dBZk-b-KSmT7t7vP0l7W1FTF_Y",
  authDomain: "communicate-ee5b4.firebaseapp.com",
  projectId: "communicate-ee5b4",
  storageBucket: "communicate-ee5b4.firebasestorage.app",
  messagingSenderId: "695374978901",
  appId: "1:695374978901:web:ba1e7f9d6e2b2c7b7a2b9e",
  measurementId: "G-3NBQZ7RKQY"
});

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log('[Firebase SW] Received background message:', payload);
  
  const notificationTitle = payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message',
    icon: '/vite.svg', // Using default vite icon since we removed PWA icons
    data: {
      chatId: payload.data?.chatId,
      senderId: payload.data?.senderId,
      senderName: payload.data?.senderName,
      url: payload.data?.chatId ? `/chat/${payload.data.chatId}` : '/chat'
    },
    actions: [
      {
        action: 'open_chat',
        title: 'View Message'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    requireInteraction: true,
    vibrate: [200, 100, 200],
    tag: 'chat-message'
  };

  console.log('[Firebase SW] Showing notification with options:', notificationOptions);
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[Firebase SW] Notification clicked:', event);
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/chat';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open with the app
      for (const client of clientList) {
        if (client.url.includes(new URL(urlToOpen, self.location.origin).pathname)) {
          return client.focus();
        }
      }
      
      // If no existing window, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

console.log('[Firebase SW] Firebase messaging service worker loaded successfully');