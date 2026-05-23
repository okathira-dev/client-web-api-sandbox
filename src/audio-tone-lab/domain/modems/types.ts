export type ModemId =
  | "QUIET_AUDIBLE"
  | "GGWAVE_AUDIBLE"
  | "MFSK_AUDIBLE_4"
  | "GMSK_WEB"
  | "QUIET_ULTRASONIC"
  | "FSK_TUNABLE_FAST";

export const MODEM_ORDER: ModemId[] = [
  "QUIET_AUDIBLE",
  "GGWAVE_AUDIBLE",
  "MFSK_AUDIBLE_4",
  "GMSK_WEB",
  "QUIET_ULTRASONIC",
  "FSK_TUNABLE_FAST",
];

export const MODEM_DEFAULT_ID: ModemId = "QUIET_AUDIBLE";

export type TransferRole = "sender" | "receiver";

export type PayloadType = "text" | "file";

export type TuningPresetId = "default" | "robust" | "fast" | "custom";

export type TuningFieldType = "number" | "select" | "boolean";

export interface TuningFieldDef {
  key: string;
  label: string;
  type: TuningFieldType;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
  description?: string;
}

export type ModemTuning = Record<string, number | string | boolean>;

export interface ModemCapabilities {
  supportsLiveSpeakerMic: boolean;
  estimatedBitrateBps: { min: number; typical: number; max: number };
  robustness: "low" | "medium" | "high";
  speed: "low" | "medium" | "high";
  experimental: boolean;
  browserNotes: string;
}

export interface ModemReference {
  title: string;
  url: string;
}

export interface ModemCatalogEntry {
  id: ModemId;
  label: string;
  shortDescription: string;
  backend: "quiet" | "ggwave" | "webaudio";
  bandDescription: string;
  capabilities: ModemCapabilities;
  references: ModemReference[];
  tuningSchema: TuningFieldDef[];
  presets: Partial<Record<TuningPresetId, ModemTuning>>;
}

export interface TransferPayload {
  payloadType: PayloadType;
  bytes: Uint8Array;
  fileName?: string;
  mimeType?: string;
}

export interface TransferEstimate {
  modemId: ModemId;
  expectedSeconds: number;
  expectedBitrateBps: number;
}

export type TransferProgressPhase =
  | "encoding"
  | "playing"
  | "listening"
  | "decoding";

export interface TransferProgress {
  modemId: ModemId;
  processedChunks: number;
  totalChunks: number;
  phase: TransferProgressPhase;
}

export interface TransferActivityLog {
  at: number;
  level: "info" | "warn" | "error";
  message: string;
}

export interface TransferResult {
  modemId: ModemId;
  role: TransferRole;
  messageId: string;
  payloadType: PayloadType;
  payloadSizeBytes: number;
  expectedSeconds: number;
  actualSeconds: number;
  throughputBps: number;
  success: boolean;
  errorMessage?: string;
  startedAt: number;
  finishedAt: number;
  tuningSnapshot: ModemTuning;
  decodedText?: string;
  decodedFile?: {
    fileName: string;
    mimeType: string;
    bytes: Uint8Array;
  };
}

export interface TransferPlan {
  modemId: ModemId;
  airtimeSeconds: number;
  encodeOverheadSec: number;
}

export interface ModemProgressCallbacks {
  onProgress?: (progress: TransferProgress) => void;
  onActivityLog?: (entry: TransferActivityLog) => void;
}

export type TransferProgressHandler = (progress: TransferProgress) => void;

export interface ModemSendRequest {
  modemId: ModemId;
  payload: TransferPayload;
  tuning: ModemTuning;
  messageId: string;
}

export interface ModemReceiveOptions extends ModemProgressCallbacks {
  modemId: ModemId;
  tuning: ModemTuning;
  signal?: AbortSignal;
  onComplete: (result: TransferResult) => void;
}

export interface ModemDriver {
  entry: ModemCatalogEntry;
  getDefaultTuning(): ModemTuning;
  applyPreset(preset: TuningPresetId, base?: ModemTuning): ModemTuning;
  planTransfer(payload: TransferPayload, tuning: ModemTuning): TransferPlan;
  send(
    request: ModemSendRequest,
    callbacks: ModemProgressCallbacks,
  ): Promise<TransferResult>;
  receive(options: ModemReceiveOptions): { close: () => void };
}
