import { useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

type PeripheralStatus = "idle" | "waiting" | "read" | "unavailable";

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
  let input: BusyGpuBuffer | undefined;
  let result: BusyGpuBuffer | undefined;
  let readback: BusyGpuBuffer | undefined;

  try {
    input = device.createBuffer({
      size: candidates.byteLength,
      usage: GPU_USAGE.storage | GPU_USAGE.copyDst,
    });
    result = device.createBuffer({
      size: 4,
      usage: GPU_USAGE.storage | GPU_USAGE.copySrc | GPU_USAGE.copyDst,
    });
    readback = device.createBuffer({
      size: 4,
      usage: GPU_USAGE.mapRead | GPU_USAGE.copyDst,
    });
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
    await readback.mapAsync(GPU_USAGE.mapRead);
    const found = new Uint32Array(readback.getMappedRange().slice(0))[0];
    readback.unmap();
    return found ?? null;
  } finally {
    input?.destroy();
    result?.destroy();
    readback?.destroy();
    device.destroy?.();
  }
}

/**
 * S-270
 *
 * Gimmick: Find one sentinel among 4096 values with a GPU compute shader.
 * Uses: WebGPU buffers, WGSL compute, command submission, and mapped readback.
 * Success: The GPU reports the seeded sentinel index 2347.
 * Privacy/Permission: Compute only generated stage data; no device details are retained.
 * Cleanup: Destroy every GPU buffer and the device in a finally block.
 * Human verification: H-019, H-023, H-025
 */
export default function S270Stage(props: StageComponentProps) {
  const problem = props.problem("S-270-B01");
  const [status, setStatus] = useState<PeripheralStatus>("idle");
  const [found, setFound] = useState<number | null>(null);

  const search = async () => {
    setStatus("waiting");
    try {
      const index = await runGpuSearch();
      if (props.signal.aborted) return;
      setFound(index);
      setStatus(index === null ? "unavailable" : "read");
      if (index === GPU_TARGET_INDEX) {
        problem.solve(["webgpu:compute-readback"]);
      }
    } catch {
      if (!props.signal.aborted) setStatus("unavailable");
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
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
