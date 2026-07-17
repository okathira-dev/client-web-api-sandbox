import { useCallback, useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

type PeripheralStatus =
  | "idle"
  | "waiting"
  | "active"
  | "read"
  | "cancelled"
  | "unavailable";

interface GamepadGesture {
  pressed: number;
  axis: number;
  complete: boolean;
}

export function readGamepadGesture(
  gamepads: readonly (Gamepad | null)[],
): GamepadGesture {
  const gamepad = gamepads.find((candidate) => candidate?.connected);
  if (!gamepad) return { pressed: 0, axis: 0, complete: false };
  const pressed = gamepad.buttons.filter(
    (button) => button.pressed || button.value > 0.75,
  ).length;
  const axis = Math.max(0, ...gamepad.axes.map((value) => Math.abs(value)));
  return { pressed, axis, complete: pressed >= 2 && axis >= 0.65 };
}

export function GamepadChordStage(props: StageComponentProps) {
  const boxId = "S-200-B01";
  const [gesture, setGesture] = useState<GamepadGesture>({
    pressed: 0,
    axis: 0,
    complete: false,
  });

  useEffect(() => {
    let frame = 0;
    let previousUpdate = 0;
    const poll = (now: number) => {
      const next = readGamepadGesture(navigator.getGamepads());
      if (now - previousUpdate >= 80 || next.complete) {
        setGesture(next);
        previousUpdate = now;
      }
      if (next.complete) {
        // Deliberately persist only the gesture fact, never a controller ID.
        props.solve(boxId, ["gamepad:two-buttons-and-axis"]);
        return;
      }
      frame = window.requestAnimationFrame(poll);
    };
    frame = window.requestAnimationFrame(poll);
    const cleanup = () => window.cancelAnimationFrame(frame);
    props.signal.addEventListener("abort", cleanup, { once: true });
    return cleanup;
  }, [props.signal, props.solve]);

  return (
    <div className="puzzle puzzle--centered">
      <div className="gamepad-meter" aria-hidden="true">
        <span style={{ width: `${Math.min(100, gesture.pressed * 40)}%` }} />
        <span style={{ width: `${Math.round(gesture.axis * 100)}%` }} />
      </div>
      <p className="measurement">
        {props.locale === "ja"
          ? `押下 ${gesture.pressed} · 軸 ${gesture.axis.toFixed(2)}`
          : `Pressed ${gesture.pressed} · axis ${gesture.axis.toFixed(2)}`}
      </p>
      <p className="interaction-status" role="status">
        {props.locale === "ja"
          ? "2ボタンを押しながらスティックを倒す。"
          : "Hold two buttons while moving a stick."}
      </p>
      <ProblemGiftBox
        boxId={boxId}
        state={props.problemState(boxId)}
        locale={props.locale}
      />
    </div>
  );
}

interface BadgeNavigator extends Navigator {
  setAppBadge(contents?: number): Promise<void>;
  clearAppBadge(): Promise<void>;
}

export function AppBadgeStage(props: StageComponentProps) {
  const boxId = "S-210-B01";
  const [level, setLevel] = useState(0);
  const [status, setStatus] = useState<PeripheralStatus>("idle");
  const levelRef = useRef(0);

  useEffect(() => {
    const cleanup = () => {
      const badge = navigator as unknown as Partial<BadgeNavigator>;
      void badge.clearAppBadge?.().catch(() => undefined);
    };
    props.signal.addEventListener("abort", cleanup, { once: true });
    return cleanup;
  }, [props.signal]);

  const advance = async () => {
    const badge = navigator as unknown as BadgeNavigator;
    const next = Math.min(3, levelRef.current + 1);
    try {
      await badge.setAppBadge(next);
      levelRef.current = next;
      setLevel(next);
      setStatus("active");
      if (next === 3) props.solve(boxId, ["badge:one-two-three"]);
    } catch {
      setStatus("unavailable");
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="badge-preview" aria-hidden="true">
        B<span>{level || "·"}</span>
      </div>
      <button
        type="button"
        className="stage-action"
        onClick={() => void advance()}
      >
        {props.locale === "ja"
          ? "外側の数字を進める"
          : "Advance the outer number"}
      </button>
      <p className="interaction-status" role="status">
        {status}
      </p>
      <ProblemGiftBox
        boxId={boxId}
        state={props.problemState(boxId)}
        locale={props.locale}
      />
    </div>
  );
}

interface EyeDropperResult {
  sRGBHex: string;
}

interface EyeDropperInstance {
  open(options?: { signal?: AbortSignal }): Promise<EyeDropperResult>;
}

interface EyeDropperWindow extends Window {
  EyeDropper: new () => EyeDropperInstance;
}

const EYEDROPPER_TARGET = "#a78bfa";

export function EyeDropperStage(props: StageComponentProps) {
  const boxId = "S-260-B01";
  const [picked, setPicked] = useState("—");
  const [status, setStatus] = useState<PeripheralStatus>("idle");

  const pick = async () => {
    try {
      const EyeDropperApi = (window as unknown as EyeDropperWindow).EyeDropper;
      const result = await new EyeDropperApi().open({ signal: props.signal });
      const normalized = result.sRGBHex.toLowerCase();
      setPicked(normalized);
      setStatus("read");
      if (normalized === EYEDROPPER_TARGET) {
        props.solve(boxId, ["eyedropper:target-color"]);
      }
    } catch (error) {
      setStatus(
        error instanceof DOMException && error.name === "AbortError"
          ? "cancelled"
          : "unavailable",
      );
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <button
        type="button"
        className="eyedropper-target"
        style={{ background: EYEDROPPER_TARGET }}
        onClick={() => void pick()}
        aria-label={
          props.locale === "ja"
            ? "紫色から色を採る"
            : "Pick from the purple color"
        }
      />
      <button
        type="button"
        className="stage-action"
        onClick={() => void pick()}
      >
        {props.locale === "ja"
          ? "画面から一滴採る"
          : "Pick a drop from the screen"}
      </button>
      <p className="measurement">{picked}</p>
      <p className="interaction-status" role="status">
        {status}
      </p>
      <ProblemGiftBox
        boxId={boxId}
        state={props.problemState(boxId)}
        locale={props.locale}
      />
    </div>
  );
}

interface BusyGpuBuffer {
  destroy(): void;
  getMappedRange(): ArrayBuffer;
  mapAsync(mode: number): Promise<void>;
  unmap(): void;
}

interface BusyGpuPipeline {
  getBindGroupLayout(index: number): unknown;
}

interface BusyGpuComputePass {
  setPipeline(pipeline: BusyGpuPipeline): void;
  setBindGroup(index: number, bindGroup: unknown): void;
  dispatchWorkgroups(count: number): void;
  end(): void;
}

interface BusyGpuCommandEncoder {
  beginComputePass(): BusyGpuComputePass;
  copyBufferToBuffer(
    source: BusyGpuBuffer,
    sourceOffset: number,
    destination: BusyGpuBuffer,
    destinationOffset: number,
    size: number,
  ): void;
  finish(): unknown;
}

interface BusyGpuDevice {
  queue: {
    writeBuffer(buffer: BusyGpuBuffer, offset: number, data: Uint32Array): void;
    submit(commands: readonly unknown[]): void;
  };
  createBindGroup(descriptor: {
    layout: unknown;
    entries: readonly {
      binding: number;
      resource: { buffer: BusyGpuBuffer };
    }[];
  }): unknown;
  createBuffer(descriptor: { size: number; usage: number }): BusyGpuBuffer;
  createCommandEncoder(): BusyGpuCommandEncoder;
  createComputePipelineAsync(descriptor: {
    layout: "auto";
    compute: { module: unknown; entryPoint: string };
  }): Promise<BusyGpuPipeline>;
  createShaderModule(descriptor: { code: string }): unknown;
  destroy?(): void;
}

interface BusyGpuAdapter {
  requestDevice(): Promise<BusyGpuDevice>;
}

interface BusyGpu {
  requestAdapter(): Promise<BusyGpuAdapter | null>;
}

interface GpuNavigator extends Navigator {
  gpu: BusyGpu;
}

const GPU_TARGET_INDEX = 2347;
const GPU_TARGET_VALUE = 0x00c0ffee;
const GPU_CELLS = Array.from({ length: 64 }, (_, index) => `gpu-cell-${index}`);
const GPU_USAGE = {
  mapRead: 1,
  copySrc: 4,
  copyDst: 8,
  storage: 128,
} as const;

async function runGpuSearch(): Promise<number | null> {
  const gpu = (navigator as unknown as GpuNavigator).gpu;
  const adapter = await gpu.requestAdapter();
  if (!adapter) return null;
  const device = await adapter.requestDevice();
  const candidates = Uint32Array.from({ length: 4096 }, (_, index) => index);
  candidates[GPU_TARGET_INDEX] = GPU_TARGET_VALUE;
  const input = device.createBuffer({
    size: candidates.byteLength,
    usage: GPU_USAGE.storage | GPU_USAGE.copyDst,
  });
  const result = device.createBuffer({
    size: 4,
    usage: GPU_USAGE.storage | GPU_USAGE.copySrc | GPU_USAGE.copyDst,
  });
  const readback = device.createBuffer({
    size: 4,
    usage: GPU_USAGE.mapRead | GPU_USAGE.copyDst,
  });

  try {
    device.queue.writeBuffer(input, 0, candidates);
    device.queue.writeBuffer(result, 0, Uint32Array.of(0xffffffff));
    const module = device.createShaderModule({
      code: `
        @group(0) @binding(0) var<storage, read> candidates: array<u32>;
        @group(0) @binding(1) var<storage, read_write> result: array<u32>;
        @compute @workgroup_size(64)
        fn main(@builtin(global_invocation_id) id: vec3<u32>) {
          if (id.x < 4096u && candidates[id.x] == 0x00c0ffeeu) {
            result[0] = id.x;
          }
        }
      `,
    });
    const pipeline = await device.createComputePipelineAsync({
      layout: "auto",
      compute: { module, entryPoint: "main" },
    });
    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: input } },
        { binding: 1, resource: { buffer: result } },
      ],
    });
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginComputePass();
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.dispatchWorkgroups(64);
    pass.end();
    encoder.copyBufferToBuffer(result, 0, readback, 0, 4);
    device.queue.submit([encoder.finish()]);
    await readback.mapAsync(1);
    const found = new Uint32Array(readback.getMappedRange().slice(0))[0];
    readback.unmap();
    return found ?? null;
  } finally {
    input.destroy();
    result.destroy();
    readback.destroy();
    device.destroy?.();
  }
}

export function WebGpuSearchStage(props: StageComponentProps) {
  const boxId = "S-270-B01";
  const [status, setStatus] = useState<PeripheralStatus>("idle");
  const [found, setFound] = useState<number | null>(null);

  const search = async () => {
    setStatus("waiting");
    try {
      const index = await runGpuSearch();
      setFound(index);
      setStatus(index === null ? "unavailable" : "read");
      if (index === GPU_TARGET_INDEX) {
        props.solve(boxId, ["webgpu:compute-readback"]);
      }
    } catch {
      setStatus("unavailable");
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="compute-grid" aria-hidden="true">
        {GPU_CELLS.map((cell, index) => (
          <span
            key={cell}
            data-found={found === GPU_TARGET_INDEX && index === 43}
          />
        ))}
      </div>
      <button
        type="button"
        className="stage-action"
        onClick={() => void search()}
      >
        {props.locale === "ja" ? "並列に探す" : "Search in parallel"}
      </button>
      <p className="interaction-status" role="status">
        {status} {found === null ? "" : `#${found}`}
      </p>
      <ProblemGiftBox
        boxId={boxId}
        state={props.problemState(boxId)}
        locale={props.locale}
      />
    </div>
  );
}

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

export function BluetoothBatteryStage(props: StageComponentProps) {
  const boxId = "S-280-B01";
  const [status, setStatus] = useState<PeripheralStatus>("idle");
  const [battery, setBattery] = useState<number | null>(null);
  const disconnectRef = useRef<() => void>(() => undefined);

  useEffect(() => () => disconnectRef.current(), []);

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
      props.signal.addEventListener("abort", disconnectRef.current, {
        once: true,
      });
      setStatus("waiting");
      const server = await gatt.connect();
      const service = await server.getPrimaryService("battery_service");
      const characteristic = await service.getCharacteristic("battery_level");
      const data = await characteristic.readValue();
      if (data.byteLength < 1) throw new Error("Empty battery value");
      setBattery(data.getUint8(0));
      setStatus("read");
      props.solve(boxId, ["bluetooth:battery-service-read"]);
      gatt.disconnect();
    } catch (error) {
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
      <ProblemGiftBox
        boxId={boxId}
        state={props.problemState(boxId)}
        locale={props.locale}
      />
    </div>
  );
}

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

export function HidInputStage(props: StageComponentProps) {
  const boxId = "S-290-B01";
  const [status, setStatus] = useState<PeripheralStatus>("idle");
  const cleanupRef = useRef<() => void>(() => undefined);

  useEffect(() => () => cleanupRef.current(), []);

  const waitForReport = async () => {
    cleanupRef.current();
    try {
      const hid = (navigator as unknown as HidNavigator).hid;
      const [device] = await hid.requestDevice({ filters: [] });
      if (!device) {
        setStatus("cancelled");
        return;
      }
      await device.open();
      let accepted = false;
      const onReport: EventListener = (event) => {
        const report = event as BusyHidInputReportEvent;
        if (accepted || report.data.byteLength === 0) return;
        accepted = true;
        setStatus("read");
        props.solve(boxId, ["hid:input-report"]);
        device.removeEventListener("inputreport", onReport);
        void device.close().catch(() => undefined);
      };
      device.addEventListener("inputreport", onReport);
      const cleanup = () => {
        device.removeEventListener("inputreport", onReport);
        void device.close().catch(() => undefined);
      };
      cleanupRef.current = cleanup;
      props.signal.addEventListener("abort", cleanup, { once: true });
      setStatus("waiting");
    } catch (error) {
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
      <ProblemGiftBox
        boxId={boxId}
        state={props.problemState(boxId)}
        locale={props.locale}
      />
    </div>
  );
}

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

export function UsbTransferStage(props: StageComponentProps) {
  const boxId = "S-300-B01";
  const [status, setStatus] = useState<PeripheralStatus>("idle");
  const cleanupRef = useRef<() => void>(() => undefined);

  useEffect(() => () => cleanupRef.current(), []);

  const receive = async () => {
    cleanupRef.current();
    try {
      const usb = (navigator as unknown as UsbNavigator).usb;
      const device = await usb.requestDevice({ filters: [] });
      await device.open();
      cleanupRef.current = () => void device.close().catch(() => undefined);
      props.signal.addEventListener("abort", cleanupRef.current, {
        once: true,
      });
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
      props.solve(boxId, ["usb:in-transfer"]);
      cleanupRef.current();
    } catch (error) {
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
      <ProblemGiftBox
        boxId={boxId}
        state={props.problemState(boxId)}
        locale={props.locale}
      />
    </div>
  );
}

interface BusyDevicePosture extends EventTarget {
  type: string;
}

interface PostureNavigator extends Navigator {
  devicePosture?: BusyDevicePosture;
}

export function FoldedViewportStage(props: StageComponentProps) {
  const boxId = "S-320-B01";
  const [posture, setPosture] = useState("continuous");
  const [segments, setSegments] = useState(1);

  const inspect = useCallback(() => {
    const devicePosture = (navigator as unknown as PostureNavigator)
      .devicePosture;
    const horizontal = window.matchMedia("(horizontal-viewport-segments: 2)");
    const vertical = window.matchMedia("(vertical-viewport-segments: 2)");
    const nextSegments = horizontal.matches || vertical.matches ? 2 : 1;
    const nextPosture = devicePosture?.type ?? "continuous";
    setSegments(nextSegments);
    setPosture(nextPosture);
    if (nextPosture === "folded" || nextSegments === 2) {
      props.solve(boxId, ["posture:folded-or-two-segments"]);
    }
  }, [props.solve]);

  useEffect(() => {
    const devicePosture = (navigator as unknown as PostureNavigator)
      .devicePosture;
    const queries = [
      window.matchMedia("(horizontal-viewport-segments: 2)"),
      window.matchMedia("(vertical-viewport-segments: 2)"),
    ];
    devicePosture?.addEventListener("change", inspect);
    for (const query of queries) query.addEventListener("change", inspect);
    inspect();
    const cleanup = () => {
      devicePosture?.removeEventListener("change", inspect);
      for (const query of queries) query.removeEventListener("change", inspect);
    };
    props.signal.addEventListener("abort", cleanup, { once: true });
    return cleanup;
  }, [inspect, props.signal]);

  return (
    <div className="puzzle puzzle--centered">
      <div
        className="fold-preview"
        data-folded={posture === "folded" || segments === 2}
      >
        <span />
        <i aria-hidden="true" />
        <span />
      </div>
      <p className="measurement">
        {posture} · {segments} {props.locale === "ja" ? "面" : "segment(s)"}
      </p>
      <p className="interaction-status" role="status">
        {props.locale === "ja"
          ? "折りたたみ端末で折れ目を作る。"
          : "Create a fold on a foldable device."}
      </p>
      <ProblemGiftBox
        boxId={boxId}
        state={props.problemState(boxId)}
        locale={props.locale}
      />
    </div>
  );
}
