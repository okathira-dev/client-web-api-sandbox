interface SensorOptions {
  frequency?: number;
}

interface Sensor extends EventTarget {
  readonly activated: boolean;
  readonly hasReading: boolean;
  readonly timestamp: number | null;
  start(): void;
  stop(): void;
}

interface XYZSensor extends Sensor {
  readonly x: number | null;
  readonly y: number | null;
  readonly z: number | null;
}

declare class Accelerometer extends EventTarget implements XYZSensor {
  constructor(options?: SensorOptions);
  readonly activated: boolean;
  readonly hasReading: boolean;
  readonly timestamp: number | null;
  readonly x: number | null;
  readonly y: number | null;
  readonly z: number | null;
  start(): void;
  stop(): void;
}

declare class LinearAccelerationSensor extends Accelerometer {}
declare class Gyroscope extends Accelerometer {}

declare class AmbientLightSensor extends EventTarget implements Sensor {
  constructor(options?: SensorOptions);
  readonly activated: boolean;
  readonly hasReading: boolean;
  readonly timestamp: number | null;
  readonly illuminance: number | null;
  start(): void;
  stop(): void;
}

declare class ProximitySensor extends EventTarget implements Sensor {
  constructor(options?: SensorOptions);
  readonly activated: boolean;
  readonly hasReading: boolean;
  readonly timestamp: number | null;
  readonly distance: number | null;
  readonly max: number | null;
  readonly near: boolean | null;
  start(): void;
  stop(): void;
}

declare class RelativeOrientationSensor extends EventTarget implements Sensor {
  constructor(options?: SensorOptions);
  readonly activated: boolean;
  readonly hasReading: boolean;
  readonly timestamp: number | null;
  readonly quaternion: readonly [number, number, number, number] | null;
  start(): void;
  stop(): void;
}

interface LaunchParams {
  readonly targetURL: string;
  readonly files: readonly FileSystemFileHandle[];
}

interface LaunchQueue {
  setConsumer(consumer: (params: LaunchParams) => void): void;
}

interface Window {
  readonly launchQueue?: LaunchQueue;
  readonly SpeechRecognition?: typeof SpeechRecognition;
  readonly webkitSpeechRecognition?: typeof SpeechRecognition;
}

interface BatteryManager extends EventTarget {
  readonly charging: boolean;
  readonly level: number;
}

interface WindowControlsOverlay extends EventTarget {
  readonly visible: boolean;
  getTitlebarAreaRect(): DOMRect;
}

interface Navigator {
  getBattery?: () => Promise<BatteryManager>;
  readonly windowControlsOverlay?: WindowControlsOverlay;
}

type PressureState = "nominal" | "fair" | "serious" | "critical";

interface PressureRecord {
  readonly source: "cpu" | string;
  readonly state: PressureState;
  readonly time: DOMHighResTimeStamp;
}

interface PressureObserverOptions {
  readonly sampleInterval?: number;
}

declare class PressureObserver extends EventTarget {
  static readonly knownSources: readonly string[];
  constructor(
    callback: (
      records: readonly PressureRecord[],
      observer: PressureObserver,
    ) => void,
  );
  observe(source: "cpu", options?: PressureObserverOptions): Promise<void>;
  disconnect(): void;
}

interface Window {
  readonly PressureObserver?: typeof PressureObserver;
}

interface SpeechRecognitionResultAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: SpeechRecognitionResultAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
}

declare class SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
  abort(): void;
}

type IdleDetectorUserState = "active" | "idle";
type IdleDetectorScreenState = "locked" | "unlocked";

interface IdleDetectorStartOptions {
  threshold?: number;
  signal?: AbortSignal;
}

declare class IdleDetector extends EventTarget {
  static requestPermission(): Promise<PermissionState>;
  readonly userState: IdleDetectorUserState | null;
  readonly screenState: IdleDetectorScreenState | null;
  start(options?: IdleDetectorStartOptions): Promise<void>;
}

interface Window {
  readonly IdleDetector?: typeof IdleDetector;
}

interface DocumentPictureInPictureEvent extends Event {
  readonly window: Window;
}

interface DocumentPictureInPicture extends EventTarget {
  requestWindow(options?: { width?: number; height?: number }): Promise<Window>;
}

interface Window {
  readonly documentPictureInPicture?: DocumentPictureInPicture;
}

interface EditContextTextUpdateEvent extends Event {
  readonly updateRangeStart: number;
  readonly updateRangeEnd: number;
  readonly text: string;
}

declare class EditContext extends EventTarget {
  constructor(options?: {
    text?: string;
    selectionStart?: number;
    selectionEnd?: number;
  });
  readonly text: string;
  readonly selectionStart: number;
  readonly selectionEnd: number;
  updateText(start: number, end: number, text: string): void;
  updateSelection(start: number, end: number): void;
  updateControlBounds(bounds: DOMRect): void;
  updateSelectionBounds(anchor: DOMRect, focus: DOMRect): void;
  updateCharacterBounds(
    rangeStart: number,
    characterBounds: readonly DOMRect[],
  ): void;
}

interface HTMLElement {
  editContext?: EditContext;
  showPopover(options?: { source?: HTMLElement }): void;
}

interface Window {
  readonly EditContext?: typeof EditContext;
}

interface FileSystemDirectoryHandle {
  values(): AsyncIterableIterator<FileSystemHandle>;
}

interface Window {
  showDirectoryPicker?: (options?: {
    mode?: "read" | "readwrite";
  }) => Promise<FileSystemDirectoryHandle>;
}
