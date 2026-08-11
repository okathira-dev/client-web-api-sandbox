const output = document.querySelector<HTMLOutputElement>("#receipt-status");
const nonce = new URL(location.href).searchParams.get("nonce");
function setStatus(message: string): void {
  if (output) output.value = message;
}

function readReceipt(): void {
  if (!nonce) {
    setStatus(
      "nonceがありません。senderからのfull-document navigationだけを検証対象にします。",
    );
    return;
  }
  let attempts = 0;
  const ask = (): void => {
    attempts += 1;
    navigator.serviceWorker.controller?.postMessage({
      type: "read-receipt",
      nonce,
    });
  };
  const timer = window.setInterval(ask, 100);
  navigator.serviceWorker.addEventListener("message", (event) => {
    const data = event.data;
    if (typeof data === "object" && data !== null && "status" in data) {
      setStatus(String(data.status));
      if (("found" in data && data.found) || attempts >= 50) {
        window.clearInterval(timer);
      }
    }
  });
  ask();
}

readReceipt();
