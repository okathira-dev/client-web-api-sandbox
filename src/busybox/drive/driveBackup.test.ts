import { createProgressDocument, solveBox } from "../domain/progress";
import {
  type DriveBackupError,
  deleteDriveBackups,
  syncDriveBackup,
} from "./driveBackup";

const now = "2026-01-01T00:00:00.000Z";

function jsonResponse(
  value: unknown,
  status = 200,
  headers: Record<string, string> = {},
) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function replica(id: string, name: string) {
  return { id, name, modifiedTime: now };
}

describe("Drive replica backup sync", () => {
  it("creates one installation-owned replica when none exists", async () => {
    const calls: Array<[RequestInfo | URL, RequestInit | undefined]> = [];
    const fetcher: typeof fetch = jest.fn(async (input, init) => {
      calls.push([input, init]);
      if (calls.length === 1) return jsonResponse({ files: [] });
      if (calls.length === 2) {
        return jsonResponse(replica("file-1", "busybox-progress-local.json"));
      }
      return jsonResponse({});
    });
    const local = createProgressDocument("ja", "local");

    const result = await syncDriveBackup("token", local, fetcher);

    expect(result.created).toBe(true);
    expect(String(calls[0]?.[0])).toContain("spaces=appDataFolder");
    expect(calls[1]?.[1]?.body).toContain("busybox-progress-local.json");
    expect(calls[2]?.[1]?.method).toBe("PATCH");
  });

  it("merges every device replica before updating this device", async () => {
    const local = solveBox(
      createProgressDocument("ja", "local"),
      "S-000",
      "B01",
    );
    const remote = solveBox(
      createProgressDocument("en", "remote"),
      "S-020",
      "B01",
    );
    let call = 0;
    const fetcher: typeof fetch = jest.fn(async () => {
      call += 1;
      if (call === 1) {
        return jsonResponse({
          files: [
            replica("local-file", "busybox-progress-local.json"),
            replica("remote-file", "busybox-progress-remote.json"),
          ],
        });
      }
      if (call === 2) return jsonResponse(local, 200, { etag: "local-etag" });
      if (call === 3) return jsonResponse(remote, 200, { etag: "remote-etag" });
      return jsonResponse({});
    });

    const result = await syncDriveBackup("token", local, fetcher);

    expect(result.document.stages).toEqual({
      "S-000": { solvedBoxIds: ["B01"] },
      "S-020": { solvedBoxIds: ["B01"] },
    });
    expect(result.remoteInstallationId).toBe("remote");
  });

  it("retries the complete merge after an ETag conflict", async () => {
    const local = createProgressDocument("ja", "local");
    let call = 0;
    const fetcher: typeof fetch = jest.fn(async () => {
      call += 1;
      if (call === 1 || call === 4) {
        return jsonResponse({
          files: [replica("local-file", "busybox-progress-local.json")],
        });
      }
      if (call === 2 || call === 5)
        return jsonResponse(local, 200, { etag: "etag" });
      if (call === 3) return new Response(null, { status: 412 });
      return jsonResponse({});
    });

    await expect(
      syncDriveBackup("token", local, fetcher),
    ).resolves.toMatchObject({
      created: false,
    });
    expect(call).toBe(6);
  });

  it("does not upload after a corrupt replica", async () => {
    const broken = replica("broken-file", "busybox-progress-broken.json");
    const fetcher: typeof fetch = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({ files: [broken] }))
      .mockResolvedValueOnce(
        jsonResponse({ schemaVersion: 1, boxes: "broken" }),
      );

    await expect(
      syncDriveBackup("token", createProgressDocument("en", "local"), fetcher),
    ).rejects.toEqual(
      expect.objectContaining({
        code: "corrupt",
        replicas: [broken],
      }) as DriveBackupError,
    );
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("deletes every replica, not an arbitrary newest file", async () => {
    const fetcher: typeof fetch = jest
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          files: [
            replica("one", "busybox-progress-one.json"),
            replica("two", "busybox-progress-two.json"),
          ],
        }),
      )
      .mockResolvedValue(new Response(null, { status: 204 }));

    await expect(deleteDriveBackups("token", fetcher)).resolves.toBe(2);
    expect(fetcher).toHaveBeenCalledTimes(3);
  });
});
