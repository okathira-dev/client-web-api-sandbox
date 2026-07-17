import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

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
 * Gimmick: Choose a nearby Bluetooth device and read its standard battery service.
 * Uses: Web Bluetooth GATT battery_service and battery_level characteristic.
 * Success: Read at least one byte from the battery-level characteristic.
 * Privacy/Permission: Selection starts from the browser picker; retain no device identity.
 * Cleanup: Disconnect GATT on retry, success, abort, or unmount.
 * Human verification: H-006, H-010, H-019, H-025
 */
export default function S280Stage(props: StageComponentProps) {
  const problem = props.problem("S-280-B01");
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
      problem.solve(["bluetooth:battery-service-read"]);
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
        {props.locale === "ja" ? "近くの電池を読む" : "Read a nearby battery"}
      </button>
      <p className="measurement">{battery === null ? "—" : `${battery}%`}</p>
      <p className="interaction-status" role="status">
        {status}
      </p>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
