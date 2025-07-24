import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { firebaseApp } from "@/lib/firebase";
import api from "@/services/axios";
import { toast } from "sonner";

export const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
console.log("called")

    try {
        if(permission === "granted") {
        const messaging = getMessaging(firebaseApp)
        const token = await getToken(messaging,{
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        });
console.log("token",token)
        if(token){
            await api.put("/users/push-token",{token})
        }
    }
    } catch (error) {
      console.log(error)  
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