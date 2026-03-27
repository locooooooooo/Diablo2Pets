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
const trayPngPath = resolve(buildDir, 'tray-icon.png');
const icoSizes = [16, 24, 32, 48, 64, 128, 256];
const mainIconSize = 256;
const trayIconSize = 64;

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

function blend(base, overlay) {
  const alpha = overlay[3] / 255;
  const inverse = 1 - alpha;
  const nextAlpha = clamp(base[3] + overlay[3] * inverse, 0, 255);

  if (nextAlpha <= 0) {
    return [0, 0, 0, 0];
  }

  return [
    Math.round(base[0] * inverse + overlay[0] * alpha),
    Math.round(base[1] * inverse + overlay[1] * alpha),
    Math.round(base[2] * inverse + overlay[2] * alpha),
    Math.round(nextAlpha)
  ];
}

function createCrcTable() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let current = i;
    for (let bit = 0; bit < 8; bit += 1) {
      current = (current & 1) ? 0xedb88320 ^ (current >>> 1) : current >>> 1;
    }
    table[i] = current >>> 0;
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

function createPng(buffer, size) {
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

function createIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  const entrySize = 16;
  const entries = Buffer.alloc(entrySize * images.length);
  let offset = header.length + entries.length;

  images.forEach((image, index) => {
    const entryOffset = index * entrySize;
    entries[entryOffset] = image.size >= 256 ? 0 : image.size;
    entries[entryOffset + 1] = image.size >= 256 ? 0 : image.size;
    entries[entryOffset + 2] = 0;
    entries[entryOffset + 3] = 0;
    entries.writeUInt16LE(1, entryOffset + 4);
    entries.writeUInt16LE(32, entryOffset + 6);
    entries.writeUInt32LE(image.buffer.length, entryOffset + 8);
    entries.writeUInt32LE(offset, entryOffset + 12);
    offset += image.buffer.length;
  });

  return Buffer.concat([header, entries, ...images.map((image) => image.buffer)]);
}

function isInsideRoundedRect(x, y, size, margin, radius) {
  const min = margin;
  const max = size - margin;
  const innerLeft = min + radius;
  const innerRight = max - radius;
  const innerTop = min + radius;
  const innerBottom = max - radius;

  if (x >= innerLeft && x <= innerRight && y >= min && y <= max) {
    return true;
  }

  if (y >= innerTop && y <= innerBottom && x >= min && x <= max) {
    return true;
  }

  const cornerCenters = [
    [innerLeft, innerTop],
    [innerRight, innerTop],
    [innerLeft, innerBottom],
    [innerRight, innerBottom]
  ];

  return cornerCenters.some(([cx, cy]) => {
    const dx = x - cx;
    const dy = y - cy;
    return dx * dx + dy * dy <= radius * radius;
  });
}

function createPixelBuffer(size, variant) {
  const buffer = Buffer.alloc(size * size * 4);
  const isTray = variant === 'tray';
  const margin = size * (isTray ? 0.08 : 0.04);
  const radius = size * (isTray ? 0.18 : 0.2);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const offset = (y * size + x) * 4;
      const nx = (x + 0.5) / size - 0.5;
      const ny = (y + 0.5) / size - 0.5;
      const distance = Math.sqrt(nx * nx + ny * ny);
      const manhattan = Math.abs(nx) + Math.abs(ny);

      let color = [0, 0, 0, 0];
      const insideShell = isInsideRoundedRect(x + 0.5, y + 0.5, size, margin, radius);

      if (!isTray && insideShell) {
        const coolGlow = clamp(1 - Math.sqrt((nx + 0.16) ** 2 + (ny + 0.2) ** 2) / 0.5, 0, 1);
        const emberGlow = clamp(1 - Math.sqrt((nx - 0.28) ** 2 + (ny - 0.24) ** 2) / 0.58, 0, 1);
        const base = mixColor([9, 17, 24, 255], [18, 32, 42, 255], clamp((ny + 0.5) * 1.2, 0, 1));
        color = base;
        color = blend(color, [96, 171, 198, Math.round(coolGlow * 62)]);
        color = blend(color, [222, 118, 67, Math.round(emberGlow * 58)]);

        const innerShell = isInsideRoundedRect(x + 0.5, y + 0.5, size, margin + size * 0.03, radius * 0.9);
        if (!innerShell) {
          color = blend(color, [243, 195, 108, 210]);
        } else {
          const frameBand = clamp(1 - Math.abs(distance - 0.45) / 0.06, 0, 1);
          color = blend(color, [255, 244, 215, Math.round(frameBand * 18)]);
        }
      }

      const diamondOuter = isTray ? 0.34 : 0.31;
      const diamondMid = isTray ? 0.285 : 0.255;
      const diamondInner = isTray ? 0.18 : 0.165;
      const coreDiamond = isTray ? 0.1 : 0.095;

      if (isTray) {
        const softHalo = clamp(1 - Math.abs(manhattan - 0.35) / 0.06, 0, 1);
        color = blend(color, [255, 190, 103, Math.round(softHalo * 68)]);
      }

      if (manhattan <= diamondOuter) {
        const borderBlend = clamp((diamondOuter - manhattan) / (diamondOuter - diamondMid), 0, 1);
        color = blend(color, mixColor([243, 193, 108, 210], [255, 232, 186, 248], borderBlend * 0.5));
      }

      if (manhattan <= diamondMid) {
        const fillBlend = clamp(manhattan / diamondMid, 0, 1);
        color = blend(color, mixColor([255, 219, 145, 245], [203, 92, 48, 240], fillBlend));
      }

      if (manhattan <= diamondInner) {
        const insetBlend = clamp(manhattan / diamondInner, 0, 1);
        color = blend(color, mixColor([43, 57, 69, 210], [20, 26, 35, 228], insetBlend));
      }

      if (manhattan <= coreDiamond) {
        const coreBlend = clamp(manhattan / coreDiamond, 0, 1);
        color = blend(color, mixColor([255, 220, 152, 255], [201, 112, 59, 248], coreBlend));
      }

      const seamStrength = clamp(1 - Math.abs(nx) / 0.028, 0, 1) * clamp(1 - manhattan / diamondMid, 0, 1);
      if (seamStrength > 0) {
        color = blend(color, [255, 244, 214, Math.round(seamStrength * 110)]);
      }

      const sparkDistance = Math.sqrt((nx + 0.16) ** 2 + (ny + 0.16) ** 2);
      const sparkGlow = clamp(1 - sparkDistance / 0.1, 0, 1);
      if (sparkGlow > 0) {
        color = blend(color, [131, 206, 228, Math.round(sparkGlow * 210)]);
      }

      const sparkCore = clamp(1 - sparkDistance / 0.045, 0, 1);
      if (sparkCore > 0) {
        color = blend(color, [243, 250, 255, Math.round(sparkCore * 255)]);
      }

      if (!insideShell && !isTray) {
        color = [0, 0, 0, 0];
      }

      if (isTray && color[3] > 0) {
        const trayLift = clamp(1 - distance / 0.52, 0, 1);
        color = blend(color, [255, 241, 211, Math.round(trayLift * 18)]);
      }

      buffer[offset] = color[0];
      buffer[offset + 1] = color[1];
      buffer[offset + 2] = color[2];
      buffer[offset + 3] = color[3];
    }
  }

  return buffer;
}

async function main() {
  await mkdir(buildDir, { recursive: true });

  const mainPixels = createPixelBuffer(mainIconSize, 'app');
  const mainPngBuffer = createPng(mainPixels, mainIconSize);
  const trayPixels = createPixelBuffer(trayIconSize, 'tray');
  const trayPngBuffer = createPng(trayPixels, trayIconSize);

  const icoImages = icoSizes.map((size) => ({
    size,
    buffer: createPng(createPixelBuffer(size, 'app'), size)
  }));
  const icoBuffer = createIco(icoImages);

  await writeFile(pngPath, mainPngBuffer);
  await writeFile(trayPngPath, trayPngBuffer);
  await writeFile(icoPath, icoBuffer);

  console.log(`Icon written: ${pngPath}`);
  console.log(`Icon written: ${trayPngPath}`);
  console.log(`Icon written: ${icoPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
