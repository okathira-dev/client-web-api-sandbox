import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const mdnUrl = "https://developer.mozilla.org/en-US/docs/Web/API";
const bcdUrl = "https://unpkg.com/@mdn/browser-compat-data/data.json";
const verifiedOn = new Date().toISOString().slice(0, 10);

const [mdnResponse, bcdResponse] = await Promise.all([
  fetch(mdnUrl),
  fetch(bcdUrl),
]);
if (!mdnResponse.ok)
  throw new Error(`MDN request failed: ${mdnResponse.status}`);
if (!bcdResponse.ok)
  throw new Error(`BCD request failed: ${bcdResponse.status}`);
const html = await mdnResponse.text();
const bcd = await bcdResponse.json();

function decode(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replace(/<[^>]+>/g, "")
    .trim();
}

const specificationStart = html.search(/<h2[^>]+id=["']specifications["']/i);
const interfaceStart = html.search(/<h2[^>]+id=["']interfaces["']/i);
if (specificationStart < 0 || interfaceStart < 0)
  throw new Error("MDN Web API sections changed");
const specificationHtml = html.slice(specificationStart, interfaceStart);
const familyMatches = [
  ...specificationHtml.matchAll(
    /<a[^>]+href=["']([^"']*\/docs\/Web\/API\/[^"'#?]+)["'][^>]*>([\s\S]*?)<\/a>/gi,
  ),
];
const familiesByUrl = new Map();
for (const [, path, title] of familyMatches) {
  const url = new URL(path, mdnUrl).href;
  familiesByUrl.set(url, decode(title));
}

const stageMatchers = [
  [
    /Abort|Credential|Authenticator|PublicKeyCredential|Web Authentication/i,
    ["S-380", "S-390"],
  ],
  [/Accelerometer/i, ["S-550"]],
  [/AmbientLight/i, ["S-540"]],
  [/Battery/i, ["S-370"]],
  [/Bluetooth/i, ["S-280"]],
  [/Broadcast|Channel Messaging|Web Locks/i, ["S-050", "S-250", "S-360"]],
  [
    /Canvas|Screen Capture|MediaRecorder|MediaStream Recording/i,
    ["S-190", "S-230", "S-350"],
  ],
  [/Clipboard|Selection/i, ["S-030", "S-180", "S-500"]],
  [/Device orientation|DeviceMotion|DeviceOrientation/i, ["S-100"]],
  [/Device Posture|Viewport Segment/i, ["S-320"]],
  [/Drag|DataTransfer/i, ["S-510"]],
  [/EyeDropper/i, ["S-260"]],
  [/File/i, ["S-130", "S-440", "S-510"]],
  [/Gamepad/i, ["S-200"]],
  [/Geolocation/i, ["S-590", "S-600"]],
  [/Gyroscope/i, ["S-560"]],
  [/HID/i, ["S-290"]],
  [/History|Navigation Timing|PerformanceNavigation/i, ["S-220"]],
  [/HTMLMediaElement|Picture-in-Picture/i, ["S-230", "S-350"]],
  [/Launch|Window Controls Overlay/i, ["S-310", "S-440", "S-450", "S-460"]],
  [/LinearAcceleration/i, ["S-530"]],
  [/Media Session/i, ["S-430"]],
  [/Notification/i, ["S-090", "S-410", "S-420"]],
  [/Page Visibility|Performance|DOMHighRes/i, ["S-040", "S-400"]],
  [/Proximity/i, ["S-520"]],
  [/RelativeOrientation/i, ["S-570"]],
  [/ResizeObserver/i, ["S-020", "S-480"]],
  [/Service Worker|CacheStorage/i, ["S-070", "S-090", "S-410", "S-420"]],
  [/SpeechRecognition|Web Speech/i, ["S-580"]],
  [/USB/i, ["S-300"]],
  [/View Transition|Animation/i, ["S-170", "S-340"]],
  [/Wake Lock/i, ["S-330"]],
  [/Web Audio|AudioContext|AnalyserNode/i, ["S-120", "S-360", "S-430"]],
  [/Web Share/i, ["S-240"]],
  [/WebGPU|^GPU/i, ["S-270"]],
  [/WebRTC|RTC/i, ["S-190", "S-360"]],
];

const excludedPattern =
  /Attribution|Encrypted Media|Fenced Frame|FedCM|Payment|Private State Token|Protected Audience|Topics API|WebVR/i;
const labsPattern = /Bluetooth|HID|MIDI|NFC|Serial|USB|XR|Sensor|GPU|Speech/i;

function stagesFor(name) {
  return [
    ...new Set(
      stageMatchers.flatMap(([pattern, ids]) =>
        pattern.test(name) ? ids : [],
      ),
    ),
  ];
}

function disposition(name, status = {}) {
  const stageIds = stagesFor(name);
  if (stageIds.length)
    return {
      disposition: "stage",
      stageIds,
      reason: "Implemented as an observable Busybox mechanic.",
    };
  if (status.deprecated || excludedPattern.test(name))
    return {
      disposition: "exclude",
      stageIds: [],
      reason: status.deprecated
        ? "Deprecated in BCD; no new stage."
        : "Requires a payment, identity, advertising, DRM, or retired surface outside the static-game policy.",
    };
  if (status.experimental || labsPattern.test(name))
    return {
      disposition: "hold",
      stageIds: [],
      reason:
        "Experimental, hardware-limited, or implementation-limited without a distinct approved mechanic; retain in Labs audit.",
    };
  return {
    disposition: "integrate",
    stageIds: [],
    reason:
      "Active web-platform building block, but no distinct player-observable mechanic beyond an existing stage; retain as implementation infrastructure.",
  };
}

const families = [...familiesByUrl].map(([url, name]) => ({
  name,
  url,
  ...disposition(name),
}));
const interfaces = Object.entries(bcd.api).map(([name, value]) => {
  const compat = value.__compat ?? {};
  return {
    name,
    bcdKey: `api.${name}`,
    mdnUrl:
      compat.mdn_url ??
      `https://developer.mozilla.org/en-US/docs/Web/API/${name}`,
    status: compat.status ?? {
      deprecated: false,
      experimental: false,
      standard_track: true,
    },
    sourceFile: compat.source_file ?? null,
    ...disposition(name, compat.status),
  };
});

const counts = (items) =>
  Object.fromEntries(
    ["stage", "integrate", "hold", "exclude"].map((key) => [
      key,
      items.filter((item) => item.disposition === key).length,
    ]),
  );
const ledger = {
  schemaVersion: 1,
  verifiedOn,
  sources: { mdnUrl, bcdUrl, bcdVersion: bcd.__meta?.version ?? null },
  summary: {
    familyCount: families.length,
    interfaceCount: interfaces.length,
    familyDisposition: counts(families),
    interfaceDisposition: counts(interfaces),
    unclassified: 0,
  },
  families,
  interfaces,
};

const output = resolve("src/busybox/data/api-ledger.json");
await writeFile(output, `${JSON.stringify(ledger, null, 2)}\n`, "utf8");
console.log(JSON.stringify(ledger.summary));
