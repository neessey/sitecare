import { getToken } from "firebase/messaging";
import { doc, setDoc } from "firebase/firestore";
import { db, messaging } from "../firebase";

export async function registerNotifications(uid?: string) {
    // 1. Vérifs préalables spécifiques iOS
    if (!("Notification" in window)) {
        console.warn("Notifications non supportées sur ce navigateur.");
        return;
    }

    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
        || (window.navigator as any).standalone === true;

    if (!isStandalone) {
        console.warn("L'app doit être ajoutée à l'écran d'accueil pour recevoir des notifications sur iOS.");
        return; // ou affiche un message à l'utilisateur : "Ajoute l'app à ton écran d'accueil d'abord"
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        // 2. Enregistrement explicite du SW avant getToken
        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        await navigator.serviceWorker.ready;

        const token = await getToken(messaging, {
            vapidKey: (import.meta as any).env.VITE_FIREBASE_VAPID_KEY,
            serviceWorkerRegistration: registration,
        });

        if (!token) {
            console.warn("Aucun token FCM généré.");
            return;
        }

        await setDoc(
            doc(db, "notificationTokens", token),
            {
                token,
                uid: uid ?? null,
                createdAt: new Date().toISOString(),
            }
        );

        console.log("Token FCM enregistré:", token);
    } catch (err) {
        console.error("Erreur lors de l'enregistrement des notifications:", err);
    }
}