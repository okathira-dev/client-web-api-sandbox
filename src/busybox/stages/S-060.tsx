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
/**
 * S-060
 *
 * 目的: S-060の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
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
