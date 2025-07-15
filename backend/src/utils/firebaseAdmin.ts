
import admin from 'firebase-admin'
import serviceAccount from  "../firebase-communicate.json";

if(!admin.apps.length){
    admin.initializeApp({
        credential:admin.credential.cert(serviceAccount as any)
    });
}

export const messaging = admin.messaging();
