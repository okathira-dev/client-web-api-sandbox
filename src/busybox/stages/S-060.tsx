import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { hasRevisitFlag, setRevisitFlag } from "../infra/synchronousFlags";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s060Locale } from "./S-060.locale";

/**
 * S-060 — 再訪問と、Service Workerを介したoffline郵便を分けて体験する。
 * 目的: 閉じた後に残る仕事と、戻ってきたdocumentの変化をbrowserの保存機構で観測する。
 * 最初の一手: B01は一度離脱して同じstageへ戻る。B02はService Worker制御後にofflineへ切り替えて投函する。
 * 箱ごとの成功条件: B01は保存済みのentered観測を再訪時に消費、B02は実sendBeacon→offline navigation→worker receiptを再訪時に消費する。
 * 開かない操作: online中の投函、通常fetch、same-document遷移、直接IndexedDB書込みではB02は開かない。
 * API/権限: session/local flag、IndexedDB、sendBeacon、Service Worker。入力やreceiptは外部送信せず、必要なnonceだけ一時照合に使う。
 * cleanup/環境: receiptを一度消費し、databaseとnetwork listenerを閉じる。Service Worker制御とoffline切替ができる環境でH-001/H-018/H-021/H-025/H-048を確認する。
 */
export default function S060Stage(props: StageComponentProps) {
  const observationId = "S-060:entered";
  const problem = props.problem("S-060-B01");
  const beaconProblem = props.problem("S-060-B02");
  const [status, setStatus] = useState("");
  const [offline, setOffline] = useState(() => !navigator.onLine);
  const [workerControlled, setWorkerControlled] = useState(() =>
    Boolean(navigator.serviceWorker.controller),
  );
  const seenBefore = useRef(
    props.observations[observationId] !== undefined || hasRevisitFlag(),
  );

  useLayoutEffect(() => {
    if (!seenBefore.current) {
      setRevisitFlag();
      props.observe(observationId, ["entered"]);
    }
  }, [props.observe]);

  useEffect(() => {
    // Returning is itself the replay action, but solve after the first paint so
    // the shared box visibly transitions from closed to open on every visit.
    if (seenBefore.current) problem.solve(["returned"]);
  }, [problem.solve]);

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
          setStatus(stageText(props.locale, s060Locale.noReceipt));
          database.close();
          return;
        }
        transaction.objectStore("receipts").delete(nonce);
        beaconProblem.solve(["offline-beacon:receipt-consumed"]);
        setStatus(stageText(props.locale, s060Locale.receiptConsumed));
      };
      transaction.oncomplete = () => database.close();
      transaction.onerror = () => database.close();
    };
    request.onerror = () =>
      setStatus(stageText(props.locale, s060Locale.receiptUnavailable));
  }, [beaconProblem.solve, props.locale]);

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
        !workerControlled
          ? stageText(props.locale, s060Locale.waitingWorker)
          : stageText(props.locale, s060Locale.needOffline),
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
      setStatus(stageText(props.locale, s060Locale.rejected));
      return;
    }
    setStatus(stageText(props.locale, s060Locale.accepted));
    const receiver = new URL("./index.html", window.location.href);
    receiver.searchParams.set("stage", "S-060");
    receiver.searchParams.set("offline-beacon", nonce);
    window.location.assign(receiver);
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="return-clue" aria-hidden="true">
        ↪
      </div>
      <p>{stageText(props.locale, s060Locale.revisitClue)}</p>
      <div className="stage-actions">
        <button
          type="button"
          className="stage-action"
          onClick={sendBeacon}
          disabled={!offline || !workerControlled}
        >
          {stageText(props.locale, s060Locale.post)}
        </button>
      </div>
      <p className="interaction-status" role="status">
        {status ||
          (!workerControlled
            ? stageText(props.locale, s060Locale.waitingWorker)
            : offline
              ? stageText(props.locale, s060Locale.readyOffline)
              : stageText(props.locale, s060Locale.needOffline))}
      </p>
      <div className="problem-row">
        <ProblemGiftBox problem={problem} locale={props.locale} />
        <ProblemGiftBox problem={beaconProblem} locale={props.locale} />
      </div>
    </div>
  );
}
