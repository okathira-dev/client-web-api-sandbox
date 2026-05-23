export interface TextSample {
  id: string;
  label: string;
  bytes: number;
  content: string;
}

export interface ImageSampleDefinition {
  id: string;
  label: string;
  width: number;
  height: number;
}

const BASE_SENTENCE =
  "Audio tone lab compares transfer speed, stability, and retry behavior across algorithms.";

function padTextToByteLength(base: string, targetBytes: number) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let text = base;
  while (encoder.encode(text).length < targetBytes) {
    text += ` ${BASE_SENTENCE}`;
  }
  const bytes = encoder.encode(text).slice(0, targetBytes);
  return decoder.decode(bytes);
}

export const TEXT_SAMPLES: TextSample[] = [
  {
    id: "short-64",
    label: "短文 約64文字",
    bytes: 64,
    content:
      "音声通信ラボのサンプル短文です。速度・安定性・誤り率を比較します。12345",
  },
  {
    id: "long-1kb",
    label: "長文 1KB",
    bytes: 1024,
    content: padTextToByteLength(BASE_SENTENCE, 1024),
  },
  {
    id: "long-2kb",
    label: "長文 2KB",
    bytes: 2048,
    content: padTextToByteLength(BASE_SENTENCE, 2048),
  },
  {
    id: "long-3kb",
    label: "長文 3KB",
    bytes: 3072,
    content: padTextToByteLength(BASE_SENTENCE, 3072),
  },
  {
    id: "long-4kb",
    label: "長文 4KB",
    bytes: 4096,
    content: padTextToByteLength(BASE_SENTENCE, 4096),
  },
  {
    id: "long-5kb",
    label: "長文 5KB",
    bytes: 5120,
    content: padTextToByteLength(BASE_SENTENCE, 5120),
  },
];

export const IMAGE_SAMPLE_DEFINITIONS: ImageSampleDefinition[] = [
  { id: "img-3kb", label: "サンプル画像 約3KB", width: 32, height: 32 },
  { id: "img-30kb", label: "サンプル画像 約30KB", width: 100, height: 100 },
  { id: "img-300kb", label: "サンプル画像 約300KB", width: 320, height: 320 },
  { id: "img-3mb", label: "サンプル画像 約3MB", width: 1024, height: 1024 },
];

function createBmpBlob(width: number, height: number) {
  const bytesPerPixel = 3;
  const rowSize = Math.ceil((bytesPerPixel * width) / 4) * 4;
  const pixelArraySize = rowSize * height;
  const fileSize = 54 + pixelArraySize;
  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);
  const data = new Uint8Array(buffer);

  // BMP header
  view.setUint8(0, 0x42);
  view.setUint8(1, 0x4d);
  view.setUint32(2, fileSize, true);
  view.setUint32(10, 54, true);
  view.setUint32(14, 40, true);
  view.setInt32(18, width, true);
  view.setInt32(22, -height, true); // top-down bitmap
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  view.setUint32(34, pixelArraySize, true);

  let pixelOffset = 54;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const r = (x * 17 + y * 11) % 256;
      const g = (x * 31 + y * 7) % 256;
      const b = (x * 13 + y * 19) % 256;
      data[pixelOffset] = b;
      data[pixelOffset + 1] = g;
      data[pixelOffset + 2] = r;
      pixelOffset += 3;
    }
    while ((pixelOffset - 54) % rowSize !== 0) {
      data[pixelOffset] = 0;
      pixelOffset += 1;
    }
  }

  return new Blob([buffer], { type: "image/bmp" });
}

export function createImageSampleFile(sampleId: string) {
  const def = IMAGE_SAMPLE_DEFINITIONS.find((item) => item.id === sampleId);
  if (!def) {
    throw new Error(`unknown image sample: ${sampleId}`);
  }
  const blob = createBmpBlob(def.width, def.height);
  return new File([blob], `${def.id}.bmp`, { type: "image/bmp" });
}
