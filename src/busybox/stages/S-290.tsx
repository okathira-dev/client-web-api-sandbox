import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { statusText } from "../ui/statusLocale";
import { stageText } from "./locale";
import { s290Locale } from "./S-290.locale";

type PeripheralStatus =
  | "idle"
  | "waiting"
  | "read"
  | "cancelled"
  | "unavailable";

interface BusyHidDevice extends EventTarget {
  open(): Promise<void>;
  close(): Promise<void>;
}

interface BusyHidInputReportEvent extends Event {
  data: DataView;
}

interface BusyHid {
  requestDevice(options: {
    filters: readonly object[];
  }): Promise<BusyHidDevice[]>;
}

interface HidNavigator extends Navigator {
  hid: BusyHid;
}

/**
 * S-290
 *
 * Gimmick: Select a HID device and produce one non-empty raw input report.
 * Uses: WebHID device picker, inputreport event, and device lifecycle.
 * Success: Receive the first input report whose DataView is non-empty.
 * Privacy/Permission: Retain only the report-arrived fact, never bytes or device identity.
 * Cleanup: Remove the report listener and close the device on success, retry, abort, or exit.
 * Human verification: H-006, H-011, H-019, H-025
 */
/**
 * S-290
 *
 * 目的: S-290の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S290Stage(props: StageComponentProps) {
  const problem = props.problem("S-290-B01");
  const [status, setStatus] = useState<PeripheralStatus>("idle");
  const cleanupRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    const cleanup = () => cleanupRef.current();
    props.signal.addEventListener("abort", cleanup, { once: true });
    return () => {
      props.signal.removeEventListener("abort", cleanup);
      cleanup();
    };
  }, [props.signal]);

  const waitForReport = async () => {
    cleanupRef.current();
    try {
      const hid = (navigator as unknown as HidNavigator).hid;
      const [device] = await hid.requestDevice({ filters: [] });
      if (props.signal.aborted) return;
      if (!device) {
        setStatus("cancelled");
        return;
      }
      await device.open();
      cleanupRef.current = () => void device.close().catch(() => undefined);
      if (props.signal.aborted) {
        cleanupRef.current();
        return;
      }
      let accepted = false;
      const onReport: EventListener = (event) => {
        const report = event as BusyHidInputReportEvent;
        if (accepted || report.data.byteLength === 0) return;
        accepted = true;
        setStatus("read");
        problem.solve(["hid:input-report"]);
        device.removeEventListener("inputreport", onReport);
        void device.close().catch(() => undefined);
      };
      device.addEventListener("inputreport", onReport);
      cleanupRef.current = () => {
        device.removeEventListener("inputreport", onReport);
        void device.close().catch(() => undefined);
      };
      setStatus("waiting");
    } catch (error) {
      cleanupRef.current();
      if (props.signal.aborted) return;
      setStatus(
        error instanceof DOMException && error.name === "NotFoundError"
          ? "cancelled"
          : "unavailable",
      );
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <div
        className="input-pulse"
        data-active={status === "read"}
        aria-hidden="true"
      />
      <button
        type="button"
        className="stage-action"
        onClick={() => void waitForReport()}
      >
        {stageText(props.locale, s290Locale.waitHid)}
      </button>
      <p className="interaction-status" role="status">
        {statusText(props.locale, status)}
      </p>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
