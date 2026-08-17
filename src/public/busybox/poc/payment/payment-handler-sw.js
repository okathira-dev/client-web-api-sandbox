// @ts-nocheck
// This is a local-only fictional payment handler. It never processes money or
// stores payment credentials. It exists to expose the browser-owned lifecycle.
const pending = new Map();
const retryAttempts = new Map();
const windowPath = new URL("./payment-handler-window.html", self.registration.scope).href;

function methodEntry(event) {
  return event.methodData?.find((entry) =>
    String(entry.supportedMethods).endsWith("/payment/method"),
  ) ?? event.methodData?.[0];
}

function sendToClients(message) {
  return self.clients.matchAll({ type: "window", includeUncontrolled: true })
    .then((clients) => {
      for (const client of clients) client.postMessage(message);
    });
}

function sendToHandler(entry, message) {
  if (!entry?.clientId) return Promise.resolve();
  return self.clients.get(entry.clientId).then((client) => {
    client?.postMessage(message);
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
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("canmakepayment", (event) => {
  event.respondWith(Promise.resolve(true));
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (data?.channel !== "busybox-payment") return;

  if (data.type === "handler-ready") {
    const entry = pending.get(data.requestId);
    if (!entry) return;
    entry.clientId = event.source?.id;
    void sendToHandler(entry, {
      channel: "busybox-payment",
      type: "payment-context",
      requestId: data.requestId,
      mode: entry.mode,
      attempt: entry.attempt,
      total: entry.total,
    });
    return;
  }

  if (data.type !== "handler-action") return;
  const entry = pending.get(data.requestId);
  if (!entry || (entry.clientId && event.source?.id !== entry.clientId)) return;
  const action = data.action;
  const outcome =
    action === "approve"
      ? "approved"
      : action === "decline"
        ? "declined"
        : action === "retry"
          ? "needs-retry"
          : "unknown";
  resolvePending(data.requestId, {
    methodName: entry.methodName,
    details: {
      accepted: outcome === "approved",
      outcome,
      attempt: entry.attempt,
    },
  });
});

self.addEventListener("paymentrequest", (event) => {
  event.respondWith((async () => {
    const entry = methodEntry(event);
    const requestId = event.paymentRequestId ?? crypto.randomUUID();
    const data = entry?.data ?? {};
    const mode = data.busyboxMode ?? "approve";
    const previousAttempts = retryAttempts.get(requestId) ?? 0;
    const attempt = previousAttempts + 1;
    retryAttempts.set(requestId, attempt);
    const methodName = String(entry?.supportedMethods ?? "busybox:test");
    const total = event.total ?? null;

    await sendToClients({
      channel: "busybox-payment",
      type: "handler-event",
      requestId,
      trusted: event.isTrusted === true,
      methodName,
      mode,
      attempt,
    });

    const result = await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        pending.delete(requestId);
        reject(new DOMException("Payment handler window timed out", "AbortError"));
      }, 120000);
      pending.set(requestId, {
        resolve,
        reject,
        mode,
        attempt,
        total,
        methodName,
        clientId: null,
        timeoutId,
      });
      event.openWindow(`${windowPath}?requestId=${encodeURIComponent(requestId)}`)
        .catch(reject);
    });

    if (result.details.outcome !== "needs-retry" || attempt > 1) {
      retryAttempts.delete(requestId);
    }
    await sendToClients({
      channel: "busybox-payment",
      type: "handler-response",
      requestId,
      methodName,
      mode,
      attempt,
      outcome: result.details.outcome,
    });
    return result;
  })());
});
