import {
  mergeProgressDocuments,
  type ProgressDocument,
  parseProgressDocument,
} from "../domain/progress";

const apiRoot = "https://www.googleapis.com/drive/v3";
const uploadRoot = "https://www.googleapis.com/upload/drive/v3";
const replicaPrefix = "busybox-progress-";
const maxSyncAttempts = 3;

export type DriveBackupErrorCode = "http" | "corrupt" | "future" | "conflict";

export interface DriveReplica {
  readonly id: string;
  readonly name: string;
  readonly modifiedTime?: string;
}

export class DriveBackupError extends Error {
  constructor(
    readonly code: DriveBackupErrorCode,
    message: string,
    readonly replicas: readonly DriveReplica[] = [],
  ) {
    super(message);
    this.name = "DriveBackupError";
  }
}

interface FileListResponse {
  files?: DriveReplica[];
}

export interface DriveSyncResult {
  document: ProgressDocument;
  created: boolean;
  remoteInstallationId: string | null;
}

type Fetcher = typeof fetch;

type DownloadedReplica = {
  readonly replica: DriveReplica;
  readonly raw: unknown;
  readonly eTag: string | null;
};

function replicaName(installationId: string): string {
  return `${replicaPrefix + installationId}.json`;
}

async function authorizedFetch(
  fetcher: Fetcher,
  accessToken: string,
  input: string,
  init: RequestInit = {},
) {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);
  const response = await fetcher(input, { ...init, headers });
  if (!response.ok) {
    throw new DriveBackupError(
      "http",
      `Drive request failed: ${response.status}`,
    );
  }
  return response;
}

async function findReplicas(fetcher: Fetcher, accessToken: string) {
  const query = new URLSearchParams({
    spaces: "appDataFolder",
    q: `name contains '${replicaPrefix}'`,
    fields: "files(id,name,modifiedTime)",
    orderBy: "modifiedTime desc",
    pageSize: "100",
  });
  const response = await authorizedFetch(
    fetcher,
    accessToken,
    `${apiRoot}/files?${query}`,
  );
  const list = (await response.json()) as FileListResponse;
  return (list.files ?? []).filter((file) =>
    file.name.startsWith(replicaPrefix),
  );
}

async function createReplica(
  fetcher: Fetcher,
  accessToken: string,
  name: string,
): Promise<DriveReplica> {
  const response = await authorizedFetch(
    fetcher,
    accessToken,
    `${apiRoot}/files?fields=id,name,modifiedTime`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        mimeType: "application/json",
        parents: ["appDataFolder"],
      }),
    },
  );
  const file = (await response.json()) as Partial<DriveReplica>;
  if (!file.id || !file.name) {
    throw new DriveBackupError("http", "Drive did not return a replica id");
  }
  return { id: file.id, name: file.name, modifiedTime: file.modifiedTime };
}

async function downloadReplica(
  fetcher: Fetcher,
  accessToken: string,
  replica: DriveReplica,
): Promise<DownloadedReplica> {
  const response = await authorizedFetch(
    fetcher,
    accessToken,
    `${apiRoot}/files/${encodeURIComponent(replica.id)}?alt=media`,
  );
  try {
    return {
      replica,
      raw: (await response.json()) as unknown,
      eTag: response.headers.get("etag"),
    };
  } catch {
    throw new DriveBackupError(
      "corrupt",
      "A Drive replica is not valid JSON.",
      [replica],
    );
  }
}

async function uploadReplica(
  fetcher: Fetcher,
  accessToken: string,
  replica: DriveReplica,
  document: ProgressDocument,
  eTag: string | null,
): Promise<"updated" | "conflict"> {
  const headers = new Headers({
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  });
  if (eTag) headers.set("If-Match", eTag);
  const response = await fetcher(
    uploadRoot +
      "/files/" +
      encodeURIComponent(replica.id) +
      "?uploadType=media",
    { method: "PATCH", headers, body: JSON.stringify(document) },
  );
  if (response.status === 412) return "conflict";
  if (!response.ok) {
    throw new DriveBackupError(
      "http",
      `Drive request failed: ${response.status}`,
    );
  }
  return "updated";
}

function parseReplica(downloaded: DownloadedReplica): ProgressDocument {
  const parsed = parseProgressDocument(downloaded.raw);
  if (parsed.status === "future") {
    throw new DriveBackupError(
      "future",
      `A Drive replica uses a newer schema: ${parsed.version}`,
      [downloaded.replica],
    );
  }
  if (parsed.status === "corrupt") {
    throw new DriveBackupError(
      "corrupt",
      `A Drive replica is corrupt: ${parsed.reason}`,
      [downloaded.replica],
    );
  }
  return parsed.document;
}

function mergeReplicaDocuments(
  local: ProgressDocument,
  replicas: readonly DownloadedReplica[],
): { document: ProgressDocument; remoteInstallationId: string | null } {
  let document = local;
  let remoteInstallationId: string | null = null;
  for (const replica of replicas) {
    const remote = parseReplica(replica);
    if (remote.installationId !== local.installationId) {
      remoteInstallationId ??= remote.installationId;
    }
    document = mergeProgressDocuments(document, remote);
  }
  return { document, remoteInstallationId };
}

function latestReplica(
  replicas: readonly DownloadedReplica[],
  name: string,
): DownloadedReplica | undefined {
  return replicas
    .filter((replica) => replica.replica.name === name)
    .sort((left, right) => {
      const time = (right.replica.modifiedTime ?? "").localeCompare(
        left.replica.modifiedTime ?? "",
      );
      return time || left.replica.id.localeCompare(right.replica.id);
    })[0];
}

/**
 * Merges every device-owned replica before writing only this installation's
 * replica. Different devices therefore never overwrite each other's only copy.
 */
export async function syncDriveBackup(
  accessToken: string,
  local: ProgressDocument,
  fetcher: Fetcher = fetch,
): Promise<DriveSyncResult> {
  const ownName = replicaName(local.installationId);
  for (let attempt = 0; attempt < maxSyncAttempts; attempt += 1) {
    const replicas = await findReplicas(fetcher, accessToken);
    const downloaded = await Promise.all(
      replicas.map((replica) => downloadReplica(fetcher, accessToken, replica)),
    );
    const merged = mergeReplicaDocuments(local, downloaded);
    const own = latestReplica(downloaded, ownName);
    if (!own) {
      const created = await createReplica(fetcher, accessToken, ownName);
      await uploadReplica(fetcher, accessToken, created, merged.document, null);
      return {
        document: merged.document,
        created: true,
        remoteInstallationId: merged.remoteInstallationId,
      };
    }
    const result = await uploadReplica(
      fetcher,
      accessToken,
      own.replica,
      merged.document,
      own.eTag,
    );
    if (result === "updated") {
      return {
        document: merged.document,
        created: false,
        remoteInstallationId: merged.remoteInstallationId,
      };
    }
  }
  throw new DriveBackupError(
    "conflict",
    "Drive changed while syncing. Try again.",
  );
}

export async function downloadDriveReplica(
  accessToken: string,
  replica: DriveReplica,
  fetcher: Fetcher = fetch,
): Promise<Blob> {
  const response = await authorizedFetch(
    fetcher,
    accessToken,
    `${apiRoot}/files/${encodeURIComponent(replica.id)}?alt=media`,
  );
  return response.blob();
}

export async function deleteDriveReplica(
  accessToken: string,
  replica: DriveReplica,
  fetcher: Fetcher = fetch,
): Promise<void> {
  await authorizedFetch(
    fetcher,
    accessToken,
    `${apiRoot}/files/${encodeURIComponent(replica.id)}`,
    { method: "DELETE" },
  );
}

export async function deleteDriveBackups(
  accessToken: string,
  fetcher: Fetcher = fetch,
): Promise<number> {
  const replicas = await findReplicas(fetcher, accessToken);
  await Promise.all(
    replicas.map((replica) =>
      deleteDriveReplica(accessToken, replica, fetcher),
    ),
  );
  return replicas.length;
}
