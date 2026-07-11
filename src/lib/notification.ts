import { getToken } from "firebase/messaging";
import { doc, setDoc } from "firebase/firestore";
import { db, messaging } from "../firebase";

export async function registerNotifications(uid?: string) {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") return;

    const vapidKey = (import.meta as any).env?.VITE_FIREBASE_VAPID_KEY;
    const token = await getToken(messaging, {
        vapidKey,
    });

    console.log(token);

    await setDoc(
        doc(db, "notificationTokens", token),
        {
            token,
            uid: uid ?? null,
            createdAt: new Date().toISOString()
        }
    );
}