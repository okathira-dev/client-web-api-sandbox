// @ts-nocheck
const requestId = new URLSearchParams(location.search).get("requestId");
const amount = document.querySelector("#amount");
const state = document.querySelector("#state");
const actions = document.querySelector("#actions");
const walletSymbol = document.querySelector("#wallet-symbol");
const send = (message) =>
  navigator.serviceWorker.controller?.postMessage({
    channel: "busybox-payment",
    requestId,
    ...message,
  });

navigator.serviceWorker.addEventListener("message", (event) => {
  const data = event.data;
  if (
    data?.channel !== "busybox-payment" ||
    data.type !== "payment-context" ||
    data.requestId !== requestId
  ) {
    return;
  }
  walletSymbol.textContent = data.walletSymbol;
  amount.textContent = `BBX 1.00 · ${data.attempt}`;
  actions.hidden = false;
  actions.querySelector('[data-action="retry"]').hidden = data.attempt !== 1;
  state.textContent = "選択してください";
});

for (const button of actions.querySelectorAll("button")) {
  button.addEventListener("click", () => {
    state.textContent = "送信しました";
    actions.hidden = true;
    send({ type: "handler-action", action: button.dataset.action });
  });
}

void navigator.serviceWorker.ready.then(() => send({ type: "handler-ready" }));
