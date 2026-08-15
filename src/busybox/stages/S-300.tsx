import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { statusText } from "../ui/statusLocale";
import { stageText } from "./locale";
import { s300Locale } from "./S-300.locale";

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
 * Gimmick: Select a USB device and receive bytes from its first bulk or interrupt IN endpoint.
 * Uses: WebUSB configuration, interface claiming, and transferIn.
 * Success: A transfer returns a non-empty DataView.
 * Privacy/Permission: Retain only the transfer fact, never bytes or device identity.
 * Cleanup: Close the device on success, retry, abort, error, or unmount.
 * Human verification: H-006, H-011, H-019, H-025
 */
/**
 * S-300
 *
 * 目的: S-300の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S300Stage(props: StageComponentProps) {
  const problem = props.problem("S-300-B01");
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
      problem.solve(["usb:in-transfer"]);
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
        {stageText(props.locale, s300Locale.receiveUsb)}
      </button>
      <p className="interaction-status" role="status">
        {statusText(props.locale, status)}
      </p>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
