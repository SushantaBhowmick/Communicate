import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { isPWAInstallable, showInstallPrompt, isPWAInstalled } from '@/utils/pwa';

interface PWAInstallPromptProps {
  onClose?: () => void;
}

export const PWAInstallPrompt = ({ onClose }: PWAInstallPromptProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check if PWA is installable and not already installed
    const checkInstallability = () => {
      if (isPWAInstallable() && !isPWAInstalled()) {
        setIsVisible(true);
      }
    };

    // Initial check
    checkInstallability();

    // Listen for PWA events
    const handleInstallable = () => {
      if (!isPWAInstalled()) {
        setIsVisible(true);
      }
    };

    const handleInstalled = () => {
      setIsVisible(false);
      setIsInstalling(false);
    };

    window.addEventListener('pwa-installable', handleInstallable);
    window.addEventListener('pwa-installed', handleInstalled);

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await showInstallPrompt();
      if (success) {
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Failed to install PWA:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="shadow-lg border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Install Chatrix</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0 hover:bg-blue-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-sm">
            Install our app for a better experience with offline access and push notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-3 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Smartphone className="h-4 w-4" />
              <span>Mobile friendly</span>
            </div>
            <div className="flex items-center gap-1">
              <Monitor className="h-4 w-4" />
              <span>Works offline</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleInstall}
              disabled={isInstalling}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isInstalling ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Installing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Install App
                </div>
              )}
            </Button>
            <Button variant="outline" onClick={handleClose} className="px-3">
              Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 