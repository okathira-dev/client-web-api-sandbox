import jsQR from "jsqr";

export interface QrPoint {
  readonly x: number;
  readonly y: number;
}

export interface QrDetection {
  readonly data: string;
  readonly location: {
    readonly topLeftCorner: QrPoint;
    readonly topRightCorner: QrPoint;
    readonly bottomRightCorner: QrPoint;
    readonly bottomLeftCorner: QrPoint;
  };
}

/**
 * Decode through the bundled jsQR implementation. S-710 intentionally does
 * not use Barcode Detection API as a fallback or primary path: its puzzle
 * needs the same corner geometry on every supported device.
 */
export function decodeQrCanvas(
  canvas: HTMLCanvasElement,
): QrDetection | undefined {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return undefined;
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  const decoded = jsQR(image.data, image.width, image.height, {
    inversionAttempts: "attemptBoth",
  });
  if (!decoded) return undefined;
  return {
    data: decoded.data,
    location: {
      topLeftCorner: decoded.location.topLeftCorner,
      topRightCorner: decoded.location.topRightCorner,
      bottomRightCorner: decoded.location.bottomRightCorner,
      bottomLeftCorner: decoded.location.bottomLeftCorner,
    },
  };
}
