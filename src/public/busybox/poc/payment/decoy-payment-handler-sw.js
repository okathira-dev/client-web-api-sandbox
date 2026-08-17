// @ts-nocheck
// This handler is intentionally a decoy. Choosing it must never open a box.
self.addEventListener("install", (event) => event.waitUntil(self.skipWaiting()));
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("canmakepayment", (event) => {
  event.respondWith(Promise.resolve(true));
});
self.addEventListener("paymentrequest", (event) => {
  event.respondWith(Promise.resolve({
    methodName: event.methodData?.[0]?.supportedMethods ?? "busybox:decoy",
    details: { accepted: false, outcome: "decoy", attempt: 1 },
  }));
});
