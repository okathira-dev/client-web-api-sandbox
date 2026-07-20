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
}
