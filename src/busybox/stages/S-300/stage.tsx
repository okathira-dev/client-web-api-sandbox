import UsbOutlined from "@mui/icons-material/UsbOutlined";
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

interface BusyUsbEndpoint {
  direction: "in" | "out";
  endpointNumber: number;
  type: "bulk" | "interrupt" | "isochronous";
}

interface BusyUsbAlternate {
  endpoints: readonly BusyUsbEndpoint[];
}

interface BusyUsbInterface {
  interfaceNumber: number;
  alternate: BusyUsbAlternate;
}

interface BusyUsbConfiguration {
  interfaces: readonly BusyUsbInterface[];
}

interface BusyUsbDevice {
  configuration: BusyUsbConfiguration | null;
  open(): Promise<void>;
  close(): Promise<void>;
  selectConfiguration(value: number): Promise<void>;
  claimInterface(interfaceNumber: number): Promise<void>;
  transferIn(
    endpointNumber: number,
    length: number,
  ): Promise<{ data?: DataView }>;
}

interface BusyUsb {
  requestDevice(options: {
    filters: readonly object[];
  }): Promise<BusyUsbDevice>;
}

interface UsbNavigator extends Navigator {
  usb: BusyUsb;
}

/**
 * S-300
 *
 * 目的: 「線の向こう」で、B01「USB転送の箱」に対応する実際のブラウザ状態・標準UI・端末入力を観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: S-300の判定に必要な実装内のWeb API。共通runtimeは進捗表示だけを担う。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
function S300Stage(props: Props) {
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

  const receive = async () => {
    cleanupRef.current();
    try {
      const usb = (navigator as unknown as UsbNavigator).usb;
      const device = await usb.requestDevice({ filters: [] });
      if (props.signal.aborted) return;
      await device.open();
      cleanupRef.current = () => void device.close().catch(() => undefined);
      if (props.signal.aborted) {
        cleanupRef.current();
        return;
      }
      if (!device.configuration) await device.selectConfiguration(1);
      if (props.signal.aborted) {
        cleanupRef.current();
        return;
      }
      const selected = device.configuration?.interfaces
        .flatMap((usbInterface) =>
          usbInterface.alternate.endpoints.map((endpoint) => ({
            endpoint,
            interfaceNumber: usbInterface.interfaceNumber,
          })),
        )
        .find(
          ({ endpoint }) =>
            endpoint.direction === "in" &&
            (endpoint.type === "interrupt" || endpoint.type === "bulk"),
        );
      if (!selected) throw new Error("No IN endpoint");
      await device.claimInterface(selected.interfaceNumber);
      if (props.signal.aborted) {
        cleanupRef.current();
        return;
      }
      setStatus("waiting");
      const result = await device.transferIn(
        selected.endpoint.endpointNumber,
        64,
      );
      if (!result.data?.byteLength) throw new Error("Empty USB transfer");
      if (props.signal.aborted) return;
      setStatus("read");
      problem.solve();
      cleanupRef.current();
    } catch (error) {
      // A failure can occur after open, so the catch path must also close hardware.
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
        className="usb-wire"
        data-active={status === "read"}
        aria-hidden="true"
      >
        <span />
      </div>
      <button
        type="button"
        className="stage-action"
        onClick={() => void receive()}
      >
        {stageText(props.locale, locale.receiveUsb)}
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
      icon: UsbOutlined,
      color: "#818cf8",
      label: locale.B01,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      isSecureContext && "usb" in navigator
        ? "permission-required"
        : "unsupported",
    ),
  Component: S300Stage,
});
