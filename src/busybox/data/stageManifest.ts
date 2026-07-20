import { type StageId, stageCatalogue } from "../domain/stages";

interface StageEvidence {
  gimmickIds: readonly `G-${number}`[];
  apiFeatures: readonly string[];
  humanTestIds: readonly `H-${number}`[];
}

const stageEvidence = {
  "S-000": [[], ["HTMLElement.click"], ["H-001", "H-020"]],
  "S-010": [["G-004"], ["PointerEvent.pointerType"], ["H-004", "H-024"]],
  "S-020": [["G-002"], ["ResizeObserver"], ["H-001", "H-003"]],
  "S-030": [["G-003"], ["Selection"], ["H-001", "H-020"]],
  "S-040": [
    ["G-018"],
    ["Page Visibility", "performance.now"],
    ["H-013", "H-022", "H-025"],
  ],
  "S-050": [["G-017"], ["BroadcastChannel"], ["H-013"]],
  "S-060": [["G-014"], ["IndexedDB"], ["H-001", "H-018"]],
  "S-070": [
    ["G-015"],
    ["Service Worker", "CacheStorage"],
    ["H-005", "H-021", "H-022"],
  ],
  "S-080": [["G-027"], ["display-mode"], ["H-005", "H-023"]],
  "S-090": [
    ["G-029"],
    ["Notifications", "notificationclick"],
    ["H-005", "H-006", "H-023"],
  ],
  "S-100": [["G-009"], ["DeviceOrientationEvent"], ["H-008"]],
  "S-110": [
    ["G-010"],
    ["getUserMedia", "CanvasRenderingContext2D"],
    ["H-006", "H-007", "H-019"],
  ],
  "S-120": [
    ["G-011"],
    ["getUserMedia", "Web Audio"],
    ["H-006", "H-007", "H-019"],
  ],
  "S-130": [
    ["G-007", "G-008"],
    ["File", "SubtleCrypto.digest"],
    ["H-014", "H-020"],
  ],
  "S-140": [
    ["G-030"],
    ["Google Drive appDataFolder"],
    ["H-015", "H-016", "H-017", "H-018"],
  ],
  "S-150": [["G-001"], ["MutationObserver"], ["H-001", "H-020"]],
  "S-160": [["G-004"], ["Canvas", "PointerEvent"], ["H-004", "H-020", "H-024"]],
  "S-170": [["G-005"], ["Web Animations"], ["H-001", "H-003", "H-020"]],
  "S-180": [["G-006"], ["Clipboard API"], ["H-006", "H-014", "H-020", "H-025"]],
  "S-190": [
    ["G-012"],
    ["getDisplayMedia", "MediaRecorder", "Canvas"],
    ["H-006", "H-007", "H-012", "H-013", "H-019", "H-023"],
  ],
  "S-200": [["G-013"], ["Gamepad"], ["H-009", "H-019"]],
  "S-210": [["G-016"], ["Badging"], ["H-005", "H-023"]],
  "S-220": [
    ["G-019"],
    ["History", "PerformanceNavigationTiming"],
    ["H-001", "H-003", "H-022"],
  ],
  "S-230": [["G-020"], ["Picture-in-Picture"], ["H-012", "H-023"]],
  "S-240": [
    ["G-021"],
    ["Web Share", "Web Share Target"],
    ["H-004", "H-005", "H-014", "H-023"],
  ],
  "S-250": [["G-022"], ["Web Locks", "BroadcastChannel"], ["H-013", "H-022"]],
  "S-260": [["G-023"], ["EyeDropper"], ["H-006", "H-023"]],
  "S-270": [["G-024"], ["WebGPU"], ["H-019", "H-023"]],
  "S-280": [["G-025"], ["Web Bluetooth"], ["H-006", "H-010", "H-019"]],
  "S-290": [["G-026"], ["WebHID"], ["H-006", "H-011", "H-019"]],
  "S-300": [["G-026"], ["WebUSB"], ["H-006", "H-011", "H-019"]],
  "S-310": [
    ["G-027"],
    ["LaunchQueue", "manifest shortcuts", "note_taking"],
    ["H-005", "H-021", "H-023", "H-025"],
  ],
  "S-320": [["G-028"], ["Device Posture", "Viewport Segments"], ["H-023"]],
  "S-330": [["G-031"], ["Screen Wake Lock"], ["H-005", "H-022", "H-023"]],
  "S-340": [["G-032"], ["View Transitions"], ["H-001", "H-003", "H-020"]],
  "S-350": [["G-033"], ["HTMLMediaElement"], ["H-001", "H-020", "H-023"]],
  "S-360": [
    ["G-034"],
    ["WebRTC", "Web Audio", "BroadcastChannel"],
    ["H-013", "H-019", "H-023"],
  ],
  "S-370": [["G-035"], ["Battery Status"], ["H-004", "H-019", "H-023"]],
  "S-380": [
    ["G-036"],
    ["WebAuthn Conditional UI", "Web Crypto"],
    ["H-006", "H-019", "H-023"],
  ],
  "S-390": [
    ["G-037"],
    ["WebAuthn", "AbortSignal"],
    ["H-019", "H-020", "H-023"],
  ],
  "S-400": [
    ["G-038"],
    ["Date", "performance.now", "Page Visibility"],
    ["H-004", "H-019", "H-022"],
  ],
  "S-410": [
    ["G-039"],
    ["Notification actions", "Service Worker", "IndexedDB"],
    ["H-005", "H-006", "H-023"],
  ],
  "S-420": [
    ["G-040"],
    ["Notification actions", "notificationclick", "IndexedDB"],
    ["H-005", "H-006", "H-023"],
  ],
  "S-430": [
    ["G-041"],
    ["Media Session", "Web Audio"],
    ["H-004", "H-019", "H-023"],
  ],
  "S-440": [
    ["G-042"],
    ["File Handling", "LaunchQueue"],
    ["H-005", "H-006", "H-023"],
  ],
  "S-450": [
    ["G-043"],
    ["Protocol Handlers", "LaunchQueue"],
    ["H-005", "H-006", "H-023"],
  ],
  "S-460": [
    ["G-044"],
    ["Window Controls Overlay"],
    ["H-005", "H-019", "H-023"],
  ],
  "S-480": [
    ["G-046"],
    ["CSS Fonts", "devicePixelRatio"],
    ["H-003", "H-004", "H-023"],
  ],
  "S-490": [
    ["G-047"],
    ["HTMLInputElement", "InputEvent"],
    ["H-001", "H-004", "H-020"],
  ],
  "S-500": [
    ["G-048"],
    ["ClipboardEvent", "Selection"],
    ["H-004", "H-006", "H-014"],
  ],
  "S-510": [
    ["G-049"],
    ["HTML Drag and Drop", "DataTransfer", "File"],
    ["H-004", "H-013", "H-014"],
  ],
  "S-520": [["G-050"], ["ProximitySensor"], ["H-006", "H-019", "H-026"]],
  "S-530": [
    ["G-051"],
    ["LinearAccelerationSensor"],
    ["H-006", "H-019", "H-026"],
  ],
  "S-540": [["G-052"], ["AmbientLightSensor"], ["H-006", "H-019", "H-026"]],
  "S-550": [["G-053"], ["Accelerometer"], ["H-006", "H-019", "H-026"]],
  "S-560": [["G-054"], ["Gyroscope"], ["H-006", "H-019", "H-026"]],
  "S-570": [
    ["G-056"],
    ["RelativeOrientationSensor"],
    ["H-006", "H-019", "H-026"],
  ],
  "S-580": [["G-057"], ["SpeechRecognition"], ["H-006", "H-007", "H-027"]],
  "S-590": [
    ["G-058"],
    ["Geolocation", "Page Visibility", "sessionStorage"],
    ["H-004", "H-006", "H-028"],
  ],
  "S-600": [["G-059"], ["Geolocation altitude"], ["H-004", "H-006", "H-029"]],
} as const satisfies Readonly<
  Record<
    StageId,
    readonly [
      StageEvidence["gimmickIds"],
      StageEvidence["apiFeatures"],
      StageEvidence["humanTestIds"],
    ]
  >
>;

export const stageManifest = stageCatalogue.map((stage) => {
  const [gimmickIds, apiFeatures, humanTestIds] = stageEvidence[stage.id];
  return {
    id: stage.id,
    problemIds: stage.problems.map((problem) => problem.id),
    gimmickIds,
    apiFeatures,
    humanTestIds,
    map: stage.map,
  };
});
