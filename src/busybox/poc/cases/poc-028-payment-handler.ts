import type { PocRoot } from "../contracts";

type PaymentMode = "approve" | "decline" | "retry";
type StageBox = "B01" | "B02" | "B03";

type PaymentResponseLike = {
  methodName: string;
  details: unknown;
  complete: (result?: string) => Promise<void>;
  retry?: (errors?: unknown) => Promise<void>;
};

type PaymentRequestLike = {
  show: () => Promise<PaymentResponseLike>;
};

type PaymentRequestConstructor = new (
  methodData: unknown[],
  details: unknown,
) => PaymentRequestLike;

type PaymentManagerLike = { instruments?: unknown };
type PaymentRegistration = ServiceWorkerRegistration & {
  paymentManager?: PaymentManagerLike;
};

type HandlerMessage = {
  channel?: unknown;
  type?: unknown;
  requestId?: unknown;
  trusted?: unknown;
  methodName?: unknown;
  mode?: unknown;
  attempt?: unknown;
  outcome?: unknown;
};

const paymentModes: readonly PaymentMode[] = ["approve", "decline", "retry"];

function isPaymentMode(value: unknown): value is PaymentMode {
  return (
    typeof value === "string" && paymentModes.includes(value as PaymentMode)
  );
}

function getPaymentRequestConstructor(): PaymentRequestConstructor | undefined {
  return (window as Window & { PaymentRequest?: PaymentRequestConstructor })
    .PaymentRequest;
}

function asDetails(value: unknown): {
  accepted?: unknown;
  outcome?: unknown;
  attempt?: unknown;
} {
  return value && typeof value === "object"
    ? (value as {
        accepted?: unknown;
        outcome?: unknown;
        attempt?: unknown;
      })
    : {};
}

export function mount(root: PocRoot): () => void {
  const status = root.querySelector<HTMLOutputElement>("[data-poc-status]");
  const stageStatus = root.querySelector<HTMLOutputElement>(
    "[data-payment-stage-status]",
  );
  const trace = root.querySelector<HTMLElement>("[data-payment-trace]");
  const linkCheck = root.querySelector<HTMLButtonElement>(
    "[data-payment-link]",
  );
  const install = root.querySelector<HTMLButtonElement>(
    "[data-payment-install]",
  );
  const request = root.querySelector<HTMLButtonElement>(
    "[data-payment-request]",
  );
  const reject = root.querySelector<HTMLButtonElement>("[data-payment-reject]");
  const retry = root.querySelector<HTMLButtonElement>("[data-payment-retry]");
  const resetButton = root.querySelector<HTMLButtonElement>(
    "[data-payment-reset]",
  );
  const stageStarts = [
    ...root.querySelectorAll<HTMLButtonElement>("[data-payment-stage-start]"),
  ];
  let registration: PaymentRegistration | undefined;
  const method = new URL("./payment/method", location.href).href;
  const decoyMethod = new URL("./payment/decoy-method", location.href).href;
  const paymentScope = new URL("./payment/", location.href).pathname;
  const solved = new Set<StageBox>();
  let traceLines: string[] = [];

  const render = (message: string) => {
    if (status) status.value = message;
  };

  const renderStage = (message: string) => {
    if (stageStatus) stageStatus.value = message;
  };

  const renderTrace = (message: string) => {
    traceLines = [...traceLines, message].slice(-40);
    if (trace) trace.textContent = traceLines.join("\n");
  };

  const checkMethodManifestLink = async () => {
    render("method URLのLink headerを照会中…");
    try {
      const response = await fetch(method, {
        method: "HEAD",
        cache: "no-store",
      });
      const link = response.headers.get("Link") ?? "";
      const hasManifestLink = /rel=["']?payment-method-manifest/i.test(link);
      renderTrace(`HEAD ${response.status} Link=${link || "(none)"}`);
      if (!response.ok || !hasManifestLink) {
        throw new Error(
          `Link headerがありません (status=${response.status}, link=${link || "none"})`,
        );
      }
      render('Link: rel="payment-method-manifest" を確認しました。');
      root.dataset.pocState = "pass";
    } catch (error) {
      const message =
        error instanceof Error ? `${error.name}: ${error.message}` : "error";
      render(`Link header未確認: ${message}`);
      root.dataset.pocState = "fail";
      renderTrace(`link-check error=${message}`);
    }
  };

  const openBox = (box: StageBox) => {
    if (solved.has(box)) return;
    solved.add(box);
    const element = root.querySelector<HTMLElement>(
      `[data-payment-stage-box="${box}"]`,
    );
    if (element) {
      element.dataset.paymentSolved = "true";
      element.setAttribute("aria-label", `${box}: opened`);
    }
    if (solved.size === 3) {
      root.dataset.pocState = "pass";
      renderStage("Stage PoC: B01〜B03がすべて開きました。");
    } else {
      root.dataset.pocState = "partial";
      renderStage(`Stage PoC: ${[...solved].join(", ")} opened.`);
    }
  };

  const clearBoxes = () => {
    solved.clear();
    for (const element of root.querySelectorAll<HTMLElement>(
      "[data-payment-stage-box]",
    )) {
      delete element.dataset.paymentSolved;
      element.setAttribute(
        "aria-label",
        `${element.dataset.paymentStageBox}: closed`,
      );
    }
    renderStage("Stage PoC: 3箱は未解決です。");
  };

  const installHandler = async () => {
    if (!("PaymentRequest" in window) || !("serviceWorker" in navigator)) {
      render("PaymentRequestまたはService Workerがありません。");
      root.dataset.pocState = "unsupported";
      return;
    }
    try {
      registration = (await navigator.serviceWorker.register(
        new URL("./payment/payment-handler-sw.js", location.href),
        { scope: paymentScope, type: "classic" },
      )) as PaymentRegistration;
      await registration.update();
      render(
        `手動diagnostic登録: paymentManager=${Boolean(registration.paymentManager)}。本試験はJIT経路を別に確認します。`,
      );
      root.dataset.pocState = "partial";
      renderTrace(`manual registration scope=${registration.scope}`);
    } catch (error) {
      render(
        `handler登録失敗: ${error instanceof Error ? `${error.name}: ${error.message}` : "error"}`,
      );
      root.dataset.pocState = "fail";
    }
  };

  const runPayment = async (mode: PaymentMode) => {
    const PaymentRequestConstructor = getPaymentRequestConstructor();
    if (!PaymentRequestConstructor) {
      render("PaymentRequest unsupported");
      root.dataset.pocState = "unsupported";
      return;
    }

    root.dataset.pocState = "partial";
    render("JIT Payment Handler候補UIを起動中…");
    renderStage("候補UIを開始しました。handler windowで操作を選んでください。");
    renderTrace(`show mode=${mode}`);

    try {
      const payment = new PaymentRequestConstructor(
        [
          {
            supportedMethods: method,
            data: { busyboxMode: mode },
          },
          {
            supportedMethods: decoyMethod,
            data: { busyboxMode: mode },
          },
        ],
        {
          id: `busybox-${mode}-${crypto.randomUUID()}`,
          total: {
            label: "Busybox fictional balance",
            amount: { currency: "BBX", value: "1.00" },
          },
        },
      );
      const response = await payment.show();
      const details = asDetails(response.details);
      renderTrace(
        `response method=${response.methodName} outcome=${String(details.outcome ?? "unknown")} attempt=${String(details.attempt ?? "?")}`,
      );

      if (response.methodName !== method) {
        await response.complete("unknown");
        render("decoy handlerが選択されました。箱は開きません。");
        renderStage("Busybox handlerを選択してください。");
        return;
      }

      if (details.outcome === "approved" && details.accepted === true) {
        openBox("B01");
        await response.complete("success");
        render("Busybox handlerの承認とcomplete(success)を確認しました。");
        return;
      }

      if (details.outcome === "declined" && details.accepted === false) {
        openBox("B02");
        await response.complete("fail");
        render("Busybox handlerの意図的拒否とcomplete(fail)を確認しました。");
        return;
      }

      if (
        details.outcome !== "needs-retry" ||
        typeof response.retry !== "function"
      ) {
        throw new Error("retry用の初回responseではありません。");
      }
      render("初回responseを受け取り、同一handlerへretry()します。");
      renderTrace("calling response.retry({ error })");
      await response.retry({ error: "first fictional attempt needs retry" });
      const retriedDetails = asDetails(response.details);
      if (
        retriedDetails.outcome !== "approved" ||
        retriedDetails.accepted !== true
      ) {
        if (
          retriedDetails.outcome === "declined" &&
          retriedDetails.accepted === false
        ) {
          openBox("B02");
          await response.complete("fail");
          render("retry後の拒否とcomplete(fail)を確認しました。");
          return;
        }
        throw new Error("retry後のresponseが承認または拒否ではありません。");
      }
      openBox("B03");
      await response.complete("success");
      render("同一handlerのretry後responseとcomplete(success)を確認しました。");
    } catch (error) {
      const message =
        error instanceof Error ? `${error.name}: ${error.message}` : "error";
      render(`Payment Handler未完了: ${message}`);
      renderTrace(`error=${message}`);
      renderStage("未解決。cancel、decoy、例外は箱を開けません。");
    }
  };

  const onWorkerMessage = (event: MessageEvent<unknown>) => {
    if (!event.data || typeof event.data !== "object") return;
    const message = event.data as HandlerMessage;
    if (message.channel !== "busybox-payment") return;
    if (message.type === "handler-event") {
      const methodName =
        typeof message.methodName === "string" ? message.methodName : "?";
      const trusted = message.trusted === true;
      const mode = isPaymentMode(message.mode) ? message.mode : "approve";
      const attempt = typeof message.attempt === "number" ? message.attempt : 0;
      renderTrace(
        `event trusted=${trusted} method=${methodName} mode=${mode} attempt=${attempt}`,
      );
      if (trusted && methodName === method) {
        renderStage(
          `Busybox handlerのtrusted eventを受信しました。handler windowで操作を選べます。attempt=${attempt}`,
        );
      }
      return;
    }
    if (message.type === "handler-response") {
      renderTrace(
        `handler response method=${String(message.methodName ?? "?")} outcome=${String(message.outcome ?? "?")} attempt=${String(message.attempt ?? "?")}`,
      );
    }
  };

  const reset = async () => {
    for (const candidate of await navigator.serviceWorker.getRegistrations()) {
      if (candidate.scope.includes("/busybox/poc/payment/")) {
        await candidate.unregister();
      }
    }
    registration = undefined;
    traceLines = [];
    if (trace) trace.textContent = "";
    clearBoxes();
    delete root.dataset.pocState;
    render("未実行。Link headerを確認するにはJIT開始を押してください。");
  };

  const onLinkCheck = () => void checkMethodManifestLink();
  const onInstall = () => void installHandler();
  const onRequest = () => void runPayment("approve");
  const onReject = () => void runPayment("decline");
  const onRetry = () => void runPayment("retry");
  const onReset = () => void reset();
  const stageHandlers = stageStarts.map((button) => {
    const handler = () => {
      const mode = button.dataset.paymentStageStart;
      if (isPaymentMode(mode)) void runPayment(mode);
    };
    button.addEventListener("click", handler);
    return { button, handler };
  });

  linkCheck?.addEventListener("click", onLinkCheck);
  install?.addEventListener("click", onInstall);
  request?.addEventListener("click", onRequest);
  reject?.addEventListener("click", onReject);
  retry?.addEventListener("click", onRetry);
  resetButton?.addEventListener("click", onReset);
  navigator.serviceWorker?.addEventListener("message", onWorkerMessage);
  clearBoxes();

  return () => {
    linkCheck?.removeEventListener("click", onLinkCheck);
    install?.removeEventListener("click", onInstall);
    request?.removeEventListener("click", onRequest);
    reject?.removeEventListener("click", onReject);
    retry?.removeEventListener("click", onRetry);
    resetButton?.removeEventListener("click", onReset);
    navigator.serviceWorker?.removeEventListener("message", onWorkerMessage);
    for (const { button, handler } of stageHandlers) {
      button.removeEventListener("click", handler);
    }
  };
}
