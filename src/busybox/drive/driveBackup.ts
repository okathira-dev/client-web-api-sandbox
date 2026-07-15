import {
  mergeProgressDocuments,
  type ProgressDocument,
  parseProgressDocument,
} from "../domain/progress";

const apiRoot = "https://www.googleapis.com/drive/v3";
const uploadRoot = "https://www.googleapis.com/upload/drive/v3";
const backupName = "busybox-progress.json";

export class DriveBackupError extends Error {
  constructor(
    readonly code: "http" | "corrupt" | "future",
    message: string,
  ) {
    super(message);
    this.name = "DriveBackupError";
  }
}

interface DriveFile {
  id: string;
  modifiedTime?: string;
}

interface FileListResponse {
  files?: DriveFile[];
}

export interface DriveSyncResult {
  document: ProgressDocument;
  created: boolean;
  remoteInstallationId: string | null;
}

type Fetcher = typeof fetch;

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

async function findBackup(fetcher: Fetcher, accessToken: string) {
  const query = new URLSearchParams({
    spaces: "appDataFolder",
    q: `name = '${backupName}'`,
    fields: "files(id,modifiedTime)",
    orderBy: "modifiedTime desc",
    pageSize: "10",
  });
  const response = await authorizedFetch(
    fetcher,
    accessToken,
    `${apiRoot}/files?${query}`,
  );
  const list = (await response.json()) as FileListResponse;
  return list.files?.[0] ?? null;
}

async function createBackupFile(fetcher: Fetcher, accessToken: string) {
  const response = await authorizedFetch(
    fetcher,
    accessToken,
    `${apiRoot}/files?fields=id`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: backupName,
        mimeType: "application/json",
        parents: ["appDataFolder"],
      }),
    },
  );
  const file = (await response.json()) as Partial<DriveFile>;
  if (!file.id)
    throw new DriveBackupError("http", "Drive did not return a file id");
  return file.id;
}

async function downloadBackup(
  fetcher: Fetcher,
  accessToken: string,
  fileId: string,
) {
  const response = await authorizedFetch(
    fetcher,
    accessToken,
    `${apiRoot}/files/${encodeURIComponent(fileId)}?alt=media`,
  );
  return response.json() as Promise<unknown>;
}

async function uploadBackup(
  fetcher: Fetcher,
  accessToken: string,
  fileId: string,
  document: ProgressDocument,
) {
  await authorizedFetch(
    fetcher,
    accessToken,
    `${uploadRoot}/files/${encodeURIComponent(fileId)}?uploadType=media`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(document),
    },
  );
}

export async function syncDriveBackup(
  accessToken: string,
  local: ProgressDocument,
  fetcher: Fetcher = fetch,
): Promise<DriveSyncResult> {
  const existing = await findBackup(fetcher, accessToken);
  if (!existing) {
    const fileId = await createBackupFile(fetcher, accessToken);
    await uploadBackup(fetcher, accessToken, fileId, local);
    return { document: local, created: true, remoteInstallationId: null };
  }

  const rawRemote = await downloadBackup(fetcher, accessToken, existing.id);
  const parsed = parseProgressDocument(rawRemote);
  if (parsed.status === "future") {
    throw new DriveBackupError(
      "future",
      `Future Drive schema: ${parsed.version}`,
    );
  }
  if (parsed.status === "corrupt") {
    throw new DriveBackupError(
      "corrupt",
      `Corrupt Drive backup: ${parsed.reason}`,
    );
  }

  // Download before every upload and use the same grow-only merge as local import.
  // A failed request never replaces the caller's local document.
  const document = mergeProgressDocuments(local, parsed.document);
  await uploadBackup(fetcher, accessToken, existing.id, document);
  return {
    document,
    created: false,
    remoteInstallationId: parsed.document.installationId,
  };
}

export async function deleteDriveBackup(
  accessToken: string,
  fetcher: Fetcher = fetch,
): Promise<boolean> {
  const existing = await findBackup(fetcher, accessToken);
  if (!existing) return false;
  await authorizedFetch(
    fetcher,
    accessToken,
    `${apiRoot}/files/${encodeURIComponent(existing.id)}`,
    { method: "DELETE" },
  );
  return true;
}
