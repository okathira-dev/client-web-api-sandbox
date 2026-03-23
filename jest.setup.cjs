const { extname } = require("node:path");
const { readFileSync } = require("node:fs");
const { fileURLToPath } = require("node:url");

// Jest setupはCJSとして読み込まれるため、requireで実装する。
// parser側は「常にfetchで読む」方針なので、ここでfile://だけを補完する。
const originalFetch =
  typeof globalThis.fetch === "function"
    ? globalThis.fetch.bind(globalThis)
    : null;

const toRequestUrl = (input) => {
  if (typeof input === "string") {
    return input;
  }
  if (input instanceof URL) {
    return input.href;
  }
  if (typeof Request !== "undefined" && input instanceof Request) {
    return input.url;
  }
  return null;
};

const getContentType = (filePath) => {
  switch (extname(filePath).toLowerCase()) {
    case ".xml":
    case ".xsd":
      return "application/xml; charset=utf-8";
    default:
      return "text/plain; charset=utf-8";
  }
};

globalThis.fetch = async (input, init) => {
  const requestUrl = toRequestUrl(input);
  // file:// 以外は既存fetchに委譲し、副作用を最小化する。
  if (!requestUrl || !requestUrl.startsWith("file://")) {
    if (!originalFetch) {
      throw new Error("globalThis.fetch is not available in this environment.");
    }
    return originalFetch(input, init);
  }

  const fileUrl = new URL(requestUrl);
  const filePath = fileURLToPath(fileUrl);

  try {
    const body = readFileSync(filePath);
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": getContentType(filePath),
      },
    });
  } catch (_error) {
    return new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }
};
