/** メインスレッドと検査ワーカーの間でやり取りするメッセージ。 */

import type {
  EnvironmentInfo,
  InspectionStage,
  InspectionUnit,
  LiveSourceInfo,
  TestMode,
  UnitResult,
} from "../domain/types";

export type WorkerRequest =
  | { readonly type: "environment"; readonly requestId: string }
  | {
      readonly type: "run-unit";
      readonly requestId: string;
      readonly unit: InspectionUnit;
      readonly testMode: TestMode;
      readonly durationMs: number;
    }
  | {
      readonly type: "setup-live-source";
      readonly requestId: string;
      readonly video: ReadableStream<VideoFrame>;
      /** 音声を共有しなかった場合は null。音声候補は検査できない。 */
      readonly audio: ReadableStream<AudioData> | null;
      readonly source: LiveSourceInfo;
    }
  | { readonly type: "close-live-source"; readonly requestId: string }
  | { readonly type: "cancel"; readonly requestId: string };

export type WorkerResponse =
  | {
      readonly type: "stage";
      readonly requestId: string;
      readonly stage: InspectionStage;
    }
  | {
      readonly type: "environment-result";
      readonly requestId: string;
      readonly environment: Pick<EnvironmentInfo, "gpu" | "webCodecs">;
    }
  | {
      readonly type: "unit-result";
      readonly requestId: string;
      readonly result: UnitResult;
    }
  | { readonly type: "ack"; readonly requestId: string }
  | {
      readonly type: "error";
      readonly requestId: string;
      readonly name: string;
      readonly message: string;
    };
