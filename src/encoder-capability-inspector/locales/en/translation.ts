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
    start: "Start full capability inspection",
    rerun: "Rerun everything",
    resume: "Resume ({{count}} left)",
    cancelFull: "Pause inspection",
    cancelHint:
      "This only pauses. Results so far are kept and the remaining candidates can be resumed later.",
    cancelSustained: "Stop sustained load test",
    reset: "Discard results",
    export: "Save results as JSON",
    exportHint:
      "Writes out every result plus a summary of this environment (browser, OS, GPU). Screen contents and audio samples are never included. Keep the environment details in mind before sharing the file.",
    pauseLabel: "Pause between candidates (ms)",
    pauseInvalid: "Enter an integer from 0 to {{max}}",
    pauseHelp: "Default {{default}} ms. At 0 no pause is performed at all.",
    completed:
      "The full capability inspection finished. These results show what reached real output once in this environment.",
    cancelled:
      'The inspection is paused. Results so far are kept, and "Resume" continues from the remaining candidates. Partial results are not treated as a conclusion about this environment; the last fully completed report stays in effect.',
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
      "Video is counted per codec string; audio is counted per setting including bitrate and channel count, because AAC keeps the same codec string across settings. Only fully completed inspections are counted.",
    familyIncludeExperimental: "Include experimental configurations",
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
      idle: "Start a full capability inspection to see per-candidate results here",
      waiting: "Waiting for the next candidate",
      complete: "All candidates have been processed",
      cancelled:
        "The inspection is paused. Resuming continues from the remaining candidates.",
      failed: "Inspection stopped before completing",
    },
  },
  sustained: {
    heading: "Sustained load test",
    description:
      "Re-runs the selected exact settings through real output, decode, and mux for the chosen duration. It reveals sustained performance that a single short burst cannot show. Live input opens the browser's screen sharing dialog but never creates a recording file.",
    captureFailed: "Could not acquire the screen capture: {{reason}}",
    liveAudioNote:
      "To inspect audio candidates with live input, enable audio sharing in the share dialog. Audio candidates cannot be inspected when no audio track is shared.",
    liveAudioMono:
      "The captured audio was 1ch. Two-channel candidates are padded by duplicating that channel, which does not confirm that 2ch is really handled. Check whether the shared source is stereo.",
    audioSourceLine: "Audio {{channels}}ch @ {{sampleRate}} Hz",
    audioSourceNone: "no audio shared",
    inputLabel: "Input",
    inputSynthetic: "Synthetic pattern (reproducible)",
    inputLive: "Screen or tab capture",
    durationLabel: "Duration (seconds)",
    durationInvalid: "{{min}} seconds or more",
    durationHelp: "No upper limit. A long run can be interrupted at any time.",
    memoryCaution:
      "The inspection holds one candidate's whole output until it finishes, so these settings need up to about {{size}} of memory. You can interrupt at any time, but running out can take the tab down with it.",
    run: "Run the sustained load test on {{count}} selected",
    selectPassedVideo: "Select passing video settings",
    clearSelection: "Clear selection",
    statusChip: "Sustained load test {{status}}",
    statusDetail: "{{completed}} / {{total}} · {{seconds}} s · {{input}}",
    sourceLine: "Input: {{width}}×{{height}} @ {{fps}} fps",
  },
  preview: {
    heading: "Inspect the synthetic patterns",
    description:
      "Plays back the exact input the inspection feeds to the encoders, generated by the same code. The preview is {{width}}×{{height}}; the inspection draws the same pattern at each candidate's own resolution. Audio loops a {{seconds}} second stretch.",
    compatibilityHeading: "Full capability inspection input",
    compatibilityNote:
      "One frame and one audio chunk are generated and reused. That pass walks every candidate once, so lighter input generation means steadier results. Staying still is the correct behaviour here.",
    sustainedHeading: "Sustained load test input",
    sustainedNote:
      "Regenerated for every frame and every chunk. Without motion and detail the content compresses away and the measurement stops reflecting the encoder.",
    compatibilityVideoLabel: "Video pattern of the full capability inspection",
    sustainedVideoLabel: "Video pattern of the sustained load test",
    compatibilityAudioLabel:
      "Waveform of the full capability inspection audio pattern",
    sustainedAudioLabel: "Waveform of the sustained load test audio pattern",
    playVideo: "Play video",
    pauseVideo: "Pause video",
    play: "Play audio",
    stop: "Stop audio",
    volumeNote:
      "The synthetic pattern sits close to full scale, so the preview plays it attenuated. The WAV files under samples/ carry the real amplitude.",
    runningNote: "The preview is paused while an inspection is running.",
    unavailable: "This environment cannot render the preview.",
  },
  table: {
    summary: "Showing {{shown}} of {{total}}",
    selectedSuffix: " · {{count}} selected",
    empty: "No results yet. Start a full capability inspection.",
    noMatch: "No results match these filters.",
    label: "Inspection results",
    selectAll: "Select all visible candidates",
    selectOne: "Include {{codec}} in the sustained load test",
    columnFamily: "Family",
    columnCodec: "Codec string",
    columnVariant: "Preference / ch",
    columnStatus: "Result",
    columnDetails: "Details",
    columnBudget: "Frame budget",
    columnSustained: "Sustained",
    columnTime: "Duration",
    sortHint: "Click to sort (ascending → descending → off)",
    budgetHint:
      "The full capability inspection encodes only two frames, so start-up cost lands directly on the frame budget ratio. Going over 100% there does not mean a practical problem. Judge sustained performance from the sustained load test instead.",
    experimentalBadge: "Experimental",
    experimentalFilterLabel: "Experimental configurations",
    experimentalAll: "All",
    experimentalExclude: "Production only",
    experimentalOnly: "Experimental only",
    backendHint:
      "WebCodecs exposes no API for the implementation actually used. This is inferred by matching the output byte count and chunk count against prefer-hardware and prefer-software for the same codec string.",
    backendShort: "≈ {{backend}}",
    backendUnknownShort: "unknown",
    backendReasonMatched:
      "prefer-hardware and prefer-software produced different output, and this run matched the {{backend}} side exactly.",
    backendReasonOnlyOne:
      "The other preference failed, so only one implementation works, and the output matched that {{backend}} side exactly.",
    backendReasonUnknown:
      "Both preferences produced the same output, or neither matched, so the implementation cannot be told apart.",
    backend_hardware: "hardware",
    backend_software: "software",
    filterAll: "All",
    filterCodecPlaceholder: "avc1.64…",
    filterDetailsPlaceholder: "Filter by error or warning",
    budgetOver: "Over 100%",
    budgetUnder: "100% or under",
    sustainedDone: "Measured",
    sustainedNone: "Not run",
    sustainedFrames: "{{count}} frames",
    timeQuick: "Under 1 s",
    timeSlow: "1 s or more",
    statusPass: "Pass",
    statusWarning: "Pass / warn",
    statusFail: "Fail",
    declaredButFailed: "Config accepted but failed at {{stage}}",
    sourceLine:
      "Input {{width}}×{{height}} @ {{fps}} fps · missing {{missing}}",
  },
  references: {
    heading: "References",
    description:
      "Material for following how codec strings are written and what this inspection actually checks.",
    group: {
      spec: "WebCodecs specifications",
      "codec-string": "Codec string syntax",
      codec: "Codec specifications",
      implementation: "Implementations and libraries",
    },
    groupNote: {
      spec: "How encoder configuration and support detection are defined.",
      "codec-string":
        "How strings such as `avc1.640028` are assembled. The candidate matrix follows these.",
      codec:
        "The definitions of the profiles, levels, and bit depths themselves.",
      implementation:
        "Using the browser implementation, and the library used for muxing.",
    },
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
  kind: {
    video: "Video",
    audio: "Audio",
  },
  experimental: {
    "bit-depth-10": "10-bit",
    "chroma-422": "4:2:2 chroma subsampling",
    "chroma-444": "4:4:4 chroma subsampling",
    "high-profile": "higher profile",
    "level-6x": "Level 6.x",
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
    "live-capture-audio-track-unavailable":
      "No audio was shared, so audio candidates cannot be inspected",
    "live-audio-captured-as-mono":
      "The captured audio was 1ch, so the second channel was filled by duplication",
    "media-stream-track-processor-unavailable":
      "MediaStreamTrackProcessor is unavailable",
    "display-capture-unavailable": "The screen capture API is unavailable",
    "capability-report-not-found":
      "Complete a full capability inspection first",
    "no-units-selected": "Nothing is selected",
    "inspection-already-running":
      "An inspection is already running in another tab or window",
    "inspection-worker-crashed": "The inspection worker stopped",
    "inspection-worker-busy":
      "The inspection worker is still handling the previous candidate",
    "indexeddb-open-failed": "Could not open the storage",
    "indexeddb-request-failed": "Reading from or writing to storage failed",
    "indexeddb-transaction-aborted": "The storage operation was aborted",
  },
};

export default translation;
