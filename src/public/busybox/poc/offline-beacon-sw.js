// @ts-nocheck -- This standalone file executes in ServiceWorkerGlobalScope, while
// the repository TypeScript project intentionally targets the Window DOM library.
const databaseName = "busybox-poc-offline-beacon";
const storeName = "receipts";

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.addEventListener("upgradeneeded", () => {
      request.result.createObjectStore(storeName, { keyPath: "nonce" });
    });
    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error));
  });
}

async function commitReceipt(nonce) {
  const database = await openDatabase();
  await new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readwrite");
    transaction.objectStore(storeName).put({ nonce, receivedAt: Date.now() });
    transaction.addEventListener("complete", () => resolve());
    transaction.addEventListener("abort", () => reject(transaction.error));
    transaction.addEventListener("error", () => reject(transaction.error));
  });
  database.close();
}

async function findReceipt(nonce) {
  const database = await openDatabase();
  const receipt = await new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readonly");
    const request = transaction.objectStore(storeName).get(nonce);
    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error));
  });
  database.close();
  return Boolean(receipt);
}

function receiverDocument() {
  return `<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Busybox offline Beacon receiver</title><main><h1>Offline Beacon receiver</h1><output id="receipt-status" aria-live="polite">worker receiptを照会中</output><p><a href="../">PoC一覧へ戻る</a></p></main><script>const output=document.querySelector('#receipt-status'),nonce=new URL(location.href).searchParams.get('nonce');let attempts=0;const ask=()=>{attempts+=1;navigator.serviceWorker.controller?.postMessage({type:'read-receipt',nonce})};const timer=setInterval(ask,100);navigator.serviceWorker.addEventListener('message',event=>{output.value=event.data.status;if(event.data.found||attempts>=50)clearInterval(timer)});ask();</script></html>`;
}

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (
    event.request.method === "GET" &&
    url.pathname.endsWith("/offline-beacon/receiver.html")
  ) {
    event.respondWith(
      Promise.resolve(
        new Response(receiverDocument(), {
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
      ),
    );
    return;
  }
  if (
    event.request.method !== "POST" ||
    !url.pathname.endsWith("/offline-beacon/receipt")
  ) {
    return;
  }
  event.respondWith(
    (async () => {
      const body = await event.request.json().catch(() => null);
      const nonce =
        typeof body === "object" && body !== null && "nonce" in body
          ? body.nonce
          : undefined;
      if (typeof nonce !== "string" || nonce.length < 8) {
        return new Response(null, { status: 400 });
      }
      await commitReceipt(nonce);
      return new Response(null, { status: 204 });
    })(),
  );
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (
    typeof data !== "object" ||
    data === null ||
    data.type !== "read-receipt" ||
    typeof data.nonce !== "string" ||
    !event.source
  ) {
    return;
  }
  void findReceipt(data.nonce)
    .then((found) => {
      event.source?.postMessage({
        found,
        status: found
          ? "worker receiptを1件確認。server停止中でもこの表示ならoffline経路が成立。"
          : "receiptなし。sender、worker制御、またはoffline条件を確認する。",
      });
    })
    .catch(() => {
      event.source?.postMessage({
        status: "receipt読み取りに失敗しました。",
      });
    });
});
