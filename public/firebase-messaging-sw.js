importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

firebase.initializeApp({
   apiKey: "AIzaSyBmf5GRWwdjwIHxqoIu8xMifKFfvoW_-LQ",
  authDomain: "sitecare-2217f.firebaseapp.com",
  projectId: "sitecare-2217f",
  storageBucket: "sitecare-2217f.firebasestorage.app",
  messagingSenderId: "1096055129101",
  appId: "1:1096055129101:web:f395b1449d44f791d24144"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {

    self.registration.showNotification(
        payload.notification.title,
        {
            body: payload.notification.body,
            icon: "/assets/site_care_icon.jpg"
        }
    );

});