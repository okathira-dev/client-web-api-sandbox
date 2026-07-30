import type { TranslationResource } from "../types";

const translation: TranslationResource = {
  app: {
    title: "Encoder capability inspection",
    description:
      "Runs every listed codec string / Profile / Level through a real encode, decode, and mux to confirm it is actually usable. A setting that only passes `isConfigSupported` is not treated as available. Results are specific to this environment (browser, OS, GPU, and driver combination) and do not guarantee success under every recording condition.",
    language: "Language",
    languageJa: "日本語",
    languageEn: "English",
  },
  runner: {
    start: "Start full inspection",
    rerun: "Rerun everything",
    resume: "Resume ({{count}} left)",
    cancelFull: "Cancel inspection",
    cancelSustained: "Cancel sustained test",
    reset: "Discard results",
    pauseLabel: "Pause between candidates (ms)",
    pauseInvalid: "Enter an integer from 0 to {{max}}",
    pauseHelp: "Default {{default}} ms. At 0 no pause is performed at all.",
    completed:
      "Full inspection finished. These results show what reached real output once in this environment.",
    cancelled:
      "Inspection was interrupted. Partial results are not treated as a conclusion about this environment; the last fully completed report stays in effect.",
    failed: "Inspection stopped before completing: {{reason}}",
    unknownReason: "unknown reason",
  },
  runStatus: {
    notStarted: "Not started",
    running: "Running",
    complete: "Complete",
    cancelled: "Interrupted",
    failed: "Failed",
  },
  progress: {
    unitCount: "{{completed}} / {{total}} candidates",
    elapsed: "Elapsed {{value}}",
    eta: "ETA {{value}}",
    pass: "Pass {{count}}",
    warning: "Warning {{count}}",
    fail: "Fail {{count}}",
    pause: "Candidate pause {{value}} ms",
    familyHeading: "Codec families",
    familyUntested: "{{family}}: untested",
    familyRatio: "{{family}}: {{usable}} / {{total}}",
    familyNote:
      "The denominator counts codec strings excluding experimental ones (10-bit, Level 6.x, and similar). Only fully completed inspections are counted.",
    environment: "Environment",
    cores: "{{count}} logical cores",
    stage: {
      declared: "Checking whether the config is accepted",
      output: "Encoding",
      decode: "Verifying decode",
      mux: "Muxing",
      complete: "Done",
    },
    idle: {
      idle: "Start a full inspection to see per-candidate results here",
      waiting: "Waiting for the next candidate",
      complete: "All candidates have been processed",
      cancelled:
        "Inspection was interrupted. Resuming continues from the remaining candidates.",
      failed: "Inspection stopped before completing",
    },
  },
  sustained: {
    heading: "Sustained test",
    description:
      "Re-runs the selected exact settings through real output, decode, and mux for the chosen duration. It reveals sustained performance that a single short burst cannot show. Live input opens the browser's screen sharing dialog but never creates a recording file.",
    captureFailed: "Could not acquire the screen capture: {{reason}}",
    audioNotSupported:
      "Live input supplies video frames only, so audio candidates are out of scope. Deselect the audio candidates or switch the input to the synthetic pattern.",
    inputLabel: "Input",
    inputSynthetic: "Synthetic pattern (reproducible)",
    inputLive: "Screen or tab capture",
    durationLabel: "Duration (seconds)",
    durationInvalid: "{{min}}–{{max}} seconds",
    run: "Run sustained test on {{count}} selected",
    selectPassedVideo: "Select passing video settings",
    clearSelection: "Clear selection",
    statusChip: "Sustained test {{status}}",
    statusDetail: "{{completed}} / {{total}} · {{seconds}} s · {{input}}",
    sourceLine: "Input: {{width}}×{{height}} @ {{fps}} fps",
  },
  table: {
    summary: "Showing {{shown}} of {{total}}",
    selectedSuffix: " · {{count}} selected",
    empty: "No results yet. Start a full inspection.",
    noMatch: "No results match these filters.",
    label: "Inspection results",
    selectAll: "Select all visible candidates",
    selectOne: "Include {{codec}} in the sustained test",
    columnFamily: "Family",
    columnCodec: "Codec string",
    columnVariant: "Preference / ch",
    columnStatus: "Result",
    columnDetails: "Details",
    columnBudget: "Frame budget",
    columnTime: "Duration",
    filterAll: "All",
    filterCodecPlaceholder: "avc1.64…",
    filterDetailsPlaceholder: "Filter by error or warning",
    budgetSustained: "Sustained measured",
    budgetOver: "Over 100%",
    timeQuick: "Under 1 s",
    timeSlow: "1 s or more",
    statusPass: "Pass",
    statusWarning: "Pass / warn",
    statusFail: "Fail",
    declaredButFailed: "Config accepted but failed at {{stage}}",
    basicBudget: "Basic: {{value}}",
    sustainedBudget: "Sustained {{status}}: {{value}}",
    sourceLine:
      "Input {{width}}×{{height}} @ {{fps}} fps · missing {{missing}}",
  },
  family: {
    h264: "H.264 / AVC",
    h265: "H.265 / HEVC",
    vp9: "VP9",
    av1: "AV1",
    vp8: "VP8",
    aac: "AAC",
    opus: "Opus",
  },
  codes: {
    "isConfigSupported-false": "This configuration was rejected up front",
    "encoder-no-output": "The encoder produced no output",
    "video-decoder-unavailable": "VideoDecoder is unavailable",
    "video-decoder-unsupported":
      "No decoder configuration can read this output",
    "video-decoder-no-output": "The decoder returned no frames",
    "audio-decoder-unavailable": "AudioDecoder is unavailable",
    "audio-decoder-unsupported":
      "No decoder configuration can read this output",
    "audio-decoder-no-output": "The decoder returned no samples",
    "mux-output-too-small": "The muxed output is too small",
    "webcodecs-video-unavailable":
      "The WebCodecs video API is unavailable in this environment",
    "webcodecs-audio-unavailable":
      "The WebCodecs audio API is unavailable in this environment",
    "offscreen-canvas-2d-unavailable":
      "Could not get a 2D context from OffscreenCanvas",
    "throughput-below-75-percent":
      "Effective FPS fell below 75% of what was requested",
    "live-capture-ended": "Live input ended partway through",
    "live-capture-unavailable": "Live input could not be acquired",
    "live-capture-video-track-unavailable":
      "The capture contains no video track",
    "live-sustained-inspection-is-video-only":
      "Sustained tests with live input cover video candidates only",
    "media-stream-track-processor-unavailable":
      "MediaStreamTrackProcessor is unavailable",
    "display-capture-unavailable": "The screen capture API is unavailable",
    "capability-report-not-found": "Complete a full inspection first",
    "no-units-selected": "Nothing is selected",
    "inspection-already-running":
      "An inspection is already running in another tab or window",
    "indexeddb-open-failed": "Could not open the storage",
    "indexeddb-request-failed": "Reading from or writing to storage failed",
    "indexeddb-transaction-aborted": "The storage operation was aborted",
  },
};

export default translation;
