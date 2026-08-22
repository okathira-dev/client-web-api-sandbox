import { useCallback, useState } from "react";
import {
  DriveBackupError,
  type DriveBackupErrorCode,
  type DriveReplica,
  deleteDriveBackups,
  deleteDriveReplica,
  downloadDriveReplica,
  syncDriveBackup,
} from "../drive/driveBackup";
import {
  requestDriveAccessToken,
  revokeDriveAccessToken,
} from "../drive/googleIdentity";
import type { DriveStageSyncResult } from "../runtime/types";
import type { ProgressController } from "./useProgress";

export type DriveState =
  | "unconfigured"
  | "idle"
  | "authorizing"
  | "syncing"
  | "success"
  | "deleted"
  | "error";

export type DriveFailure = {
  readonly code: DriveBackupErrorCode | "unknown";
  readonly replicas: readonly DriveReplica[];
};

function failureFrom(
  error: unknown,
  fallbackReplicas: readonly DriveReplica[] = [],
): DriveFailure {
  return error instanceof DriveBackupError
    ? {
        code: error.code,
        replicas: error.replicas.length > 0 ? error.replicas : fallbackReplicas,
      }
    : { code: "unknown", replicas: fallbackReplicas };
}

function keepsTokenForRecovery(error: unknown): boolean {
  return (
    error instanceof DriveBackupError &&
    (error.code === "corrupt" ||
      error.code === "future" ||
      error.code === "conflict")
  );
}

export function useDriveBackup(progress: ProgressController) {
  const clientId = import.meta.env.VITE_BUSYBOX_DRIVE_GOOGLE_CLIENT_ID as
    | string
    | undefined;
  const [state, setState] = useState<DriveState>(
    clientId ? "idle" : "unconfigured",
  );
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [failure, setFailure] = useState<DriveFailure | null>(null);

  const sync = useCallback(async (): Promise<DriveStageSyncResult> => {
    if (!clientId) return { synced: false, remoteDevice: false };
    try {
      setFailure(null);
      let token = accessToken;
      if (!token) {
        setState("authorizing");
        token = await requestDriveAccessToken(clientId);
        setAccessToken(token);
      }
      setState("syncing");
      const localInstallationId = progress.document.installationId;
      const result = await syncDriveBackup(token, progress.document);
      progress.replaceDocument(() => result.document);
      progress.observe("drive:backup", [
        result.created ? "created" : "updated",
      ]);
      const remoteDevice = Boolean(
        result.remoteInstallationId &&
          result.remoteInstallationId !== localInstallationId,
      );
      if (remoteDevice) {
        progress.observe("drive:remote-device", ["merged"]);
      }
      setState("success");
      return { synced: true, remoteDevice };
    } catch (error) {
      // A failed remote operation never clears or replaces local progress. Keep an
      // already-authorized token for recovery choices that read or delete only the
      // explicitly named bad replica.
      if (!keepsTokenForRecovery(error)) setAccessToken(null);
      setState("error");
      setFailure(failureFrom(error));
      return { synced: false, remoteDevice: false };
    }
  }, [accessToken, progress]);

  const disconnect = useCallback(async () => {
    if (accessToken) await revokeDriveAccessToken(accessToken);
    setAccessToken(null);
    setFailure(null);
    setState(clientId ? "idle" : "unconfigured");
  }, [accessToken]);

  const removeRemote = useCallback(async () => {
    if (!clientId) return;
    try {
      let token = accessToken;
      if (!token) {
        setState("authorizing");
        token = await requestDriveAccessToken(clientId);
        setAccessToken(token);
      }
      setState("syncing");
      await deleteDriveBackups(token);
      setFailure(null);
      setState("deleted");
    } catch (error) {
      if (!keepsTokenForRecovery(error)) setAccessToken(null);
      setState("error");
      setFailure(failureFrom(error));
    }
  }, [accessToken]);

  const exportFailedReplica = useCallback(
    async (replica: DriveReplica) => {
      if (!accessToken) return;
      try {
        const blob = await downloadDriveReplica(accessToken, replica);
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = replica.name;
        link.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        setFailure(failureFrom(error, [replica]));
        setState("error");
      }
    },
    [accessToken],
  );

  const removeFailedReplica = useCallback(
    async (replica: DriveReplica) => {
      if (!accessToken) return;
      try {
        await deleteDriveReplica(accessToken, replica);
        setFailure(null);
        setState("idle");
      } catch (error) {
        setFailure(failureFrom(error, [replica]));
        setState("error");
      }
    },
    [accessToken],
  );

  return {
    state,
    configured: Boolean(clientId),
    connected: accessToken !== null,
    failure,
    sync,
    disconnect,
    removeRemote,
    exportFailedReplica,
    removeFailedReplica,
    dismissFailure: () => setFailure(null),
  };
}
