// Import Firebase scripts
importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js");

// Import Workbox (will be injected by vite-plugin-pwa)
// Workbox manifest will be injected here
const manifest = self.__WB_MANIFEST;
console.log('[SW] Workbox manifest:', manifest);

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

// PWA Caching Strategy
const STATIC_CACHE_NAME = 'chatrix-static-v1';
const DYNAMIC_CACHE_NAME = 'chatrix-dynamic-v1';

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Received background message:', payload);
  
  const notificationTitle = payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: {
      chatId: payload.data?.chatId,
      senderId: payload.data?.senderId,
      senderName: payload.data?.senderName,
      url: payload.data?.chatId ? `/chat/${payload.data.chatId}` : '/chat'
    },
    actions: [
      {
        action: 'open_chat',
        title: 'View Message',
        icon: '/icons/icon-72x72.png'
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

  console.log('[SW] Showing notification with options:', notificationOptions);
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Enhanced notification click handler
self.addEventListener('notificationclick', (event) => {
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

// Install event - let Workbox handle precaching
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  self.skipWaiting();
});

// Activate event - clean old caches and let Workbox handle activation
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME && !cacheName.startsWith('workbox-')) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - enhanced caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // API requests - Network First with cache fallback
  if (url.pathname.startsWith('/api/') || url.origin.includes('api.')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response before caching
          const responseClone = response.clone();
          if (response.status === 200) {
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline page for API requests if no cache
            return new Response(JSON.stringify({ error: 'Offline' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // For other requests, let Workbox handle them or fall back to network
  // This allows Workbox precaching to work while adding custom logic for APIs
});

// Background sync for offline messages
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(
      // Here you could implement offline message queue processing
      Promise.resolve()
    );
  }
});

// Push event (additional handler for direct push events)
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received:', event);
  
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      data: {
        url: data.url
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

console.log('[SW] Service worker loaded successfully');
console.log('[SW] Firebase messaging initialized');

// Listen for messages from main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Received message from main thread:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 