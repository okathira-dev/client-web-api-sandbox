import BluetoothOutlined from "@mui/icons-material/BluetoothOutlined";
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

interface BusyBluetoothCharacteristic {
  readValue(): Promise<DataView>;
}

interface BusyBluetoothService {
  getCharacteristic(name: string): Promise<BusyBluetoothCharacteristic>;
}

interface BusyBluetoothServer {
  getPrimaryService(name: string): Promise<BusyBluetoothService>;
}

interface BusyBluetoothGatt {
  connect(): Promise<BusyBluetoothServer>;
  disconnect(): void;
}

interface BusyBluetoothDevice {
  gatt?: BusyBluetoothGatt;
}

interface BusyBluetooth {
  requestDevice(options: {
    filters: readonly { services: readonly string[] }[];
  }): Promise<BusyBluetoothDevice>;
}

interface BluetoothNavigator extends Navigator {
  bluetooth: BusyBluetooth;
}

/**
 * S-280
 *
 * 目的: 「近くの電池」で、B01「近くの電池の箱」に対応する実際のブラウザ状態・標準UI・端末入力を観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: S-280の判定に必要な実装内のWeb API。共通runtimeは進捗表示だけを担う。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
function S280Stage(props: Props) {
  const problem = props.boxes[manifest.box.B01];
  const [status, setStatus] = useState<PeripheralStatus>("idle");
  const [battery, setBattery] = useState<number | null>(null);
  const disconnectRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    const cleanup = () => disconnectRef.current();
    props.signal.addEventListener("abort", cleanup, { once: true });
    return () => {
      props.signal.removeEventListener("abort", cleanup);
      cleanup();
    };
  }, [props.signal]);

  const readBattery = async () => {
    disconnectRef.current();
    try {
      const bluetooth = (navigator as unknown as BluetoothNavigator).bluetooth;
      const device = await bluetooth.requestDevice({
        filters: [{ services: ["battery_service"] }],
      });
      const gatt = device.gatt;
      if (!gatt) throw new Error("GATT unavailable");
      disconnectRef.current = () => gatt.disconnect();
      if (props.signal.aborted) {
        disconnectRef.current();
        return;
      }
      setStatus("waiting");
      const server = await gatt.connect();
      if (props.signal.aborted) {
        gatt.disconnect();
        return;
      }
      const service = await server.getPrimaryService("battery_service");
      if (props.signal.aborted) {
        gatt.disconnect();
        return;
      }
      const characteristic = await service.getCharacteristic("battery_level");
      if (props.signal.aborted) {
        gatt.disconnect();
        return;
      }
      const data = await characteristic.readValue();
      if (data.byteLength < 1) throw new Error("Empty battery value");
      if (props.signal.aborted) {
        gatt.disconnect();
        return;
      }
      setBattery(data.getUint8(0));
      setStatus("read");
      problem.solve();
      gatt.disconnect();
    } catch (error) {
      disconnectRef.current();
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
      <div className="battery-preview" aria-hidden="true">
        <span style={{ height: `${battery ?? 0}%` }} />
      </div>
      <button
        type="button"
        className="stage-action"
        onClick={() => void readBattery()}
      >
        {stageText(props.locale, locale.readBattery)}
      </button>
      <p className="measurement">{battery === null ? "—" : `${battery}%`}</p>
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
      icon: BluetoothOutlined,
      color: "#22d3ee",
      label: locale.B01,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      isSecureContext && "bluetooth" in navigator
        ? "permission-required"
        : "unsupported",
    ),
  Component: S280Stage,
});
