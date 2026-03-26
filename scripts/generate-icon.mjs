import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const workspaceRoot = resolve(__dirname, '..');
const buildDir = resolve(workspaceRoot, 'build');
const pngPath = resolve(buildDir, 'icon.png');
const icoPath = resolve(buildDir, 'icon.ico');
const size = 256;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function mixColor(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
    Math.round(a[3] + (b[3] - a[3]) * t)
  ];
}

function createPixelBuffer() {
  const buffer = Buffer.alloc(size * size * 4);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = x - size / 2;
      const dy = y - size / 2;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const offset = (y * size + x) * 4;

      let color = [23, 10, 8, 255];

      if (distance < 110) {
        const t = clamp(distance / 110, 0, 1);
        if (t < 0.24) {
          color = mixColor([255, 234, 178, 255], [255, 184, 97, 255], t / 0.24);
        } else if (t < 0.58) {
          color = mixColor([255, 184, 97, 255], [189, 69, 31, 255], (t - 0.24) / 0.34);
        } else {
          color = mixColor([189, 69, 31, 255], [45, 8, 5, 255], (t - 0.58) / 0.42);
        }
      }

      if (distance > 112 && distance < 124) {
        color = [243, 197, 117, 255];
      }

      if (distance > 126 && distance < 136) {
        color = [122, 43, 24, 220];
      }

      const highlightDx = x - 104;
      const highlightDy = y - 96;
      const highlightDistance = Math.sqrt(highlightDx * highlightDx + highlightDy * highlightDy);
      if (highlightDistance < 38) {
        const glow = 1 - highlightDistance / 38;
        const mixed = mixColor(color, [255, 241, 203, 255], glow * 0.36);
        color = mixed;
      }

      const eyeLeft = Math.sqrt((x - 96) ** 2 + (y - 112) ** 2);
      const eyeRight = Math.sqrt((x - 160) ** 2 + (y - 112) ** 2);
      if (eyeLeft < 13 || eyeRight < 13) {
        color = [255, 242, 199, 255];
      }

      buffer[offset] = color[0];
      buffer[offset + 1] = color[1];
      buffer[offset + 2] = color[2];
      buffer[offset + 3] = color[3];
    }
  }

  return buffer;
}

function createCrcTable() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let j = 0; j < 8; j += 1) {
      c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
}

const crcTable = createCrcTable();

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const value of buffer) {
    crc = crcTable[(crc ^ value) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32BE(data.length, 0);

  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);

  return Buffer.concat([lengthBuffer, typeBuffer, data, crcBuffer]);
}

function createPng(buffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y += 1) {
    raw[y * (stride + 1)] = 0;
    buffer.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }

  const compressed = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    signature,
    createChunk('IHDR', ihdr),
    createChunk('IDAT', compressed),
    createChunk('IEND', Buffer.alloc(0))
  ]);
}

function createIco(pngBuffer) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);

  const entry = Buffer.alloc(16);
  entry[0] = 0;
  entry[1] = 0;
  entry[2] = 0;
  entry[3] = 0;
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(pngBuffer.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12);

  return Buffer.concat([header, entry, pngBuffer]);
}

async function main() {
  await mkdir(buildDir, { recursive: true });
  const pixels = createPixelBuffer();
  const pngBuffer = createPng(pixels);
  const icoBuffer = createIco(pngBuffer);

  await writeFile(pngPath, pngBuffer);
  await writeFile(icoPath, icoBuffer);

  console.log(`Icon written: ${pngPath}`);
  console.log(`Icon written: ${icoPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
