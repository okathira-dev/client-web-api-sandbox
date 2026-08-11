const size = 25;
const dataWords = 34;
const eccWords = 10;

function multiply(left: number, right: number) {
  if (left === 0 || right === 0) return 0;
  let value = 0;
  let a = left;
  let b = right;
  while (b > 0) {
    if (b & 1) value ^= a;
    a <<= 1;
    if (a & 0x100) a ^= 0x11d;
    b >>= 1;
  }
  return value;
}

function generator(degree: number) {
  let polynomial = [1];
  let root = 1;
  for (let index = 0; index < degree; index += 1) {
    const next = new Array<number>(polynomial.length + 1).fill(0);
    for (
      let coefficient = 0;
      coefficient < polynomial.length;
      coefficient += 1
    ) {
      next[coefficient] =
        (next[coefficient] ?? 0) ^ (polynomial[coefficient] ?? 0);
      next[coefficient + 1] =
        (next[coefficient + 1] ?? 0) ^
        multiply(polynomial[coefficient] ?? 0, root);
    }
    polynomial = next;
    root = multiply(root, 2);
  }
  return polynomial;
}

function ecc(data: readonly number[]) {
  const polynomial = generator(eccWords);
  const remainder = new Array<number>(eccWords).fill(0);
  for (const byte of data) {
    const factor = byte ^ (remainder.shift() ?? 0);
    remainder.push(0);
    for (let index = 0; index < eccWords; index += 1)
      remainder[index] =
        (remainder[index] ?? 0) ^ multiply(polynomial[index + 1] ?? 0, factor);
  }
  return remainder;
}

function dataCodewords(text: string) {
  const bytes = new TextEncoder().encode(text);
  if (bytes.length > 31)
    throw new Error("QR payload exceeds Version 2-L capacity");
  const bits = [0, 1, 0, 0];
  for (let bit = 7; bit >= 0; bit -= 1) bits.push((bytes.length >>> bit) & 1);
  for (const byte of bytes)
    for (let bit = 7; bit >= 0; bit -= 1) bits.push((byte >>> bit) & 1);
  const capacity = dataWords * 8;
  for (let index = 0; index < Math.min(4, capacity - bits.length); index += 1)
    bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);
  const words: number[] = [];
  for (let index = 0; index < bits.length; index += 8)
    words.push(
      bits
        .slice(index, index + 8)
        .reduce((value, bit) => (value << 1) | bit, 0),
    );
  while (words.length < dataWords)
    words.push([0xec, 0x11][words.length % 2] ?? 0);
  return words;
}

type Cell = boolean | undefined;
type Matrix = Cell[][];

function set(matrix: Matrix, row: number, column: number, value: Cell) {
  const target = matrix[row];
  if (target) target[column] = value;
}

function finder(matrix: Matrix, left: number, top: number) {
  for (let y = -1; y <= 7; y += 1)
    for (let x = -1; x <= 7; x += 1) {
      const row = top + y;
      const column = left + x;
      if (row < 0 || row >= size || column < 0 || column >= size) continue;
      set(
        matrix,
        row,
        column,
        x >= 0 &&
          x <= 6 &&
          y >= 0 &&
          y <= 6 &&
          (x === 0 ||
            x === 6 ||
            y === 0 ||
            y === 6 ||
            (x >= 2 && x <= 4 && y >= 2 && y <= 4)),
      );
    }
}

function baseMatrix() {
  const matrix = Array.from({ length: size }, () =>
    Array<Cell>(size).fill(undefined),
  );
  finder(matrix, 0, 0);
  finder(matrix, size - 7, 0);
  finder(matrix, 0, size - 7);
  for (let index = 8; index < size - 8; index += 1) {
    set(matrix, 6, index, index % 2 === 0);
    set(matrix, index, 6, index % 2 === 0);
  }
  for (let y = -2; y <= 2; y += 1)
    for (let x = -2; x <= 2; x += 1)
      set(
        matrix,
        18 + y,
        18 + x,
        Math.abs(x) === 2 || Math.abs(y) === 2 || (x === 0 && y === 0),
      );
  for (let index = 0; index < 9; index += 1)
    if (index !== 6) {
      set(matrix, index, 8, false);
      set(matrix, 8, index, false);
    }
  for (let index = 0; index < 8; index += 1)
    set(matrix, 8, size - 1 - index, false);
  for (let index = 0; index < 7; index += 1)
    set(matrix, size - 1 - index, 8, false);
  set(matrix, size - 8, 8, true);
  return matrix;
}

function format(matrix: Matrix) {
  const data = 0x08;
  let remainder = data << 10;
  while (remainder.toString(2).length >= 11)
    remainder ^= 0x537 << (remainder.toString(2).length - 11);
  const bits = ((data << 10) | remainder) ^ 0x5412;
  for (let index = 0; index < 15; index += 1) {
    const dark = ((bits >>> index) & 1) === 1;
    if (index < 6) set(matrix, index, 8, dark);
    else if (index < 8) set(matrix, index + 1, 8, dark);
    else set(matrix, size - 15 + index, 8, dark);
    if (index < 8) set(matrix, 8, size - index - 1, dark);
    else if (index < 9) set(matrix, 8, 15 - index, dark);
    else set(matrix, 8, 14 - index, dark);
  }
  set(matrix, size - 8, 8, true);
}

function matrixFor(text: string) {
  const matrix = baseMatrix();
  const words = dataCodewords(text);
  const bits = [...words, ...ecc(words)].flatMap((word) =>
    Array.from({ length: 8 }, (_unused, offset) => (word >>> (7 - offset)) & 1),
  );
  let bitIndex = 0;
  let upward = true;
  for (let column = size - 1; column > 0; column -= 2) {
    if (column === 6) column -= 1;
    for (let offset = 0; offset < size; offset += 1) {
      const row = upward ? size - 1 - offset : offset;
      for (const target of [column, column - 1]) {
        if (matrix[row]?.[target] !== undefined) continue;
        const raw = (bits[bitIndex] ?? 0) === 1;
        set(matrix, row, target, (row + target) % 2 === 0 ? !raw : raw);
        bitIndex += 1;
      }
    }
    upward = !upward;
  }
  format(matrix);
  return matrix;
}

export function drawQr(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
) {
  const matrix = matrixFor(text);
  const quiet = 4;
  const modulePixels = Math.max(
    1,
    Math.floor(Math.min(width, height) / (size + quiet * 2)),
  );
  const drawn = (size + quiet * 2) * modulePixels;
  const left = Math.floor((width - drawn) / 2);
  const top = Math.floor((height - drawn) / 2);
  context.fillStyle = "#fff";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "#000";
  for (let row = 0; row < size; row += 1)
    for (let column = 0; column < size; column += 1)
      if (matrix[row]?.[column])
        context.fillRect(
          left + (column + quiet) * modulePixels,
          top + (row + quiet) * modulePixels,
          modulePixels,
          modulePixels,
        );
}

export interface QrQuadPoint {
  readonly x: number;
  readonly y: number;
}

function projectiveMap(
  sourceX: number,
  sourceY: number,
  corners: readonly [QrQuadPoint, QrQuadPoint, QrQuadPoint, QrQuadPoint],
) {
  const [topLeft, topRight, bottomRight, bottomLeft] = corners;
  const dx1 = topRight.x - bottomRight.x;
  const dx2 = bottomLeft.x - bottomRight.x;
  const dx3 = topLeft.x - topRight.x + bottomRight.x - bottomLeft.x;
  const dy1 = topRight.y - bottomRight.y;
  const dy2 = bottomLeft.y - bottomRight.y;
  const dy3 = topLeft.y - topRight.y + bottomRight.y - bottomLeft.y;
  const determinant = dx1 * dy2 - dx2 * dy1;
  const g =
    Math.abs(determinant) < 0.0001 ? 0 : (dx3 * dy2 - dx2 * dy3) / determinant;
  const h =
    Math.abs(determinant) < 0.0001 ? 0 : (dx1 * dy3 - dx3 * dy1) / determinant;
  const a = topRight.x - topLeft.x + g * topRight.x;
  const b = bottomLeft.x - topLeft.x + h * bottomLeft.x;
  const c = topLeft.x;
  const d = topRight.y - topLeft.y + g * topRight.y;
  const e = bottomLeft.y - topLeft.y + h * bottomLeft.y;
  const f = topLeft.y;
  const denominator = g * sourceX + h * sourceY + 1;
  return {
    x: (a * sourceX + b * sourceY + c) / denominator,
    y: (d * sourceX + e * sourceY + f) / denominator,
  };
}

function expandQuad(
  corners: readonly [QrQuadPoint, QrQuadPoint, QrQuadPoint, QrQuadPoint],
  scale: number,
): [QrQuadPoint, QrQuadPoint, QrQuadPoint, QrQuadPoint] {
  const center = corners.reduce(
    (sum, point) => ({ x: sum.x + point.x / 4, y: sum.y + point.y / 4 }),
    { x: 0, y: 0 },
  );
  return corners.map((point) => ({
    x: center.x + (point.x - center.x) * scale,
    y: center.y + (point.y - center.y) * scale,
  })) as [QrQuadPoint, QrQuadPoint, QrQuadPoint, QrQuadPoint];
}

/** Draw the replacement QR into the detected quadrilateral, including a quiet zone. */
export function drawQrIntoQuad(
  context: CanvasRenderingContext2D,
  corners: readonly [QrQuadPoint, QrQuadPoint, QrQuadPoint, QrQuadPoint],
  text: string,
) {
  const matrix = matrixFor(text);
  const quiet = 4;
  const total = size + quiet * 2;
  const target = expandQuad(corners, total / size);
  const map = (x: number, y: number) =>
    projectiveMap(x / total, y / total, target);
  const polygon = (points: readonly QrQuadPoint[]) => {
    context.beginPath();
    const first = points[0];
    if (!first) return;
    context.moveTo(first.x, first.y);
    for (const point of points.slice(1)) context.lineTo(point.x, point.y);
    context.closePath();
  };
  polygon([map(0, 0), map(total, 0), map(total, total), map(0, total)]);
  context.fillStyle = "#fff";
  context.fill();
  context.fillStyle = "#000";
  for (let row = 0; row < size; row += 1)
    for (let column = 0; column < size; column += 1)
      if (matrix[row]?.[column]) {
        const left = column + quiet;
        const top = row + quiet;
        polygon([
          map(left, top),
          map(left + 1, top),
          map(left + 1, top + 1),
          map(left, top + 1),
        ]);
        context.fill();
      }
}
