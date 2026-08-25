import KeyboardOutlined from "@mui/icons-material/KeyboardOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useEffect, useRef, useState } from "react";
import { statusText } from "../../ui/statusLocale";
import { stageText } from "../locale";
import { locale } from "./locale";

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
 * 目的: 「生の入力」で、B01「入力レポートの箱」に対応する実際のブラウザ状態・標準UI・端末入力を観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: S-290の判定に必要な実装内のWeb API。共通runtimeは進捗表示だけを担う。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
function S290Stage(props: Props) {
  const problem = props.boxes[manifest.box.B01];
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
        problem.solve();
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
        {stageText(props.locale, locale.waitHid)}
      </button>
      <p className="interaction-status" role="status">
        {statusText(props.locale, status)}
      </p>
      <StageProblemGiftBox box={problem} locale={props.locale} />
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: KeyboardOutlined,
      color: "#60a5fa",
      label: locale.B01,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      isSecureContext && "hid" in navigator
        ? "permission-required"
        : "unsupported",
    ),
  Component: S290Stage,
});
