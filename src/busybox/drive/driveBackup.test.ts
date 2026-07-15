import { createProgressDocument, solveBox } from "../domain/progress";
import { deleteDriveBackup, syncDriveBackup } from "./driveBackup";

const now = "2026-01-01T00:00:00.000Z";

function jsonResponse(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Drive backup sync", () => {
  it("creates an appDataFolder backup when none exists", async () => {
    const calls: Array<[RequestInfo | URL, RequestInit | undefined]> = [];
    const fetcher: typeof fetch = jest.fn(async (input, init) => {
      calls.push([input, init]);
      if (calls.length === 1) return jsonResponse({ files: [] });
      if (calls.length === 2) return jsonResponse({ id: "file-1" });
      return jsonResponse({});
    });
    const local = createProgressDocument("ja", now, "local");

    const result = await syncDriveBackup("token", local, fetcher);

    expect(result.created).toBe(true);
    expect(String(calls[0]?.[0])).toContain("spaces=appDataFolder");
    expect(calls[1]?.[1]?.body).toContain("appDataFolder");
    expect(calls[2]?.[1]?.method).toBe("PATCH");
  });

  it("merges remote clears before uploading", async () => {
    const local = solveBox(
      createProgressDocument("ja", now, "local"),
      "S-000-B01",
    );
    const remote = solveBox(
      createProgressDocument("en", now, "remote"),
      "S-020-B01",
    );
    let call = 0;
    const fetcher: typeof fetch = jest.fn(async () => {
      call += 1;
      if (call === 1) return jsonResponse({ files: [{ id: "file-1" }] });
      if (call === 2) return jsonResponse(remote);
      return jsonResponse({});
    });

    const result = await syncDriveBackup("token", local, fetcher);

    expect(Object.keys(result.document.boxes).sort()).toEqual([
      "S-000-B01",
      "S-020-B01",
    ]);
    expect(result.document.settings.locale).toBe("ja");
    expect(result.remoteInstallationId).toBe("remote");
  });

  it("does not upload a corrupt remote backup", async () => {
    let calls = 0;
    const fetcher: typeof fetch = jest.fn(async () => {
      calls += 1;
      return calls === 1
        ? jsonResponse({ files: [{ id: "file-1" }] })
        : jsonResponse({ schemaVersion: 1, boxes: "broken" });
    });

    await expect(
      syncDriveBackup(
        "token",
        createProgressDocument("en", now, "local"),
        fetcher,
      ),
    ).rejects.toMatchObject({ code: "corrupt" });
    expect(calls).toBe(2);
  });

  it("permanently deletes only the appData backup", async () => {
    const fetcher: typeof fetch = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({ files: [{ id: "file-1" }] }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    await expect(deleteDriveBackup("token", fetcher)).resolves.toBe(true);
    expect(fetcher).toHaveBeenLastCalledWith(
      expect.stringContaining("/files/file-1"),
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
