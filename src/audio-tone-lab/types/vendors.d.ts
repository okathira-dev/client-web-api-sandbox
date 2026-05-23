declare module "ggwave" {
  interface GgwaveModule {
    getDefaultParameters(): {
      sampleRateInp: number;
      sampleRateOut: number;
      [key: string]: unknown;
    };
    init(parameters: ReturnType<GgwaveModule["getDefaultParameters"]>): number;
    free(instance: number): void;
    encode(
      instance: number,
      payload: string | Uint8Array,
      protocolId: number,
      volume: number,
    ): Int8Array | Float32Array;
    decode(instance: number, waveform: Int8Array): Uint8Array | null;
    ProtocolId: Record<string, number>;
  }
  export default function ggwave_factory(): Promise<GgwaveModule>;
}

declare module "quietjs-bundle" {
  interface QuietTransmitter {
    transmit(payload: ArrayBuffer): void;
    destroy(): void;
  }
  interface QuietReceiver {
    destroy(): void;
  }
  interface Quiet {
    addReadyCallback(
      success: () => void,
      error?: (reason: unknown) => void,
    ): void;
    transmitter(options: {
      profile: string;
      clampFrame?: boolean;
      onFinish?: () => void;
      onEnqueue?: () => void;
    }): QuietTransmitter;
    receiver(options: {
      profile: string;
      onReceive: (payload: ArrayBuffer) => void;
      onCreate?: () => void;
      onCreateFail?: (reason: string) => void;
      onReceiveFail?: (count: number) => void;
    }): QuietReceiver;
    disconnect(): void;
  }
  const quiet: Quiet;
  export default quiet;
}

declare module "goertzeljs";
declare module "fft.js";
declare module "@bnb-chain/reed-solomon";
