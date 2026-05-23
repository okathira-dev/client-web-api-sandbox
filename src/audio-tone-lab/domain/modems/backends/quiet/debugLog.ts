export function quietDebugLog(
  location: string,
  message: string,
  hypothesisId: string,
  data: Record<string, unknown> = {},
) {
  // #region agent log
  fetch("http://127.0.0.1:7590/ingest/ac72d68f-844c-4c16-8007-86a6b4baa5e0", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "c88ed1",
    },
    body: JSON.stringify({
      sessionId: "c88ed1",
      hypothesisId,
      location,
      message,
      data: { ...data, t: performance.now() },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
}
