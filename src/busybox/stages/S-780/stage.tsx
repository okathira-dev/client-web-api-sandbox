import FileDownloadOutlined from "@mui/icons-material/FileDownloadOutlined";
import FileUploadOutlined from "@mui/icons-material/FileUploadOutlined";
import SelectAllOutlined from "@mui/icons-material/SelectAllOutlined";
import SwapHorizOutlined from "@mui/icons-material/SwapHorizOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useEffect, useMemo, useRef, useState } from "react";
import { stageText } from "../locale";
import { locale } from "./locale";

type PaymentResponseLike = {
  methodName: string;
  details: unknown;
  complete: (result?: string) => Promise<void>;
  retry?: (errors?: unknown) => Promise<void>;
};

type PaymentRequestLike = { show: () => Promise<PaymentResponseLike> };
type PaymentRequestConstructor = new (
  methodData: unknown[],
  details: unknown,
) => PaymentRequestLike;

type PaymentManagerRegistration = ServiceWorkerRegistration & {
  paymentManager?: { userHint: string };
};

type Wallet = {
  id: "circle" | "diamond";
  worker: URL;
  scope: URL;
  userHint: string;
};

type HandlerEvent = {
  channel?: unknown;
  type?: unknown;
  requestId?: unknown;
  trusted?: unknown;
  wallet?: unknown;
};

function detailsOf(value: unknown): { accepted?: unknown; outcome?: unknown } {
  return value && typeof value === "object"
    ? (value as { accepted?: unknown; outcome?: unknown })
    : {};
}

function workerScriptUrl(source: MessageEventSource | null): string | null {
  if (!source || !("scriptURL" in source)) return null;
  return typeof source.scriptURL === "string" ? source.scriptURL : null;
}

async function waitUntilActivated(
  registration: ServiceWorkerRegistration,
): Promise<void> {
  if (registration.active?.state === "activated") return;
  const worker =
    registration.installing ?? registration.waiting ?? registration.active;
  if (!worker) throw new Error("Payment handler worker is missing");

  await new Promise<void>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error("Payment handler activation timed out"));
    }, 10_000);
    const onStateChange = () => {
      if (worker.state === "activated") {
        cleanup();
        resolve();
      } else if (worker.state === "redundant") {
        cleanup();
        reject(new Error("Payment handler worker became redundant"));
      }
    };
    const cleanup = () => {
      window.clearTimeout(timeoutId);
      worker.removeEventListener("statechange", onStateChange);
    };
    worker.addEventListener("statechange", onStateChange);
    onStateChange();
  });
}

async function removeLegacyHandler(paymentRoot: URL): Promise<void> {
  const legacyScript = new URL("payment-handler-sw.js", paymentRoot).href;
  for (const registration of await navigator.serviceWorker.getRegistrations()) {
    if (registration.scope !== paymentRoot.href) continue;
    const worker =
      registration.active ?? registration.waiting ?? registration.installing;
    if (worker?.scriptURL === legacyScript) await registration.unregister();
  }
}

async function registerWallets(wallets: readonly Wallet[]): Promise<void> {
  for (const wallet of wallets) {
    const registration = (await navigator.serviceWorker.register(
      wallet.worker,
      { scope: wallet.scope.href },
    )) as PaymentManagerRegistration;
    await waitUntilActivated(registration);
    if (!registration.paymentManager) {
      throw new Error("PaymentManager is unavailable");
    }
    registration.paymentManager.userHint = wallet.userHint;
  }
}

/**
 * S-780 — browser所有のPayment Handler chooserと架空BBX決済のlifecycleを観測する。
 * 目的: browserが仲介するpayment method、複数walletの選択、handler window、complete / retryを4箱へ分けて体験する。
 * 最初の一手: 「財布を開く」を押し、browserの決済UIに並ぶ○財布と◇財布のどちらかを選んでhandler windowを開く。
 * 箱ごとの解法: どちらの財布でも、✓の最初の承認responseをcomplete(success)まで完了するとB01、×の意図的な拒否responseをcomplete(fail)まで完了するとB02、↻で初回needs-retryを返し同じPaymentResponseへretry()を行った後に✓で二回目を完了するとB03が開く。browser所有chooserで◇財布を選び、そのwalletのService Workerへ実PaymentRequestEventが届くとB04が開く。B04後の承認・拒否・再試行は問わない。
 * 開かない操作: game内の表示だけを押す、通常のService Worker messageを偽装する、handler不在、browser側cancel、例外、最初から成功するだけの再試行、固定flagでは開かない。○財布を選んでもB04は開かない。
 * 使用API: PaymentRequest、PaymentResponse、Payment Handler Service Worker、PaymentManager.userHint、payment-method-manifest。
 * 権限・privacy: 実Payment、payer情報、credential、handlerの詳細情報を保存・送信しない。財布IDはその場の開箱判定にだけ使う。
 * cleanup: stage離脱・cancel・retry失敗時にhandler windowへの追加操作をせず、active request IDを破棄する。旧単一walletの製品workerだけはexact scope / script URL一致時に登録解除する。
 * 対応環境: PaymentRequest、Payment Handler、Service Worker、method manifestのLink response headerを提供する対応browserとsecure context。通常のGitHub Pagesだけでは任意routeのLink headerを設定できないため、公開時はheader ruleを設定できるmanaged static hostが必要。
 * 人手確認: H-003/H-004/H-019/H-023/H-025/H-050。
 */
function S780Stage(props: Props) {
  const boxes = [
    props.boxes.B01,
    props.boxes.B02,
    props.boxes.B03,
    props.boxes.B04,
  ] as const;
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<"idle" | "waiting" | "unavailable">(
    "idle",
  );
  const activeRequestId = useRef<string | undefined>(undefined);
  const paymentRoot = useMemo(
    () => new URL("./payment/", document.baseURI),
    [],
  );
  const method = useMemo(
    () => new URL("method", paymentRoot).href,
    [paymentRoot],
  );
  const wallets = useMemo<readonly Wallet[]>(
    () => [
      {
        id: "circle",
        worker: new URL("wallet-circle/payment-handler-sw.js", paymentRoot),
        scope: new URL("wallet-circle/", paymentRoot),
        userHint: "○",
      },
      {
        id: "diamond",
        worker: new URL("wallet-diamond/payment-handler-sw.js", paymentRoot),
        scope: new URL("wallet-diamond/", paymentRoot),
        userHint: "◇",
      },
    ],
    [paymentRoot],
  );

  useEffect(() => {
    const target = wallets.find((wallet) => wallet.id === "diamond");
    if (!target) return;
    const onMessage = (event: MessageEvent<HandlerEvent>) => {
      const data = event.data;
      if (
        data?.channel !== "busybox-payment" ||
        data.type !== "handler-event" ||
        data.requestId !== activeRequestId.current ||
        data.trusted !== true ||
        data.wallet !== target.id ||
        workerScriptUrl(event.source) !== target.worker.href
      ) {
        return;
      }
      boxes[3]?.solve();
    };
    navigator.serviceWorker?.addEventListener("message", onMessage);
    return () =>
      navigator.serviceWorker?.removeEventListener("message", onMessage);
  }, [boxes, wallets]);

  const begin = async () => {
    const PaymentRequest = (
      window as Window & { PaymentRequest?: PaymentRequestConstructor }
    ).PaymentRequest;
    if (!PaymentRequest || !navigator.serviceWorker) {
      setStatus("unavailable");
      return;
    }
    if (running) return;
    setRunning(true);
    setStatus("waiting");
    const requestId = `busybox-${crypto.randomUUID()}`;
    activeRequestId.current = requestId;
    try {
      await removeLegacyHandler(paymentRoot);
      await registerWallets(wallets);
    } catch {
      activeRequestId.current = undefined;
      setRunning(false);
      setStatus("unavailable");
      return;
    }
    try {
      const request = new PaymentRequest(
        [{ supportedMethods: method, data: { busybox: true } }],
        {
          id: requestId,
          total: { label: "BBX", amount: { currency: "BBX", value: "1.00" } },
        },
      );
      const response = await request.show();
      if (props.signal.aborted) return;
      const first = detailsOf(response.details);
      if (response.methodName !== method) {
        await response.complete("unknown");
        return;
      }
      if (first.outcome === "approved" && first.accepted === true) {
        await response.complete("success");
        boxes[0]?.solve();
        return;
      }
      if (first.outcome === "declined" && first.accepted === false) {
        await response.complete("fail");
        boxes[1]?.solve();
        return;
      }
      if (
        first.outcome !== "needs-retry" ||
        typeof response.retry !== "function"
      ) {
        await response.complete("fail");
        return;
      }
      await response.retry({ error: "busybox retry" });
      if (props.signal.aborted) return;
      const second = detailsOf(response.details);
      if (second.outcome === "approved" && second.accepted === true) {
        await response.complete("success");
        boxes[2]?.solve();
        return;
      }
      await response.complete("fail");
    } catch {
      // Browser cancel, handler absence, and timeout are intentionally not a box.
    } finally {
      activeRequestId.current = undefined;
      setRunning(false);
      setStatus("idle");
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        {boxes.map((problem) => (
          <StageProblemGiftBox
            key={problem.id}
            box={problem}
            locale={props.locale}
          />
        ))}
      </div>
      <button
        type="button"
        className="stage-action"
        disabled={running}
        onClick={() => void begin()}
      >
        {stageText(props.locale, locale.start)}
      </button>
      <p className="stage-status" role="status" aria-live="polite">
        {status === "waiting"
          ? stageText(props.locale, locale.waiting)
          : status === "unavailable"
            ? stageText(props.locale, locale.unavailable)
            : ""}
      </p>
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: FileUploadOutlined,
      color: "#facc15",
      label: locale.B01,
    },
    [manifest.box.B02]: {
      icon: FileDownloadOutlined,
      color: "#eab308",
      label: locale.B02,
    },
    [manifest.box.B03]: {
      icon: SwapHorizOutlined,
      color: "#ca8a04",
      label: locale.B03,
    },
    [manifest.box.B04]: {
      icon: SelectAllOutlined,
      color: "#a16207",
      label: locale.B04,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      isSecureContext &&
      "PaymentRequest" in window &&
      "serviceWorker" in navigator
        ? "permission-required"
        : "unsupported",
    ),
  Component: S780Stage,
});
