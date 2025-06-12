// Firebase Cloud Messaging Service Worker
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAYE4oGUJ8pDQrGiEc38zpdmmvy0M-IKEQ",
  authDomain: "woody-vacation-planning-tool.firebaseapp.com",
  databaseURL:
    "https://woody-vacation-planning-tool-default-rtdb.firebaseio.com",
  projectId: "woody-vacation-planning-tool",
  storageBucket: "woody-vacation-planning-tool.firebasestorage.app",
  messagingSenderId: "584460527088",
  appId: "1:584460527088:web:4f8ee57fbbcb0d69902935",
  measurementId: "G-E4NRMZ121G",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging object.
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function (payload) {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  // Customize notification here
  const notificationTitle =
    payload.notification?.title || "Disney Vacation Planning";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new message",
    icon: payload.notification?.icon || "/icons/disney-badge.png",
    badge: "/icons/disney-badge.png",
    tag: payload.data?.type || "default",
    data: payload.data,
    actions: [
      {
        action: "open",
        title: "Open App",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
  };

  // Handle different message types
  if (payload.data?.type === "group_message") {
    notificationOptions.body = `${payload.data.senderName}: ${payload.data.content}`;
    notificationOptions.tag = `message-${payload.data.vacationId}`;
    notificationOptions.actions = [
      {
        action: "reply",
        title: "Reply",
      },
      {
        action: "open_chat",
        title: "Open Chat",
      },
    ];
  } else if (payload.data?.type === "location_update") {
    notificationOptions.body = `${payload.data.userName} shared their location`;
    notificationOptions.tag = `location-${payload.data.vacationId}`;
  } else if (payload.data?.type === "geofence_alert") {
    notificationOptions.body = `${payload.data.userName} ${payload.data.alertType} ${payload.data.geofenceName}`;
    notificationOptions.tag = `geofence-${payload.data.geofenceId}`;
  }

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

// Handle notification clicks
self.addEventListener("notificationclick", function (event) {
  console.log("[firebase-messaging-sw.js] Notification click received.");

  event.notification.close();

  // Handle different actions
  if (event.action === "reply") {
    // Open a reply interface
    event.waitUntil(
      clients.openWindow(
        "/dashboard/group/" +
          event.notification.data?.vacationId +
          "?action=reply"
      )
    );
  } else if (event.action === "open_chat") {
    // Open the chat interface
    event.waitUntil(
      clients.openWindow(
        "/dashboard/group/" + event.notification.data?.vacationId
      )
    );
  } else if (event.action === "dismiss") {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then(function (clientList) {
          // If app is already open, focus it
          for (const client of clientList) {
            if (client.url.includes("/dashboard") && "focus" in client) {
              return client.focus();
            }
          }

          // Otherwise open a new window
          if (clients.openWindow) {
            const targetUrl =
              event.notification.data?.targetUrl || "/dashboard";
            return clients.openWindow(targetUrl);
          }
        })
    );
  }
});

// Handle push subscription
self.addEventListener("push", function (event) {
  console.log("[firebase-messaging-sw.js] Push received:", event);

  // This will be handled by the onBackgroundMessage above
  // but you can add custom logic here if needed
});

// Update service worker
self.addEventListener("install", function (event) {
  console.log("[firebase-messaging-sw.js] Service worker installing...");
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  console.log("[firebase-messaging-sw.js] Service worker activating...");
  // Ensure the service worker takes control immediately
  event.waitUntil(self.clients.claim());
});
