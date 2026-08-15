import {
  bytesAsHex,
  decodeFatal,
  encodingFixturePositions,
  encodingFixtures,
  encodingLabels,
  solveEncodingFixtures,
  validLabelsForPosition,
} from "../fixtures/encoding/data";
import {
  unicodeExpressionText,
  unicodeFixtures,
} from "../fixtures/unicode/data";

type Capability = {
  poc: string;
  path: string;
  supported: boolean;
};

type ReviewGroup = {
  heading: string;
  description: string;
  items: readonly string[];
};

const outputElement =
  document.querySelector<HTMLOutputElement>("#probe-output");
const resultBodyElement = document.querySelector<HTMLTableSectionElement>(
  "#capability-results",
);
const encodingLabelsElement =
  document.querySelector<HTMLUListElement>("#encoding-labels");
const encodingPreviewElement =
  document.querySelector<HTMLDivElement>("#encoding-preview");
const unicodePreviewElement =
  document.querySelector<HTMLDivElement>("#unicode-preview");

if (
  !outputElement ||
  !resultBodyElement ||
  !encodingLabelsElement ||
  !encodingPreviewElement ||
  !unicodePreviewElement
) {
  throw new Error("PoC probe page is incomplete.");
}

const output: HTMLOutputElement = outputElement;
const resultBody: HTMLTableSectionElement = resultBodyElement;
const encodingLabelList: HTMLUListElement = encodingLabelsElement;
const encodingPreview: HTMLDivElement = encodingPreviewElement;
const unicodePreview: HTMLDivElement = unicodePreviewElement;

const manualReviewElement = document.querySelector<HTMLDivElement>(
  "#manual-review-results",
);

if (!manualReviewElement) {
  throw new Error("PoC review queue is incomplete.");
}

const manualReview = manualReviewElement;

const windowWithExperiments = window as Window & {
  CSS?: typeof CSS & {
    highlights?: HighlightRegistry;
    highlightsFromPoint?: unknown;
  };
  navigation?: EventTarget & {
    canGoForward?: boolean;
    currentEntry?: EventTarget;
    navigate?: (url: string, options?: { history: "push" }) => unknown;
  };
  PressureObserver?: unknown;
  VideoEncoder?: unknown;
  MediaStreamTrackProcessor?: unknown;
  OTPCredential?: unknown;
  IdentityCredential?: unknown;
};

const navigatorWithExperiments = navigator as Navigator & {
  connection?: unknown;
  contacts?: unknown;
  presentation?: unknown;
  queryLocalFonts?: unknown;
  userPreferences?: unknown;
};

type PressureRecord = {
  source: string;
  state: "nominal" | "fair" | "serious" | "critical";
  time: number;
};
type PassivePressureObserver = {
  observe: (source: "cpu") => Promise<void>;
  disconnect: () => void;
};
type PassivePressureObserverConstructor = new (
  callback: (records: PressureRecord[]) => void,
) => PassivePressureObserver;
type VideoTrackProcessor = {
  readable: ReadableStream<VideoFrame>;
};
type VideoTrackProcessorConstructor = new (options: {
  track: MediaStreamTrack;
  maxBufferSize: number;
}) => VideoTrackProcessor;
type CapturableVideo = HTMLVideoElement & {
  captureStream?: () => MediaStream;
};

const registrationPrototype =
  typeof ServiceWorkerRegistration === "undefined"
    ? undefined
    : (ServiceWorkerRegistration.prototype as ServiceWorkerRegistration & {
        periodicSync?: unknown;
        paymentManager?: unknown;
      });

const capabilities: Capability[] = [
  {
    poc: "001",
    path: "CSS Custom Highlight / highlightsFromPoint",
    supported: Boolean(windowWithExperiments.CSS?.highlights),
  },
  {
    poc: "002",
    path: "sendBeacon + Service Worker",
    supported: "sendBeacon" in navigator && "serviceWorker" in navigator,
  },
  {
    poc: "003",
    path: "details[name] + dialog closedby",
    supported:
      "HTMLDialogElement" in window && "name" in HTMLDetailsElement.prototype,
  },
  {
    poc: "004",
    path: "Navigation API",
    supported: "navigation" in windowWithExperiments,
  },
  {
    poc: "008",
    path: "User Preferences override",
    supported: "userPreferences" in navigatorWithExperiments,
  },
  {
    poc: "009",
    path: "Drag and Drop",
    supported: "DataTransfer" in window && "DragEvent" in window,
  },
  {
    poc: "010",
    path: "SpeechSynthesis",
    supported:
      "speechSynthesis" in window && "SpeechSynthesisUtterance" in window,
  },
  {
    poc: "011",
    path: "Unicode text + FontFace",
    supported: "FontFace" in window,
  },
  {
    poc: "012",
    path: "Network Information",
    supported: "connection" in navigatorWithExperiments,
  },
  { poc: "013", path: "TextDecoder", supported: "TextDecoder" in window },
  {
    poc: "014",
    path: "Permissions API",
    supported: "permissions" in navigator,
  },
  {
    poc: "015",
    path: "Compute Pressure",
    supported: "PressureObserver" in windowWithExperiments,
  },
  { poc: "016", path: "Console output", supported: "console" in window },
  { poc: "018", path: "Text Fragment navigation", supported: "URL" in window },
  {
    poc: "019",
    path: "Remote Playback",
    supported: "remote" in HTMLMediaElement.prototype,
  },
  {
    poc: "020",
    path: "Presentation API",
    supported: "presentation" in navigatorWithExperiments,
  },
  {
    poc: "021",
    path: "Insertable Media Streams",
    supported: "MediaStreamTrackProcessor" in windowWithExperiments,
  },
  {
    poc: "022",
    path: "WebCodecs",
    supported: "VideoEncoder" in windowWithExperiments,
  },
  { poc: "023", path: "WebXR", supported: "xr" in navigator },
  {
    poc: "024",
    path: "Periodic Background Sync",
    supported: Boolean(
      registrationPrototype && "periodicSync" in registrationPrototype,
    ),
  },
  {
    poc: "025",
    path: "WebOTP / autofill",
    supported: "OTPCredential" in windowWithExperiments,
  },
  {
    poc: "026",
    path: "Contact Picker",
    supported: "contacts" in navigatorWithExperiments,
  },
  {
    poc: "027",
    path: "FedCM",
    supported: "IdentityCredential" in windowWithExperiments,
  },
  {
    poc: "028",
    path: "Payment Handler",
    supported:
      "PaymentRequest" in window &&
      Boolean(
        registrationPrototype && "paymentManager" in registrationPrototype,
      ),
  },
  {
    poc: "029",
    path: "Local Font Access",
    supported: "queryLocalFonts" in navigatorWithExperiments,
  },
  {
    poc: "030",
    path: "Invoker Commands",
    supported: "command" in HTMLButtonElement.prototype,
  },
  {
    poc: "031",
    path: "browser / OS media controls",
    supported:
      "mediaSession" in navigator &&
      "requestPictureInPicture" in HTMLVideoElement.prototype,
  },
];

for (const capability of capabilities) {
  const row = document.createElement("tr");
  const state = capability.supported ? "available" : "unsupported";
  row.innerHTML = `<td>POC-${capability.poc}</td><td>${capability.path}</td><td class="${state}">${state}</td>`;
  resultBody.append(row);
}
resultBody.setAttribute("aria-busy", "false");

const reviewGroups: readonly ReviewGroup[] = [
  {
    heading: "このページで今確認できる",
    description:
      "ブラウザに表示されたfixtureを操作し、実eventまたは固定fixtureの結果を読む。",
    items: [
      "POC-001 Custom Highlight",
      "POC-003 details / dialog",
      "POC-004 Navigation APIの入口",
      "POC-011 Unicode fixture",
      "POC-013 Encoding fixture",
      "POC-022 WebCodecs入口",
      "POC-030 Invoker Commands",
      "POC-031 browser / OS media controls",
    ],
  },
  {
    heading: "このPCでは入口だけを確認する",
    description:
      "capability tableで有無は読めるが、成立には別fixture、長時間観測、または詳しい謎設計が必要。",
    items: [
      "POC-008 User Preferences",
      "POC-009 cross-window D&D",
      "POC-010 SpeechSynthesis",
      "POC-014 Permissions",
      "POC-015 Compute Pressure",
      "POC-016 Console maze",
      "POC-018 Text Fragment",
      "POC-021 bounded Insertable Streams",
    ],
  },
  {
    heading: "別環境・外部条件が必要",
    description:
      "このページから成功を再現しない。対象環境を用意できた時だけ専用PoCを進める。",
    items: [
      "POC-002 offline Beacon",
      "POC-012 Network Information",
      "POC-019 / 020 external receiver",
      "POC-023 WebXR",
      "POC-024 Periodic Background Sync",
      "POC-025 WebOTP / AutoFill",
      "POC-026 Contact Picker",
      "POC-027 FedCM",
      "POC-028 Payment Handler",
      "POC-029 Local Font Access",
    ],
  },
];

const offlineBeaconRegistrationButton =
  document.querySelector<HTMLButtonElement>("#register-offline-beacon");
const offlineBeaconSendButton = document.querySelector<HTMLButtonElement>(
  "#send-offline-beacon",
);

function waitForActiveWorker(
  registration: ServiceWorkerRegistration,
): Promise<ServiceWorker> {
  const worker =
    registration.active ?? registration.waiting ?? registration.installing;
  if (!worker) return Promise.reject(new Error("worker was not installed"));
  if (worker.state === "activated") return Promise.resolve(worker);
  return new Promise((resolveWorker, rejectWorker) => {
    worker.addEventListener("statechange", () => {
      if (worker.state === "activated") resolveWorker(worker);
      if (worker.state === "redundant") {
        rejectWorker(new Error("worker became redundant"));
      }
    });
  });
}

offlineBeaconRegistrationButton?.addEventListener("click", async () => {
  setStatus("#offline-beacon-status", "workerを登録中…");
  if (!("serviceWorker" in navigator)) {
    setStatus("#offline-beacon-status", "Service Workerは利用できません。");
    return;
  }
  try {
    const scopeUrl = new URL("./", location.href);
    const scope = scopeUrl.pathname;
    const previousRegistrations =
      await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      previousRegistrations
        .filter((registration) => registration.scope.startsWith(scopeUrl.href))
        .map((registration) => registration.unregister()),
    );
    const registration = await Promise.race([
      navigator.serviceWorker.register(
        new URL("./offline-beacon-sw.js", location.href).href,
        { scope, type: "module" },
      ),
      new Promise<never>((_resolve, reject) => {
        window.setTimeout(
          () => reject(new Error("worker registration timed out")),
          5000,
        );
      }),
    ]);
    await Promise.race([
      waitForActiveWorker(registration),
      new Promise<never>((_resolve, reject) => {
        window.setTimeout(
          () => reject(new Error("worker activation timed out")),
          5000,
        );
      }),
    ]);
    offlineBeaconSendButton?.removeAttribute("disabled");
    setStatus(
      "#offline-beacon-status",
      `worker registered: scope=${registration.scope}. online配線を確認できます。`,
    );
  } catch (error) {
    setStatus(
      "#offline-beacon-status",
      `worker登録失敗: ${error instanceof Error ? error.message : "unknown"}`,
    );
  }
});

offlineBeaconSendButton?.addEventListener("click", () => {
  const nonce = crypto.randomUUID();
  const payload = new Blob([JSON.stringify({ nonce })], {
    type: "application/json",
  });
  const accepted = navigator.sendBeacon(
    new URL("./offline-beacon/receipt", location.href).href,
    payload,
  );
  if (!accepted) {
    setStatus(
      "#offline-beacon-status",
      "sendBeacon()がfalseを返しました。遷移しません。",
    );
    return;
  }
  setStatus(
    "#offline-beacon-status",
    "sendBeacon()=true。receiverへfull-document navigationします。",
  );
  location.assign(
    `./offline-beacon/receiver.html?nonce=${encodeURIComponent(nonce)}`,
  );
});

for (const group of reviewGroups) {
  const card = document.createElement("section");
  card.className = "review-card";
  const heading = document.createElement("h3");
  heading.textContent = group.heading;
  const description = document.createElement("p");
  description.textContent = group.description;
  const list = document.createElement("ul");
  for (const item of group.items) {
    const entry = document.createElement("li");
    entry.textContent = item;
    list.append(entry);
  }
  card.append(heading, description, list);
  manualReview.append(card);
}
manualReview.setAttribute("aria-busy", "false");

for (const link of document.querySelectorAll<HTMLAnchorElement>(
  "[data-text-fragment]",
)) {
  const textFragment = link.dataset.textFragment;
  const target = link.getAttribute("href")?.slice(1);
  if (textFragment && target) {
    link.href = `#${target}:~:text=${encodeURIComponent(textFragment)}`;
  }
}

for (const label of encodingLabels) {
  const item = document.createElement("li");
  item.textContent = label;
  encodingLabelList.append(item);
}
encodingLabelList.setAttribute("aria-busy", "false");

function bytePresentation(item: (typeof encodingFixtures)[number]): string {
  return bytesAsHex(item.bytes);
}

function addReference(
  question: HTMLElement,
  label: string,
  glyphs: string,
): void {
  const heading = document.createElement("p");
  heading.textContent = label;
  question.append(heading);

  const reference = document.createElement("samp");
  reference.className = "encoding-reference";
  reference.dir = "auto";
  reference.textContent = glyphs;
  question.append(reference);
}

function addAnswer(
  question: HTMLElement,
  item: (typeof encodingFixtures)[number],
): void {
  const answer = document.createElement("p");
  answer.className = "encoding-answer";
  answer.textContent = `回答文字列: ${item.expectedText} / 正答文字コード: 元の符号化 = ${item.sourceLabel} / 表示に使った符号化 = ${item.renderedLabel}`;
  question.append(answer);
}

function matchDescription(
  item: (typeof encodingFixtures)[number],
  label: (typeof encodingLabels)[number],
): string | undefined {
  if (item.kind === "mojibake") {
    if (label === item.sourceLabel) return "復元後の回答文字列と一致";
    if (label === item.renderedLabel) return "問題表示と一致";
    return undefined;
  }
  return undefined;
}

function addDecodeTable(
  question: HTMLElement,
  item: (typeof encodingFixtures)[number],
): void {
  const wrapper = document.createElement("div");
  wrapper.className = "encoding-results";

  const table = document.createElement("table");
  const caption = document.createElement("caption");
  caption.textContent = "全labelでのTextDecoder復号結果";
  table.append(caption);

  const head = document.createElement("thead");
  head.innerHTML = "<tr><th>label</th><th>復号結果</th><th>照合</th></tr>";
  table.append(head);

  const body = document.createElement("tbody");
  for (const label of encodingLabels) {
    const row = document.createElement("tr");
    const labelCell = document.createElement("th");
    labelCell.scope = "row";
    labelCell.textContent = label;
    row.append(labelCell);

    const decodedCell = document.createElement("td");
    decodedCell.dir = "auto";
    decodedCell.textContent = decodeFatal(label, item.bytes) ?? "fatal error";
    row.append(decodedCell);

    const match = matchDescription(item, label);
    const matchCell = document.createElement("td");
    matchCell.className = match ? "encoding-match" : "encoding-no-match";
    matchCell.textContent = match ?? "—";
    row.append(matchCell);
    body.append(row);
  }
  table.append(body);
  wrapper.append(table);
  question.append(wrapper);
}

for (const item of encodingFixtures) {
  const question = document.createElement("article");
  question.className = "encoding-question";

  const heading = document.createElement("h3");
  heading.textContent = `${item.id} 文字化け`;
  question.append(heading);

  const byteHeading = document.createElement("p");
  byteHeading.textContent = "raw bytes（16進）";
  question.append(byteHeading);

  const bytes = document.createElement("code");
  bytes.className = "encoding-bytes";
  bytes.textContent = bytePresentation(item);
  question.append(bytes);

  addReference(question, "復元後の回答文字列", item.expectedText);
  addReference(question, "問題に表示する文字化け", item.presentedText);
  addAnswer(question, item);
  addDecodeTable(question, item);
  encodingPreview.append(question);
}
encodingPreview.setAttribute("aria-busy", "false");

function createMayanOperand(text: string): HTMLSpanElement {
  const operand = document.createElement("span");
  operand.className = "mayan-operand";
  for (const glyph of text) {
    const digit = document.createElement("span");
    digit.textContent = glyph;
    operand.append(digit);
  }
  return operand;
}

for (const item of unicodeFixtures) {
  const question = document.createElement("article");
  question.className = "unicode-question";

  const heading = document.createElement("h3");
  heading.textContent = `${item.id} ${item.systemName}`;
  question.append(heading);

  const metadata = document.createElement("p");
  metadata.textContent = `Unicode ${item.unicodeVersion} / 基数${item.radix} / 答え ${item.answer}`;
  question.append(metadata);

  const expression = document.createElement("div");
  expression.id = `unicode-expression-${item.id}`;
  expression.className = `unicode-expression unicode-expression-${item.layout}`;
  expression.dir = item.direction;
  expression.dataset.expectedCopy = unicodeExpressionText(item);
  if (item.layout === "mayan") {
    expression.append(
      createMayanOperand(item.leftText),
      ` ${item.operator} `,
      createMayanOperand(item.rightText),
    );
  } else {
    expression.textContent = unicodeExpressionText(item);
  }
  question.append(expression);
  unicodePreview.append(question);
}
unicodePreview.setAttribute("aria-busy", "false");

const mediaAssetUrls = {
  target: new URL("../fixtures/media/assets/reel-640x360.webm", import.meta.url)
    .href,
  multiAudio: new URL(
    "../fixtures/media/assets/multi-audio.mp4",
    import.meta.url,
  ).href,
};

const videoRecoveryAssets = {
  sourceT1: {
    url: new URL(
      "../fixtures/video-recovery/assets/source-t1.webm",
      import.meta.url,
    ).href,
  },
  sourceT2: {
    url: new URL(
      "../fixtures/video-recovery/assets/source-t2.webm",
      import.meta.url,
    ).href,
  },
  sourceT3: {
    url: new URL(
      "../fixtures/video-recovery/assets/source-t3.webm",
      import.meta.url,
    ).href,
  },
  recoveredAlpha: {
    url: new URL(
      "../fixtures/video-recovery/assets/recovered-alpha.webm",
      import.meta.url,
    ).href,
  },
  recoveredBeta: {
    url: new URL(
      "../fixtures/video-recovery/assets/recovered-beta.webm",
      import.meta.url,
    ).href,
  },
} as const;

function setMediaSource(selector: string, source: string): void {
  const video = document.querySelector<HTMLVideoElement>(selector);
  if (video) video.src = source;
}

setMediaSource("#poc-native-controls", mediaAssetUrls.multiAudio);
setMediaSource("#poc-pip-video", mediaAssetUrls.target);
const mediaSessionAudio = document.querySelector<HTMLAudioElement>(
  "#poc-media-session-audio",
);
if (mediaSessionAudio) mediaSessionAudio.src = mediaAssetUrls.multiAudio;
setMediaSource("#recovery-source-t1", videoRecoveryAssets.sourceT1.url);
setMediaSource("#recovery-alpha-t1", videoRecoveryAssets.recoveredAlpha.url);
setMediaSource("#recovery-source-t2", videoRecoveryAssets.sourceT2.url);
setMediaSource("#recovery-alpha-t2", videoRecoveryAssets.recoveredAlpha.url);
setMediaSource("#recovery-source-t3-alpha", videoRecoveryAssets.sourceT3.url);
setMediaSource("#recovery-alpha-t3", videoRecoveryAssets.recoveredAlpha.url);
setMediaSource("#recovery-source-t3-beta", videoRecoveryAssets.sourceT3.url);
setMediaSource("#recovery-beta-t3", videoRecoveryAssets.recoveredBeta.url);

function setStatus(selector: string, message: string): void {
  const status = document.querySelector<HTMLOutputElement>(selector);
  if (status) status.value = message;
}

function setCheck(
  selector: string,
  state: "passed" | "unavailable" | "waiting",
  message: string,
): void {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element) return;
  element.dataset.state = state;
  element.textContent = message;
}

function report(message: string) {
  output.value = message;
}

document.querySelector("#run-baseline")?.addEventListener("click", async () => {
  const media = await navigator.mediaCapabilities.decodingInfo({
    type: "file",
    video: {
      contentType: 'video/webm; codecs="vp8"',
      width: 360,
      height: 360,
      bitrate: 250_000,
      framerate: 12,
    },
  });
  const permissionNames = [
    "geolocation",
    "notifications",
    "camera",
    "microphone",
  ] as const;
  const permissions = await Promise.all(
    permissionNames.map(async (name) => {
      try {
        const status = await navigator.permissions.query({
          name,
        } as PermissionDescriptor);
        return `${name}=${status.state}`;
      } catch (error) {
        return `${name}=${error instanceof Error ? error.name : "error"}`;
      }
    }),
  );
  const connection = navigatorWithExperiments.connection as
    | { type?: string }
    | undefined;
  report(
    [
      `UA: ${navigator.userAgent}`,
      `secure=${isSecureContext}`,
      `MediaCapabilities(VP8/360p): supported=${media.supported}, smooth=${media.smooth}, powerEfficient=${media.powerEfficient}`,
      `permissions: ${permissions.join(", ")}`,
      `connection.type=${connection?.type ?? "missing"}`,
      `highlightsFromPoint=${typeof windowWithExperiments.CSS?.highlightsFromPoint}`,
    ].join("\n"),
  );
});

document.querySelector("#run-highlight")?.addEventListener("click", () => {
  const fixture = document.querySelector("#highlight-fixture");
  if (!fixture || !windowWithExperiments.CSS?.highlights) {
    report("Custom Highlight is unavailable.");
    return;
  }
  const text = fixture.firstChild;
  if (!text) {
    report("Highlight fixture has no text node.");
    return;
  }
  const first = new Range();
  first.setStart(text, 0);
  first.setEnd(text, 5);
  const second = new Range();
  second.setStart(text, 6);
  second.setEnd(text, 11);
  windowWithExperiments.CSS.highlights.set("poc-first", new Highlight(first));
  windowWithExperiments.CSS.highlights.set("poc-second", new Highlight(second));
  report(
    "Two independent Range objects are registered; move the selection to confirm they remain visible.",
  );
});

document.querySelector("#run-details")?.addEventListener("click", () => {
  const details = [
    ...document.querySelectorAll<HTMLDetailsElement>(
      'details[name="poc-details"]',
    ),
  ];
  if (details.length !== 2) {
    report("details fixture is incomplete.");
    return;
  }
  const [first, second] = details;
  if (!first || !second) {
    report("details fixture is incomplete.");
    return;
  }
  first.open = true;
  second.open = true;
  report(
    `Native details states after opening both: ${details.map((item) => item.open).join(", ")}`,
  );
});

const pocDetails = [
  ...document.querySelectorAll<HTMLDetailsElement>(
    'details[name="poc-details"]',
  ),
];
for (const detail of pocDetails) {
  detail.addEventListener("toggle", () => {
    const states = pocDetails.map((entry) => String(entry.open)).join(", ");
    setStatus("#details-status", `native toggle: open=${states}`);
  });
}

const dismissDialog = document.querySelector<HTMLDialogElement>(
  "#poc-dismiss-dialog",
);
dismissDialog?.addEventListener("cancel", () => {
  setStatus("#dialog-status", "native cancel event (Esc / platform dismiss)");
});
dismissDialog?.addEventListener("close", () => {
  setStatus(
    "#dialog-status",
    `native close event: returnValue=${dismissDialog.returnValue || "empty"}`,
  );
});
document
  .querySelector("#open-dismiss-dialog")
  ?.addEventListener("click", () => {
    if (!dismissDialog) {
      setStatus("#dialog-status", "HTMLDialogElement is unavailable.");
      return;
    }
    dismissDialog.returnValue = "";
    dismissDialog.showModal();
    setStatus(
      "#dialog-status",
      "dialog opened; returnValue reset. Use ×, Esc, or outside click.",
    );
  });

let navigationEvents: string[] = [];
function reportNavigation(message: string): void {
  navigationEvents = [...navigationEvents.slice(-9), message];
  setStatus("#navigation-status", navigationEvents.join("\n"));
}

function observeNavigationEntry(): void {
  const navigation = windowWithExperiments.navigation;
  navigation?.currentEntry?.addEventListener(
    "dispose",
    () => reportNavigation("current entry received dispose"),
    { once: true },
  );
}

const nativeNavigation = windowWithExperiments.navigation;
nativeNavigation?.addEventListener("navigate", () => {
  reportNavigation("native navigate event");
});
nativeNavigation?.addEventListener("currententrychange", () => {
  observeNavigationEntry();
  reportNavigation(
    `currententrychange; canGoForward=${String(nativeNavigation.canGoForward)}`,
  );
});
observeNavigationEntry();

document.querySelector("#run-navigation")?.addEventListener("click", () => {
  const navigation = windowWithExperiments.navigation;
  report(
    navigation
      ? `Navigation API is present; canGoForward=${String(navigation.canGoForward)}.`
      : "Navigation API is unavailable.",
  );
});

for (const button of document.querySelectorAll<HTMLButtonElement>(
  "[data-navigation-entry]",
)) {
  button.addEventListener("click", () => {
    const entry = button.dataset.navigationEntry;
    const navigation = windowWithExperiments.navigation;
    if (!entry || !navigation?.navigate) {
      reportNavigation("Navigation API is unavailable.");
      return;
    }
    navigation.navigate(`#poc-navigation-${entry}`, { history: "push" });
  });
}

let speechRun = 0;
document.querySelector("#run-speech")?.addEventListener("click", () => {
  if (
    !("speechSynthesis" in window) ||
    !("SpeechSynthesisUtterance" in window)
  ) {
    setStatus("#speech-status", "SpeechSynthesis is unavailable.");
    return;
  }
  window.speechSynthesis.cancel();
  const run = speechRun + 1;
  speechRun = run;
  const symbols = ["a", "s", "p", "u", "w", "i", "q"];
  let completed = 0;
  setStatus(
    "#speech-status",
    `run=${run}: ${symbols.length} utterances queued.`,
  );
  for (const symbol of symbols) {
    const utterance = new SpeechSynthesisUtterance(symbol);
    utterance.lang = "en-US";
    utterance.rate = 0.7;
    utterance.onend = () => {
      if (run !== speechRun) return;
      completed += 1;
      setStatus(
        "#speech-status",
        `run=${run}: completed ${completed}/${symbols.length}.`,
      );
    };
    utterance.onerror = () => {
      if (run === speechRun) {
        setStatus("#speech-status", `run=${run}: speech error.`);
      }
    };
    window.speechSynthesis.speak(utterance);
  }
});

document.querySelector("#stop-speech")?.addEventListener("click", () => {
  speechRun += 1;
  window.speechSynthesis?.cancel();
  setStatus(
    "#speech-status",
    "speech queue cancelled by explicit page action.",
  );
});

const permissionNames = [
  "geolocation",
  "notifications",
  "camera",
  "microphone",
] as const;

async function readPermissionStates(): Promise<string> {
  const states = await Promise.all(
    permissionNames.map(async (name) => {
      try {
        const status = await navigator.permissions.query({
          name,
        } as PermissionDescriptor);
        return `${name}=${status.state}`;
      } catch (error) {
        return `${name}=${error instanceof Error ? error.name : "error"}`;
      }
    }),
  );
  return states.join(", ");
}

document
  .querySelector("#run-permissions")
  ?.addEventListener("click", async () => {
    setStatus("#permissions-status", await readPermissionStates());
  });

async function requestAndStop(kind: "camera" | "microphone"): Promise<void> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: kind === "camera",
      audio: kind === "microphone",
    });
    const tracks = stream.getTracks();
    for (const track of tracks) track.stop();
    setStatus(
      "#permissions-status",
      `${kind}: acquired ${tracks.length} track(s), stopped immediately. ${await readPermissionStates()}`,
    );
  } catch (error) {
    const name = error instanceof Error ? error.name : "error";
    setStatus(
      "#permissions-status",
      `${kind}: ${name}. ${await readPermissionStates()}`,
    );
  }
}

document.querySelector("#request-camera")?.addEventListener("click", () => {
  void requestAndStop("camera");
});
document.querySelector("#request-microphone")?.addEventListener("click", () => {
  void requestAndStop("microphone");
});

let pressureObserver: PassivePressureObserver | undefined;
document
  .querySelector("#start-pressure")
  ?.addEventListener("click", async () => {
    const Observer = windowWithExperiments.PressureObserver as
      | PassivePressureObserverConstructor
      | undefined;
    if (!Observer) {
      setStatus(
        "#pressure-status",
        "PressureObserver is unavailable in this browser.",
      );
      return;
    }
    pressureObserver?.disconnect();
    const records: string[] = [];
    pressureObserver = new Observer((updates) => {
      for (const update of updates) {
        records.push(`${update.source}=${update.state}`);
      }
      setStatus(
        "#pressure-status",
        `passive records: ${records.slice(-4).join(", ")}. No game load was generated.`,
      );
    });
    try {
      await pressureObserver.observe("cpu");
      setStatus(
        "#pressure-status",
        "observing CPU passively; awaiting real records.",
      );
    } catch (error) {
      const name = error instanceof Error ? error.name : "error";
      pressureObserver.disconnect();
      pressureObserver = undefined;
      setStatus("#pressure-status", `PressureObserver.observe: ${name}.`);
    }
  });
document.querySelector("#stop-pressure")?.addEventListener("click", () => {
  pressureObserver?.disconnect();
  pressureObserver = undefined;
  setStatus(
    "#pressure-status",
    "observer disconnected; no records are retained.",
  );
});

const mazeRows = ["#######", "#S#...#", "#.#.#.#", "#...#E#", "#######"];
let mazePosition = { row: 1, column: 1 };

function renderMaze(): void {
  const board = mazeRows.map((row) => [...row]);
  const playerRow = board[mazePosition.row];
  if (playerRow) playerRow[mazePosition.column] = "@";
  console.info(
    `Busybox POC-016 maze\n${board.map((row) => row.join("")).join("\n")}`,
  );
}

function moveMaze(rowOffset: number, columnOffset: number): void {
  const nextRow = mazePosition.row + rowOffset;
  const nextColumn = mazePosition.column + columnOffset;
  const target = mazeRows[nextRow]?.[nextColumn];
  if (target && target !== "#")
    mazePosition = { row: nextRow, column: nextColumn };
  renderMaze();
  const completed = mazeRows[mazePosition.row]?.[mazePosition.column] === "E";
  setStatus(
    "#maze-status",
    completed
      ? "出口に到達。ConsoleのASCII盤面で確認できる。"
      : "移動をConsoleへ再表示した。page側のbuttonだけで操作できる。",
  );
}

for (const [selector, rowOffset, columnOffset] of [
  ["#maze-north", -1, 0],
  ["#maze-west", 0, -1],
  ["#maze-south", 1, 0],
  ["#maze-east", 0, 1],
] as const) {
  document
    .querySelector(selector)
    ?.addEventListener("click", () => moveMaze(rowOffset, columnOffset));
}
document.querySelector("#reset-maze")?.addEventListener("click", () => {
  mazePosition = { row: 1, column: 1 };
  renderMaze();
  setStatus("#maze-status", "迷路を開始位置へ戻してConsoleへ再表示した。");
});
renderMaze();

const nativeControlsVideo = document.querySelector<HTMLVideoElement>(
  "#poc-native-controls",
);
let nativePlayStart: number | undefined;
if (nativeControlsVideo) {
  nativeControlsVideo.addEventListener("seeking", () => {
    setCheck("#poc-native-seek", "passed", "B01 seek: seeking eventを受信");
  });
  nativeControlsVideo.addEventListener("volumechange", () => {
    if (nativeControlsVideo.muted) {
      setCheck(
        "#poc-native-mute",
        "passed",
        "B02 mute: muted=trueのvolumechangeを受信",
      );
    }
  });
  nativeControlsVideo.addEventListener("playing", () => {
    nativePlayStart = nativeControlsVideo.currentTime;
  });
  nativeControlsVideo.addEventListener("pause", () => {
    if (
      nativePlayStart !== undefined &&
      nativeControlsVideo.currentTime > nativePlayStart + 0.1
    ) {
      setCheck(
        "#poc-native-play-pause",
        "passed",
        "B03 play → time advances → pauseを受信",
      );
    }
    nativePlayStart = undefined;
  });
}

const pipVideo = document.querySelector<HTMLVideoElement>("#poc-pip-video");
let pipEntry: "native" | "page" | undefined;
if (!pipVideo || !("requestPictureInPicture" in HTMLVideoElement.prototype)) {
  setCheck(
    "#poc-pip-native",
    "unavailable",
    "native player PiP: このbrowserでは未提供",
  );
  setCheck(
    "#poc-pip-page",
    "unavailable",
    "page API PiP: このbrowserでは未提供",
  );
} else {
  pipVideo.addEventListener("enterpictureinpicture", () => {
    const selector = pipEntry === "page" ? "#poc-pip-page" : "#poc-pip-native";
    const label = pipEntry === "page" ? "page API" : "native player";
    setCheck(selector, "passed", `${label} PiP: enterpictureinpictureを受信`);
  });
  pipVideo.addEventListener("leavepictureinpicture", () => {
    setCheck(
      "#poc-pip-leave",
      "passed",
      "PiP終了: leavepictureinpictureを受信",
    );
    pipEntry = undefined;
  });
}

document.querySelector("#run-page-pip")?.addEventListener("click", async () => {
  if (!pipVideo || !("requestPictureInPicture" in pipVideo)) {
    setCheck(
      "#poc-pip-page",
      "unavailable",
      "page API PiP: このbrowserでは未提供",
    );
    return;
  }
  try {
    pipEntry = "page";
    await pipVideo.requestPictureInPicture();
  } catch (error) {
    const name = error instanceof DOMException ? error.name : "error";
    setCheck("#poc-pip-page", "unavailable", `page API PiP: ${name}`);
    pipEntry = undefined;
  }
});

const mediaSessionLog = document.querySelector<HTMLOutputElement>(
  "#poc-media-session-log",
);
const mediaSessionActionNames = [
  "play",
  "pause",
  "seekbackward",
  "seekforward",
  "seekto",
  "previoustrack",
  "nexttrack",
] as const satisfies readonly MediaSessionAction[];
let mediaSessionEvents: string[] = [];

function reportMediaSession(message: string): void {
  mediaSessionEvents = [...mediaSessionEvents.slice(-11), message];
  if (mediaSessionLog) mediaSessionLog.value = mediaSessionEvents.join("\n");
}

function clearMediaSession(): void {
  if (!("mediaSession" in navigator)) return;
  for (const action of mediaSessionActionNames) {
    try {
      navigator.mediaSession.setActionHandler(action, null);
    } catch {
      // Browser may not implement this action.
    }
  }
  navigator.mediaSession.metadata = null;
  navigator.mediaSession.playbackState = "none";
}

function adjustMediaSessionTime(
  action: MediaSessionAction,
  details: MediaSessionActionDetails,
): void {
  if (!mediaSessionAudio || !Number.isFinite(mediaSessionAudio.duration))
    return;
  const offset = details.seekOffset ?? 5;
  const target =
    action === "seekto"
      ? (details.seekTime ?? mediaSessionAudio.currentTime)
      : action === "seekbackward"
        ? mediaSessionAudio.currentTime - offset
        : mediaSessionAudio.currentTime + offset;
  mediaSessionAudio.currentTime = Math.min(
    mediaSessionAudio.duration,
    Math.max(0, target),
  );
}

function handleMediaSessionAction(
  action: MediaSessionAction,
  details: MediaSessionActionDetails,
): void {
  reportMediaSession(`received action=${action}`);
  if (!mediaSessionAudio) return;
  if (action === "pause") {
    mediaSessionAudio.pause();
    navigator.mediaSession.playbackState = "paused";
    setCheck(
      "#poc-media-session-pause",
      "passed",
      "B01 external pause action: Media Session handlerを受信",
    );
    return;
  }
  if (action === "play") {
    void mediaSessionAudio.play();
    navigator.mediaSession.playbackState = "playing";
    return;
  }
  if (
    action === "seekbackward" ||
    action === "seekforward" ||
    action === "seekto"
  ) {
    adjustMediaSessionTime(action, details);
  }
}

document
  .querySelector("#start-media-session")
  ?.addEventListener("click", async () => {
    if (!mediaSessionAudio || !("mediaSession" in navigator)) {
      setCheck(
        "#poc-media-session-ready",
        "unavailable",
        "Media Session: このbrowserでは未提供",
      );
      return;
    }
    clearMediaSession();
    mediaSessionEvents = [];
    mediaSessionAudio.currentTime = 0;
    mediaSessionAudio.volume = 0.035;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: "Busybox PoC external control",
      artist: "POC-031",
    });
    for (const action of mediaSessionActionNames) {
      try {
        navigator.mediaSession.setActionHandler(action, (details) =>
          handleMediaSessionAction(action, details),
        );
        reportMediaSession(`registered action=${action}`);
      } catch {
        reportMediaSession(`unavailable action=${action}`);
      }
    }
    try {
      await mediaSessionAudio.play();
      navigator.mediaSession.playbackState = "playing";
      setCheck(
        "#poc-media-session-ready",
        "passed",
        "Media Session: 再生中。page外の操作を待機中",
      );
    } catch (error) {
      const name = error instanceof DOMException ? error.name : "error";
      setCheck(
        "#poc-media-session-ready",
        "unavailable",
        `Media Session: ${name}`,
      );
    }
  });

document.querySelector("#stop-media-session")?.addEventListener("click", () => {
  clearMediaSession();
  mediaSessionAudio?.pause();
  setCheck(
    "#poc-media-session-ready",
    "waiting",
    "Media Session: page内の安全停止で初期化済み",
  );
  reportMediaSession("page safety stop (not an external action)");
});

document.querySelector("#run-decoder")?.addEventListener("click", () => {
  const decoded = new TextDecoder("utf-8", { fatal: true }).decode(
    new Uint8Array([0x42, 0x55, 0x53, 0x59]),
  );
  report(`TextDecoder fatal UTF-8 result: ${decoded}`);
});

document.querySelector("#run-encoding")?.addEventListener("click", () => {
  const solutions = solveEncodingFixtures();
  const ambiguous = encodingFixturePositions
    .filter((position) => validLabelsForPosition(position).length > 1)
    .map((position) => position.id);
  report(
    `S-640: ${encodingFixtures.length} questions, ${encodingFixturePositions.length} ordered label positions, ${solutions.length} global solution, local ambiguity resolved by one-use rule: ${ambiguous.join(", ") || "none"}.`,
  );
});

document.querySelector("#run-unicode")?.addEventListener("click", async () => {
  const expressions = [
    ...document.querySelectorAll<HTMLElement>(".unicode-expression"),
  ];
  await Promise.all(
    expressions.map((element) =>
      document.fonts.load('2rem "Busybox Unifont"', element.textContent ?? ""),
    ),
  );

  const selection = window.getSelection();
  const mismatches: string[] = [];
  for (const element of expressions) {
    const range = document.createRange();
    range.selectNodeContents(element);
    selection?.removeAllRanges();
    selection?.addRange(range);
    const selectedGlyphs = selection?.toString().replace(/\s/gu, "");
    const expectedGlyphs = element.dataset.expectedCopy?.replace(/\s/gu, "");
    if (selectedGlyphs !== expectedGlyphs) {
      mismatches.push(element.id);
    }
  }
  selection?.removeAllRanges();

  const fontLoaded = document.fonts.check('2rem "Busybox Unifont"');
  report(
    `S-620: ${expressions.length} expressions, fontLoaded=${fontLoaded}, selection/copy glyph mismatches=${mismatches.join(", ") || "none"}.`,
  );
});

document.querySelector("#run-webcodecs")?.addEventListener("click", () => {
  report(
    `VideoEncoder=${"VideoEncoder" in windowWithExperiments}; MediaStreamTrackProcessor=${"MediaStreamTrackProcessor" in windowWithExperiments}`,
  );
});

document
  .querySelector("#run-insertable-stream")
  ?.addEventListener("click", async () => {
    const Processor = windowWithExperiments.MediaStreamTrackProcessor as
      | VideoTrackProcessorConstructor
      | undefined;
    const video = document.querySelector<CapturableVideo>("#recovery-alpha-t1");
    if (!Processor || !video?.captureStream) {
      setStatus(
        "#insertable-stream-status",
        "TrackProcessor or captureStream is unavailable; no fallback path is used.",
      );
      return;
    }
    let stream: MediaStream | undefined;
    let reader: ReadableStreamDefaultReader<VideoFrame> | undefined;
    try {
      video.currentTime = 0;
      await video.play();
      stream = video.captureStream();
      const track = stream.getVideoTracks()[0];
      if (!track) throw new Error("captureStream has no video track");
      const processor = new Processor({ track, maxBufferSize: 2 });
      reader = processor.readable.getReader();
      const frames: string[] = [];
      for (let index = 0; index < 2; index += 1) {
        const result = await reader.read();
        if (result.done) break;
        frames.push(
          `${result.value.displayWidth}x${result.value.displayHeight}`,
        );
        result.value.close();
      }
      setStatus(
        "#insertable-stream-status",
        `read ${frames.length} frame(s) (${frames.join(", ")}); maxBufferSize=2.`,
      );
    } catch (error) {
      const name = error instanceof Error ? error.name : "error";
      setStatus("#insertable-stream-status", `Insertable Streams: ${name}.`);
    } finally {
      await reader?.cancel();
      reader?.releaseLock();
      for (const track of stream?.getTracks() ?? []) track.stop();
      video.pause();
    }
  });

async function videoMetadata(selector: string): Promise<string> {
  const video = document.querySelector<HTMLVideoElement>(selector);
  if (!video) throw new Error(`Missing ${selector}.`);
  if (video.readyState < HTMLMediaElement.HAVE_METADATA) {
    await new Promise<void>((resolveLoaded, rejectLoaded) => {
      video.addEventListener("loadedmetadata", () => resolveLoaded(), {
        once: true,
      });
      video.addEventListener(
        "error",
        () => rejectLoaded(new Error("media error")),
        {
          once: true,
        },
      );
      video.load();
    });
  }
  return `${video.videoWidth}x${video.videoHeight}/${video.duration.toFixed(1)}s`;
}

document
  .querySelector("#run-video-recovery")
  ?.addEventListener("click", async () => {
    try {
      const metadata = await Promise.all([
        videoMetadata("#recovery-source-t1"),
        videoMetadata("#recovery-source-t2"),
        videoMetadata("#recovery-source-t3-alpha"),
        videoMetadata("#recovery-alpha-t1"),
        videoMetadata("#recovery-beta-t3"),
      ]);
      const dimensionsMatch = metadata.every(
        (value) => value === "360x360/2.0s",
      );
      setStatus(
        "#video-recovery-status",
        `video=${metadata.join(", ")} / 360×360・2.0秒一致=${dimensionsMatch}`,
      );
    } catch (error) {
      setStatus(
        "#video-recovery-status",
        error instanceof Error
          ? error.message
          : "video recovery verification failed",
      );
    }
  });

const recoveryFrameCount = 24;

function recoveryCanvasContext(
  selector: string,
): CanvasRenderingContext2D | undefined {
  const canvas = document.querySelector<HTMLCanvasElement>(selector);
  return canvas?.getContext("2d", { willReadFrequently: true }) ?? undefined;
}

function binaryImage(image: ImageData): ImageData {
  const binary = new ImageData(image.width, image.height);
  for (let index = 0; index < image.data.length; index += 4) {
    const isBlack =
      (image.data[index] ?? 255) < 128 ||
      (image.data[index + 1] ?? 255) < 128 ||
      (image.data[index + 2] ?? 255) < 128;
    const value = isBlack ? 0 : 255;
    binary.data[index] = value;
    binary.data[index + 1] = value;
    binary.data[index + 2] = value;
    binary.data[index + 3] = 255;
  }
  return binary;
}

function transformT1(frame: ImageData): ImageData {
  const result = new ImageData(frame.width, frame.height);
  const halfWidth = frame.width / 2;
  for (let row = 0; row < frame.height; row += 1) {
    for (let column = 0; column < frame.width; column += 1) {
      const sourceColumn =
        column < halfWidth ? column + halfWidth : column - halfWidth;
      const sourceIndex = (row * frame.width + sourceColumn) * 4;
      const targetIndex = (row * frame.width + column) * 4;
      result.data[targetIndex] = frame.data[sourceIndex] ?? 255;
      result.data[targetIndex + 1] = frame.data[sourceIndex + 1] ?? 255;
      result.data[targetIndex + 2] = frame.data[sourceIndex + 2] ?? 255;
      result.data[targetIndex + 3] = 255;
    }
  }
  return result;
}

function transformT3(frames: readonly ImageData[]): ImageData[] {
  return frames.map((frame, frameIndex) => {
    const result = new ImageData(frame.width, frame.height);
    const keepLeftHalf = frameIndex % 2 === 0;
    const halfWidth = frame.width / 2;
    for (let row = 0; row < frame.height; row += 1) {
      for (let column = 0; column < frame.width; column += 1) {
        const targetIndex = (row * frame.width + column) * 4;
        const keep = keepLeftHalf ? column < halfWidth : column >= halfWidth;
        const value = keep ? (frame.data[targetIndex] ?? 255) : 255;
        result.data[targetIndex] = value;
        result.data[targetIndex + 1] = value;
        result.data[targetIndex + 2] = value;
        result.data[targetIndex + 3] = 255;
      }
    }
    return result;
  });
}

function transformT2(frames: readonly ImageData[]): ImageData {
  const first = frames[0];
  if (!first) throw new Error("T2 needs at least one frame.");
  const result = new ImageData(first.width, first.height);
  for (let index = 0; index < result.data.length; index += 4) {
    const black = frames.some(
      (frame) =>
        frame.data[index] === 0 ||
        frame.data[index + 1] === 0 ||
        frame.data[index + 2] === 0,
    );
    const value = black ? 0 : 255;
    result.data[index] = value;
    result.data[index + 1] = value;
    result.data[index + 2] = value;
    result.data[index + 3] = 255;
  }
  return result;
}

async function readRecoveryFrames(
  video: HTMLVideoElement,
): Promise<ImageData[]> {
  if (video.readyState < HTMLMediaElement.HAVE_METADATA) {
    await new Promise<void>((resolveLoaded, rejectLoaded) => {
      video.addEventListener("loadedmetadata", () => resolveLoaded(), {
        once: true,
      });
      video.addEventListener(
        "error",
        () => rejectLoaded(new Error("media error")),
        {
          once: true,
        },
      );
      video.load();
    });
  }
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("2d canvas is unavailable");
  const frames: ImageData[] = [];
  video.pause();
  for (let frameIndex = 0; frameIndex < recoveryFrameCount; frameIndex += 1) {
    const timestamp = (frameIndex + 0.5) / 12;
    await new Promise<void>((resolveSeeked, rejectSeeked) => {
      video.addEventListener("seeked", () => resolveSeeked(), { once: true });
      video.addEventListener(
        "error",
        () => rejectSeeked(new Error("video seek error")),
        { once: true },
      );
      video.currentTime = timestamp;
    });
    context.drawImage(video, 0, 0);
    frames.push(
      binaryImage(context.getImageData(0, 0, canvas.width, canvas.height)),
    );
  }
  return frames;
}

async function readRecoveryExpectedFrame(
  video: HTMLVideoElement,
): Promise<ImageData> {
  const frames = await readRecoveryFrames(video);
  const first = frames[0];
  if (!first) throw new Error("expected video has no frame");
  return first;
}

function differingPixels(left: ImageData, right: ImageData): number {
  if (left.width !== right.width || left.height !== right.height) return -1;
  let mismatches = 0;
  for (let index = 0; index < left.data.length; index += 4) {
    if (left.data[index] !== right.data[index]) mismatches += 1;
  }
  return mismatches;
}

async function runRecoveryRoute(route: string): Promise<void> {
  const sourceSelector =
    route === "t1"
      ? "#recovery-source-t1"
      : route === "t2"
        ? "#recovery-source-t2"
        : route === "alpha"
          ? "#recovery-source-t3-alpha"
          : "#recovery-source-t3-beta";
  const expectedSelector =
    route === "beta" ? "#recovery-beta-t3" : "#recovery-alpha-t1";
  const source = document.querySelector<HTMLVideoElement>(sourceSelector);
  const expected = document.querySelector<HTMLVideoElement>(expectedSelector);
  const outputContext = recoveryCanvasContext("#video-recovery-canvas");
  if (!source || !expected || !outputContext) {
    setStatus(
      "#video-recovery-runtime-status",
      "recovery fixture is incomplete.",
    );
    return;
  }
  try {
    const frames = await readRecoveryFrames(source);
    const firstFrame = frames[0];
    if (!firstFrame) throw new Error("input video has no frame");
    const output =
      route === "t1"
        ? transformT1(firstFrame)
        : route === "t2"
          ? transformT2(frames)
          : route === "alpha"
            ? transformT2(transformT3(frames))
            : transformT1(transformT2(transformT3(frames.map(transformT1))));
    const expectedFrame = await readRecoveryExpectedFrame(expected);
    const mismatchCount = differingPixels(output, expectedFrame);
    outputContext.putImageData(output, 0, 0);
    setStatus(
      "#video-recovery-runtime-status",
      `route=${route}, inputFrames=${frames.length}, output=360×360, binary mismatches=${mismatchCount}.`,
    );
  } catch (error) {
    const name = error instanceof Error ? error.message : "error";
    setStatus(
      "#video-recovery-runtime-status",
      `recovery route failed: ${name}`,
    );
  }
}

for (const button of document.querySelectorAll<HTMLButtonElement>(
  "[data-video-recovery-route]",
)) {
  button.addEventListener("click", () => {
    const route = button.dataset.videoRecoveryRoute;
    if (route) void runRecoveryRoute(route);
  });
}

document.querySelector("#run-invoker")?.addEventListener("click", () => {
  const dialog = document.querySelector<HTMLDialogElement>("#poc-dialog");
  if (!dialog) {
    report("Dialog fixture is unavailable.");
    return;
  }
  dialog.showModal();
  setStatus(
    "#invoker-status",
    "dialogを開いた。内側の「閉じる」を押すとnative commandを記録する。",
  );
  report(
    `Dialog opened through the native API; command attribute supported=${"command" in HTMLButtonElement.prototype}.`,
  );
});

const invokerDialog = document.querySelector<HTMLDialogElement>("#poc-dialog");
invokerDialog?.addEventListener("command", (event) => {
  const commandEvent = event as Event & {
    command?: string;
    source?: EventTarget | null;
  };
  setStatus(
    "#invoker-status",
    `native CommandEvent: command=${commandEvent.command ?? "unknown"}, source=${commandEvent.source instanceof HTMLButtonElement ? "button" : "unknown"}.`,
  );
});
invokerDialog?.addEventListener("close", () => {
  const status = document.querySelector<HTMLOutputElement>("#invoker-status");
  if (status?.value.startsWith("dialogを開いた")) {
    setStatus(
      "#invoker-status",
      "dialogが閉じた。CommandEvent非公開のbrowserでは属性経路だけを確認する。",
    );
  }
});
