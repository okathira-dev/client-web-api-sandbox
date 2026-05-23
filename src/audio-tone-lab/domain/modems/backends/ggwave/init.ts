import ggwave_factory from "ggwave";

export type GgwaveModule = Awaited<ReturnType<typeof ggwave_factory>>;
export type GgwaveInstance = ReturnType<GgwaveModule["init"]>;

let modulePromise: Promise<GgwaveModule> | null = null;

export function ensureGgwaveModule(): Promise<GgwaveModule> {
  if (!modulePromise) {
    modulePromise = ggwave_factory();
  }
  return modulePromise;
}

const PROTOCOL_MAP: Record<string, string> = {
  "audible-fast": "GGWAVE_PROTOCOL_AUDIBLE_FAST",
  "audible-fast-short": "GGWAVE_PROTOCOL_AUDIBLE_FAST_SHORT",
  normal: "GGWAVE_PROTOCOL_NORMAL",
  fast: "GGWAVE_PROTOCOL_FAST",
};

export function protocolIdFromTuning(
  mod: GgwaveModule,
  tuning: Record<string, number | string | boolean>,
): number {
  const key = String(tuning.protocol ?? "audible-fast");
  const constantName = PROTOCOL_MAP[key] ?? PROTOCOL_MAP["audible-fast"];
  const protocolId =
    mod.ProtocolId[constantName as keyof typeof mod.ProtocolId];
  if (typeof protocolId === "number") return protocolId;
  return mod.ProtocolId.GGWAVE_PROTOCOL_AUDIBLE_FAST as number;
}

export function volumeFromTuning(
  tuning: Record<string, number | string | boolean>,
): number {
  return Math.min(50, Math.max(5, Number(tuning.volume ?? 20)));
}
