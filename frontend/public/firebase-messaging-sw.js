importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  messagingSenderId: "...",
  appId: "...",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message',
    icon: '/vite.svg',
    badge: '/vite.svg',
    data: {
      chatId: payload.data?.chatId,
      senderId: payload.data?.senderId,
      senderName: payload.data?.senderName,
    },
    actions: [
      {
        action: 'open_chat',
        title: 'View Message'
      }
    ],
    requireInteraction: true,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click events
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open_chat' || !event.action) {
    const chatId = event.notification.data?.chatId;
    if (chatId) {
      const chatUrl = `/chat/${chatId}`;
      
      event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
          // Check if there's already a window open with the chat
          for (const client of clientList) {
            if (client.url.includes(chatUrl) && 'focus' in client) {
              return client.focus();
            }
          }
          
          // If no existing window, open a new one
          if (clients.openWindow) {
            return clients.openWindow(chatUrl);
          }
        })
      );
    }
  }
});
