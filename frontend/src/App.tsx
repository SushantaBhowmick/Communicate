import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { LandingPage } from "./pages/LandingPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ChatPage } from "./pages/ChatPage";
import { ChatLayout } from "./layouts/ChatLayouts";
import { WelcomePanel } from "./components/WelcomePanel";
import { ProfilePage } from "./pages/ProfilePage";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { OfflineStatus } from "./components/OfflineStatus";
import { useEffect } from "react";
import { setupForegroundNotification } from "./utils/push";
import { initializePWA } from "./utils/pwa";
import { initializeOfflineQueue } from "./utils/offlineQueue";
import { Toaster } from "sonner";

function App() {

  useEffect(()=>{
    setupForegroundNotification();
    initializePWA();
    initializeOfflineQueue();
  },[])

  return (
    <Router>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'white',
            border: '1px solid #e5e7eb',
            color: '#374151',
          },
        }}
      />
      
      {/* PWA Components */}
      <PWAInstallPrompt />
      <OfflineStatus />
      
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<WelcomePanel />} />
          <Route path=":chatId" element={<ChatPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
