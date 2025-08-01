import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { firebaseApp } from "@/lib/firebase";
import api from "@/services/axios";
import { toast } from "sonner";

export const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    console.log("Notification permission:", permission);

    try {
        if(permission === "granted") {
            // Wait for service worker to be ready
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready;
                console.log("Service worker ready:", registration);
                
                const messaging = getMessaging(firebaseApp);
                const token = await getToken(messaging, {
                    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
                    serviceWorkerRegistration: registration
                });
                
                console.log("FCM token:", token);
                
                if(token){
                    await api.put("/users/push-token", {token});
                    console.log("FCM token saved to backend");
                }
            } else {
                console.error("Service Worker not supported");
            }
        }
    } catch (error) {
        console.error("Error requesting notification permission:", error);
    }
}

export const setupForegroundNotification = async()=>{
    const messaging = getMessaging(firebaseApp);
    onMessage(messaging,(payload)=>{
        console.log("[Foreground Notification]",payload);
        if(payload.notification?.title && payload.notification?.body){
            toast(payload.notification.title, {
                description: payload.notification.body,
                action: {
                    label: "View",
                    onClick: () => {
                        // Get chatId from payload data and navigate
                        if (payload.data?.chatId) {
                            window.location.href = `/chat/${payload.data.chatId}`;
                        }
                    }
                },
                duration: 5000,
            });
        }
    })
}