import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

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
      await device.open();
      cleanupRef.current = () => void device.close().catch(() => undefined);
      if (!device.configuration) await device.selectConfiguration(1);
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
      setStatus("waiting");
      const result = await device.transferIn(
        selected.endpoint.endpointNumber,
        64,
      );
      if (!result.data?.byteLength) throw new Error("Empty USB transfer");
      setStatus("read");
      problem.solve(["usb:in-transfer"]);
      cleanupRef.current();
    } catch (error) {
      // A failure can occur after open, so the catch path must also close hardware.
      cleanupRef.current();
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
        {props.locale === "ja"
          ? "線の向こうから受け取る"
          : "Receive across the wire"}
      </button>
      <p className="interaction-status" role="status">
        {status}
      </p>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
