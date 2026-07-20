export const roundLifetimeMs = 30 * 60 * 1000;

export interface RoundEnvelope<TPayload = unknown> {
  readonly protocol: "busybox-round-v1";
  readonly stageId: string;
  readonly roundId: string;
  readonly sentAt: number;
  readonly type: string;
  readonly payload?: TPayload;
}

export function createRoundId() {
  return crypto.randomUUID();
}

export function createRoundEnvelope<TPayload>(
  stageId: string,
  roundId: string,
  type: string,
  payload?: TPayload,
): RoundEnvelope<TPayload> {
  return {
    protocol: "busybox-round-v1",
    stageId,
    roundId,
    sentAt: Date.now(),
    type,
    payload,
  };
}

export function isRoundEnvelope(
  value: unknown,
  expectedStageId?: string,
  expectedRoundId?: string,
): value is RoundEnvelope {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<RoundEnvelope>;
  return (
    candidate.protocol === "busybox-round-v1" &&
    typeof candidate.stageId === "string" &&
    typeof candidate.roundId === "string" &&
    typeof candidate.sentAt === "number" &&
    typeof candidate.type === "string" &&
    Date.now() - candidate.sentAt <= roundLifetimeMs &&
    (!expectedStageId || candidate.stageId === expectedStageId) &&
    (!expectedRoundId || candidate.roundId === expectedRoundId)
  );
}

export function roundChannelName(stageId: string, roundId: string) {
  return `busybox:${stageId}:${roundId}`;
}
