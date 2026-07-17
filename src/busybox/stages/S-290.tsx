import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

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
        {props.locale === "ja" ? "HID入力を待つ" : "Wait for HID input"}
      </button>
      <p className="interaction-status" role="status">
        {status}
      </p>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
