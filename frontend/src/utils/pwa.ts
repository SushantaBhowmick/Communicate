// PWA utility functions

declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let isInstallable = false;

// Check if PWA is already installed
export const isPWAInstalled = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
};

// Check if PWA is installable
export const isPWAInstallable = (): boolean => {
  return isInstallable && !isPWAInstalled();
};

// Get the deferred install prompt
export const getDeferredPrompt = (): BeforeInstallPromptEvent | null => {
  return deferredPrompt;
};

// Show PWA install prompt
export const showInstallPrompt = async (): Promise<boolean> => {
  if (!deferredPrompt) {
    console.log('No install prompt available');
    return false;
  }

  try {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA install accepted');
      deferredPrompt = null;
      isInstallable = false;
      return true;
    } else {
      console.log('PWA install dismissed');
      return false;
    }
  } catch (error) {
    console.error('Error showing install prompt:', error);
    return false;
  }
};

// Register service worker
export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered:', registration);

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New service worker available');
              // You can show a notification to reload the app here
              if (window.confirm('New version available! Reload to update?')) {
                window.location.reload();
              }
            }
          });
        }
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Initialize PWA
export const initializePWA = (): void => {
  // Register service worker
  registerServiceWorker();

  // Listen for beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    console.log('beforeinstallprompt event fired');
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    isInstallable = true;
    
    // Dispatch custom event to notify components
    window.dispatchEvent(new CustomEvent('pwa-installable'));
  });

  // Listen for app installation
  window.addEventListener('appinstalled', (e) => {
    console.log('PWA installed successfully', e);
    deferredPrompt = null;
    isInstallable = false;
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  });

  // Check if already installed
  if (isPWAInstalled()) {
    console.log('PWA is already installed');
  }
};

// Cache management utilities
export const clearPWACache = async (): Promise<void> => {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('PWA caches cleared');
  }
};

export const getCacheSize = async (): Promise<number> => {
  if (!('caches' in window)) return 0;
  
  let total = 0;
  const cacheNames = await caches.keys();
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        total += blob.size;
      }
    }
  }
  
  return total;
}; 