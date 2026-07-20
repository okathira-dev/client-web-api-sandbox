import { roundLifetimeMs } from "../stages/shared/roundProtocol";

export type LaunchSource =
  | "shortcut"
  | "note"
  | "share-target"
  | "file"
  | "protocol"
  | "notification";

export interface LaunchEnvelope {
  source: LaunchSource;
  roundId: string;
  issuedAt: number;
}

const launchSources = new Set<LaunchSource>([
  "shortcut",
  "note",
  "share-target",
  "file",
  "protocol",
  "notification",
]);

export function parseLaunchEnvelope(url: URL): LaunchEnvelope | null {
  const source = url.searchParams.get("launchSource") as LaunchSource | null;
  const roundId = url.searchParams.get("round");
  const issuedAt = Number(url.searchParams.get("issuedAt"));
  if (
    !source ||
    !launchSources.has(source) ||
    !roundId ||
    !Number.isFinite(issuedAt) ||
    Date.now() - issuedAt > roundLifetimeMs ||
    issuedAt - Date.now() > 60_000
  ) {
    return null;
  }
  return { source, roundId, issuedAt };
}

export function createLaunchUrl(
  baseUrl: string,
  stageId: string,
  source: LaunchSource,
  roundId: string,
) {
  const url = new URL(baseUrl);
  url.searchParams.set("stage", stageId);
  url.searchParams.set("launchSource", source);
  url.searchParams.set("round", roundId);
  url.searchParams.set("issuedAt", String(Date.now()));
  return url;
}
