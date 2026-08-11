import jsQR from "jsqr";

interface BarcodeResult {
  readonly rawValue?: string;
}

interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<readonly BarcodeResult[]>;
}

interface BarcodeDetectorConstructor {
  new (options?: { formats?: readonly string[] }): BarcodeDetectorLike;
}

export function createNativeQrDetector(): BarcodeDetectorLike | undefined {
  const Detector = (
    window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor }
  ).BarcodeDetector;
  if (!Detector) return undefined;
  try {
    return new Detector({ formats: ["qr_code"] });
  } catch {
    return undefined;
  }
}

export async function decodeQrCanvas(
  canvas: HTMLCanvasElement,
  nativeDetector?: BarcodeDetectorLike,
): Promise<string | undefined> {
  if (nativeDetector) {
    try {
      const nativeResult = (await nativeDetector.detect(canvas)).find(
        (result) => result.rawValue,
      )?.rawValue;
      if (nativeResult) return nativeResult;
    } catch {
      // The bundled decoder below is the device-independent path.
    }
  }
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return undefined;
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  return jsQR(image.data, image.width, image.height, {
    inversionAttempts: "attemptBoth",
  })?.data;
}
