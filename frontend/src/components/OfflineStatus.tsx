import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { WifiOff, Wifi, RefreshCw, AlertCircle } from 'lucide-react';
import { getCacheSize } from '@/utils/pwa';

export const OfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [cacheSize, setCacheSize] = useState<string>('0 KB');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Get cache size on mount
    getCacheSize().then(size => {
      const sizeInMB = (size / (1024 * 1024)).toFixed(2);
      setCacheSize(size > 1024 * 1024 ? `${sizeInMB} MB` : `${(size / 1024).toFixed(0)} KB`);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Attempt to reload the page
      window.location.reload();
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const dismissBanner = () => {
    setShowOfflineBanner(false);
  };

  if (!showOfflineBanner && isOnline) {
    return null;
  }

  return (
    <>
      {/* Offline Banner */}
      {showOfflineBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white px-4 py-2">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm font-medium">
                You're offline. Some features may be limited.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs opacity-90">
                Cached: {cacheSize}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={dismissBanner}
                className="text-white hover:bg-orange-600 h-6 px-2"
              >
                ✕
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Connection Status Indicator (bottom right) */}
      <div className="fixed bottom-4 left-4 z-40">
        <Card className={`shadow-lg transition-all duration-300 ${
          isOnline 
            ? 'border-green-200 bg-green-50' 
            : 'border-orange-200 bg-orange-50'
        }`}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Online</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <WifiOff className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-700">Offline</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="h-6 px-2 text-orange-700 hover:bg-orange-100"
                  >
                    {isRefreshing ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                  </Button>
                </>
              )}
            </div>
            
            {/* Cache info when offline */}
            {!isOnline && (
              <div className="mt-2 pt-2 border-t border-orange-200">
                <div className="flex items-center gap-1 text-xs text-orange-600">
                  <AlertCircle className="h-3 w-3" />
                  <span>Running from cache ({cacheSize})</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}; 