import { useCallback, useState } from "react";
import { deleteDriveBackup, syncDriveBackup } from "../drive/driveBackup";
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

export function useDriveBackup(progress: ProgressController) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const [state, setState] = useState<DriveState>(
    clientId ? "idle" : "unconfigured",
  );
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const sync = useCallback(async (): Promise<DriveStageSyncResult> => {
    if (!clientId) return { synced: false, remoteDevice: false };
    try {
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
    } catch {
      // A failed remote operation never clears or replaces local progress. Clearing
      // the token makes the next user gesture request a fresh short-lived token.
      setAccessToken(null);
      setState("error");
      return { synced: false, remoteDevice: false };
    }
  }, [accessToken, progress]);

  const disconnect = useCallback(async () => {
    if (accessToken) await revokeDriveAccessToken(accessToken);
    setAccessToken(null);
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
      await deleteDriveBackup(token);
      setState("deleted");
    } catch {
      setAccessToken(null);
      setState("error");
    }
  }, [accessToken]);

  return {
    state,
    configured: Boolean(clientId),
    connected: accessToken !== null,
    sync,
    disconnect,
    removeRemote,
  };
}
