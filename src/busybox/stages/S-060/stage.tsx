import KeyboardReturnOutlined from "@mui/icons-material/KeyboardReturnOutlined";
import SignalWifiOffOutlined from "@mui/icons-material/SignalWifiOffOutlined";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { hasRevisitFlag, setRevisitFlag } from "../../infra/synchronousFlags";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { stageText } from "../locale";
import { locale } from "./locale";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

/**
 * 目的: 再訪とoffline beaconを観測する。
 * 最初の一手: ステージへ入り直すか、offline beaconを受け取る。
 * 箱ごとの解法: B01は再訪、B02はbeacon条件を満たす。
 * 開かない操作: 保存値や画面表示だけの変更。
 * API/権限: Service WorkerとIndexedDBを使い、権限は不要。
 * cleanup/環境: listenerとDB要求を離脱時に止め、対応環境で動作する。
 * 人手確認: H-001。
 */
function S060Stage(props: Props) {
  const returnBox = props.boxes.B01;
  const beaconBox = props.boxes.B02;
  const [status, setStatus] = useState("");
  const [offline, setOffline] = useState(() => !navigator.onLine);
  const [workerControlled, setWorkerControlled] = useState(() =>
    Boolean(navigator.serviceWorker.controller),
  );
  const seenBefore = useRef(
    props.progress.hasMarker("entered") || hasRevisitFlag(),
  );

  useLayoutEffect(() => {
    if (!seenBefore.current) {
      setRevisitFlag();
      props.progress.mark("entered");
    }
  }, [props.progress]);

  useEffect(() => {
    if (seenBefore.current) returnBox.solve();
  }, [returnBox.solve]);

  useEffect(() => {
    const nonce = new URL(window.location.href).searchParams.get(
      "offline-beacon",
    );
    if (!nonce || !("indexedDB" in window)) return;
    const request = indexedDB.open("busybox-offline-beacon", 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("receipts", { keyPath: "nonce" });
    };
    request.onsuccess = () => {
      const database = request.result;
      const transaction = database.transaction("receipts", "readwrite");
      const lookup = transaction.objectStore("receipts").get(nonce);
      lookup.onsuccess = () => {
        if (!lookup.result) {
          setStatus(stageText(props.locale, locale.receiptUnavailable));
          database.close();
          return;
        }
        transaction.objectStore("receipts").delete(nonce);
        beaconBox.solve();
        setStatus(stageText(props.locale, locale.receiptConsumed));
      };
      transaction.oncomplete = () => database.close();
      transaction.onerror = () => database.close();
    };
    request.onerror = () =>
      setStatus(stageText(props.locale, locale.receiptUnavailable));
  }, [beaconBox.solve, props.locale]);

  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    const handleController = () => setWorkerControlled(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    navigator.serviceWorker?.addEventListener(
      "controllerchange",
      handleController,
    );
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      navigator.serviceWorker?.removeEventListener(
        "controllerchange",
        handleController,
      );
    };
  }, []);

  const sendBeacon = () => {
    if (!offline || !workerControlled) {
      setStatus(
        stageText(
          props.locale,
          !workerControlled ? locale.waitingWorker : locale.needOffline,
        ),
      );
      return;
    }
    const nonce = crypto.randomUUID();
    const payload = new Blob([JSON.stringify({ nonce })], {
      type: "application/json",
    });
    const accepted = navigator.sendBeacon(
      new URL("./offline-beacon/receipt", window.location.href),
      payload,
    );
    if (!accepted) {
      setStatus(stageText(props.locale, locale.rejected));
      return;
    }
    setStatus(stageText(props.locale, locale.accepted));
    const receiver = new URL("./index.html", window.location.href);
    receiver.searchParams.set("stage", manifest.id);
    receiver.searchParams.set("offline-beacon", nonce);
    window.location.assign(receiver);
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="return-clue" aria-hidden="true">
        ↪
      </div>
      <p>{stageText(props.locale, locale.revisitClue)}</p>
      <div className="stage-actions">
        <button
          type="button"
          className="stage-action"
          onClick={sendBeacon}
          disabled={!offline || !workerControlled}
        >
          {stageText(props.locale, locale.post)}
        </button>
      </div>
      <p className="interaction-status" role="status">
        {status ||
          stageText(
            props.locale,
            !workerControlled
              ? locale.waitingWorker
              : offline
                ? locale.readyOffline
                : locale.needOffline,
          )}
      </p>
      <div className="problem-row">
        <StageProblemGiftBox box={returnBox} locale={props.locale} />
        <StageProblemGiftBox box={beaconBox} locale={props.locale} />
      </div>
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: KeyboardReturnOutlined,
      tone: "violet",
      label: locale.B01,
    },
    [manifest.box.B02]: {
      icon: SignalWifiOffOutlined,
      tone: "cyan",
      label: locale.B02,
    },
  },
  Component: S060Stage,
});
