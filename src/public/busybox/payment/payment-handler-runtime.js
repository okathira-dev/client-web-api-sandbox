// @ts-nocheck
// Shared fictional Payment Handler runtime. It never processes money or credentials.
const wallet = self.BUSYBOX_WALLET;
const pending = new Map();
const attempts = new Map();
const handlerWindow = new URL(
  "./payment-handler-window.html",
  self.registration.scope,
).href;

function sendToClients(message) {
  return self.clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((clients) => {
      for (const client of clients) client.postMessage(message);
    });
}

function resolvePending(requestId, value) {
  const entry = pending.get(requestId);
  if (!entry) return false;
  pending.delete(requestId);
  clearTimeout(entry.timeoutId);
  entry.resolve(value);
  return true;
}

self.addEventListener("install", (event) => event.waitUntil(self.skipWaiting()));
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim()),
);
self.addEventListener("canmakepayment", (event) =>
  event.respondWith(Promise.resolve(true)),
);
self.addEventListener("message", (event) => {
  const data = event.data;
  if (data?.channel !== "busybox-payment") return;
  if (data.type === "handler-ready") {
    const entry = pending.get(data.requestId);
    if (!entry) return;
    entry.clientId = event.source?.id;
    void self.clients.get(entry.clientId).then((client) =>
      client?.postMessage({
        channel: "busybox-payment",
        type: "payment-context",
        requestId: data.requestId,
        attempt: entry.attempt,
        total: entry.total,
        wallet: wallet.id,
        walletSymbol: wallet.symbol,
      }),
    );
    return;
  }
  if (data.type !== "handler-action") return;
  const entry = pending.get(data.requestId);
  if (!entry || (entry.clientId && event.source?.id !== entry.clientId)) return;
  const outcome =
    data.action === "approve"
      ? "approved"
      : data.action === "decline"
        ? "declined"
        : data.action === "retry"
          ? "needs-retry"
          : "unknown";
  resolvePending(data.requestId, {
    methodName: entry.methodName,
    details: {
      accepted: outcome === "approved",
      outcome,
      attempt: entry.attempt,
      wallet: wallet.id,
    },
  });
});
self.addEventListener("paymentrequest", (event) => {
  event.respondWith(
    (async () => {
      const entry = event.methodData?.[0];
      const requestId = event.paymentRequestId ?? crypto.randomUUID();
      const attempt = (attempts.get(requestId) ?? 0) + 1;
      attempts.set(requestId, attempt);
      const methodName = String(
        entry?.supportedMethods ?? "busybox:fictional-wallet",
      );
      const total = event.total ?? null;
      await sendToClients({
        channel: "busybox-payment",
        type: "handler-event",
        requestId,
        trusted: event.isTrusted === true,
        methodName,
        attempt,
        wallet: wallet.id,
      });
      const result = await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          pending.delete(requestId);
          reject(
            new DOMException("Payment handler window timed out", "AbortError"),
          );
        }, 120_000);
        pending.set(requestId, {
          resolve,
          reject,
          attempt,
          total,
          methodName,
          clientId: null,
          timeoutId,
        });
        event
          .openWindow(
            `${handlerWindow}?requestId=${encodeURIComponent(requestId)}`,
          )
          .catch(reject);
      });
      if (result.details.outcome !== "needs-retry" || attempt > 1) {
        attempts.delete(requestId);
      }
      return result;
    })(),
  );
});
