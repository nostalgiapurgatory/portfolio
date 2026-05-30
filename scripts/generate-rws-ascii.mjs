import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";
const execFileAsync = promisify(execFile);

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "public", "data");
const OUT_ASCII = path.join(OUT_DIR, "rws-ascii-cards.json");
const OUT_SOURCE_MAP = path.join(OUT_DIR, "rws-card-source-map.json");

const SOURCE_IMAGE_BASE = "https://steve-p.org/cards/pix/";
const SOURCE_IMAGE_DEFAULT_DIR = "C:/Users/Jaden Andrea/Documents/Graphic Design Resources";
const SOURCE_IMAGE_DIR = process.env.TAROT_SOURCE_DIR
  ? path.resolve(ROOT, process.env.TAROT_SOURCE_DIR)
  : SOURCE_IMAGE_DEFAULT_DIR;
const AIC_EXECUTABLE = process.env.AIC_BIN
  ? path.resolve(ROOT, process.env.AIC_BIN)
  : path.join(
    ROOT,
    "scripts",
    "tools",
    "ascii-image-converter",
    "ascii-image-converter_Windows_amd64_64bit",
    process.platform === "win32" ? "ascii-image-converter.exe" : "ascii-image-converter"
  );
const AIC_MAP = "   ``''..,,::;;ii11ttffllLCC00OO";

const CARD_WIDTH = 64;
const CARD_HEIGHT = 96;
const INNER_WIDTH = CARD_WIDTH - 2;
const INNER_HEIGHT = CARD_HEIGHT - 2;

const FACE_FEATURE_GLYPHS = "  ·.:;ioO";
const MICRO_FACE_GLYPHS = " `'.,:oO0";
const EDGE_GLYPHS = {
  horizontal: "─",
  vertical: "│",
  diagPos: "╱",
  diagNeg: "╲"
};

const MAJOR_ARCANA = [
  "THE FOOL",
  "THE MAGICIAN",
  "THE HIGH PRIESTESS",
  "THE EMPRESS",
  "THE EMPEROR",
  "THE HIEROPHANT",
  "THE LOVERS",
  "THE CHARIOT",
  "STRENGTH",
  "THE HERMIT",
  "WHEEL OF FORTUNE",
  "JUSTICE",
  "THE HANGED MAN",
  "DEATH",
  "TEMPERANCE",
  "THE DEVIL",
  "THE TOWER",
  "THE STAR",
  "THE MOON",
  "THE SUN",
  "JUDGEMENT",
  "THE WORLD"
];

const SUIT_MAP = {
  C: "CUPS",
  P: "PENTACLES",
  S: "SWORDS",
  W: "WANDS"
};

const RANK_MAP = {
  "02": "TWO",
  "03": "THREE",
  "04": "FOUR",
  "05": "FIVE",
  "06": "SIX",
  "07": "SEVEN",
  "08": "EIGHT",
  "09": "NINE",
  "0A": "TEN",
  "10": "ACE",
  J1: "PAGE",
  J2: "KNIGHT",
  QU: "QUEEN",
  KI: "KING"
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeValues(values) {
  const sorted = values.slice().sort((a, b) => a - b);
  const low = sorted[Math.floor(sorted.length * 0.01)];
  const high = sorted[Math.floor(sorted.length * 0.99)];
  const span = Math.max(1e-6, high - low);
  return values.map((value) => clamp((value - low) / span, 0, 1));
}

function quantile(values, q) {
  if (!values.length) {
    return 0;
  }
  const sorted = values.slice().sort((a, b) => a - b);
  const index = Math.floor(clamp(q, 0, 1) * (sorted.length - 1));
  return sorted[index];
}

function dilateMask(mask, width, height, radius) {
  const output = new Array(mask.length).fill(false);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let found = false;
      for (let dy = -radius; dy <= radius && !found; dy += 1) {
        const ny = y + dy;
        if (ny < 0 || ny >= height) {
          continue;
        }
        for (let dx = -radius; dx <= radius; dx += 1) {
          const nx = x + dx;
          if (nx < 0 || nx >= width) {
            continue;
          }
          if (mask[ny * width + nx]) {
            found = true;
            break;
          }
        }
      }
      output[y * width + x] = found;
    }
  }
  return output;
}

function connectedComponents(mask, width, height) {
  const visited = new Uint8Array(mask.length);
  const components = [];
  const neighbors = [-1, 1, -width, width];

  for (let idx = 0; idx < mask.length; idx += 1) {
    if (!mask[idx] || visited[idx]) {
      continue;
    }

    const queue = [idx];
    const pixels = [];
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    let sumX = 0;
    let sumY = 0;
    visited[idx] = 1;

    while (queue.length) {
      const current = queue.pop();
      const x = current % width;
      const y = Math.floor(current / width);

      pixels.push(current);
      sumX += x;
      sumY += y;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;

      neighbors.forEach((offset) => {
        const next = current + offset;
        if (next < 0 || next >= mask.length || visited[next] || !mask[next]) {
          return;
        }
        const nx = next % width;
        const ny = Math.floor(next / width);
        if (Math.abs(nx - x) > 1 || Math.abs(ny - y) > 1) {
          return;
        }
        visited[next] = 1;
        queue.push(next);
      });
    }

    components.push({
      pixels,
      area: pixels.length,
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
      cx: sumX / pixels.length,
      cy: sumY / pixels.length
    });
  }

  return components;
}

function estimateLineArtScore(values) {
  const extremeCount = values.reduce((count, value) => {
    return count + (value < 0.12 || value > 0.88 ? 1 : 0);
  }, 0);
  return extremeCount / Math.max(1, values.length);
}

function buildLikelyAnatomyMask(inkMap, width, height) {
  const inkThreshold = quantile(inkMap, 0.68);
  const inkMask = inkMap.map((value) => value >= inkThreshold);
  const components = connectedComponents(inkMask, width, height)
    .filter((component) => component.area >= 140)
    .filter((component) => component.width >= 6 && component.height >= 12)
    .sort((a, b) => b.area - a.area)
    .slice(0, 4);
  const anatomyMask = new Array(width * height).fill(false);

  components.forEach((component) => {
    component.pixels.forEach((pixelIdx) => {
      const x = pixelIdx % width;
      const y = Math.floor(pixelIdx / width);
      const nx = (x - component.minX) / Math.max(1, component.width - 1);
      const ny = (y - component.minY) / Math.max(1, component.height - 1);
      const isFaceBand = ny >= 0.04 && ny <= 0.3 && nx >= 0.23 && nx <= 0.77;
      const isLeftHandBand = ny >= 0.32 && ny <= 0.72 && nx >= 0.02 && nx <= 0.34;
      const isRightHandBand = ny >= 0.32 && ny <= 0.72 && nx >= 0.66 && nx <= 0.98;
      if (isFaceBand || isLeftHandBand || isRightHandBand) {
        anatomyMask[pixelIdx] = true;
      }
    });
  });

  return dilateMask(anatomyMask, width, height, 1);
}

function buildLikelyFaceMask(inkMap, width, height) {
  const inkThreshold = quantile(inkMap, 0.68);
  const inkMask = inkMap.map((value) => value >= inkThreshold);
  const components = connectedComponents(inkMask, width, height)
    .filter((component) => component.area >= 140)
    .filter((component) => component.width >= 6 && component.height >= 12)
    .sort((a, b) => b.area - a.area)
    .slice(0, 4);
  const faceMask = new Array(width * height).fill(false);

  components.forEach((component) => {
    component.pixels.forEach((pixelIdx) => {
      const x = pixelIdx % width;
      const y = Math.floor(pixelIdx / width);
      const nx = (x - component.minX) / Math.max(1, component.width - 1);
      const ny = (y - component.minY) / Math.max(1, component.height - 1);
      const inHeadBand = ny >= 0.05 && ny <= 0.26 && nx >= 0.22 && nx <= 0.78;
      if (inHeadBand) {
        faceMask[pixelIdx] = true;
      }
    });
  });

  return dilateMask(faceMask, width, height, 1);
}

function buildMicroFaceMask(faceMask, gradMagnitude, width, height) {
  const candidateMask = faceMask.map((value, index) => value && gradMagnitude[index] >= quantile(gradMagnitude, 0.9));
  const components = connectedComponents(candidateMask, width, height)
    .filter((component) => component.area >= 2 && component.area <= 42)
    .filter((component) => component.width <= 11 && component.height <= 11)
    .filter((component) => component.height >= 1 && component.width >= 1);
  const microMask = new Array(width * height).fill(false);

  components.forEach((component) => {
    component.pixels.forEach((idx) => {
      microMask[idx] = true;
    });
  });

  return dilateMask(microMask, width, height, 1);
}

function stripAnsi(value) {
  return String(value || "").replace(/\x1b\[[0-9;]*m/g, "");
}

function normalizeConverterFrame(rawText, targetWidth, targetHeight) {
  const cleaned = stripAnsi(rawText).replace(/\r/g, "");
  let lines = cleaned.split("\n");
  let sourceWidth = 0;
  const normalized = [];

  while (lines.length && !lines[0].trim()) {
    lines.shift();
  }
  while (lines.length && !lines[lines.length - 1].trim()) {
    lines.pop();
  }

  if (!lines.length) {
    return new Array(targetHeight).fill(Array(targetWidth + 1).join(" "));
  }

  lines.forEach((line) => {
    sourceWidth = Math.max(sourceWidth, line.length);
  });
  sourceWidth = Math.max(1, sourceWidth);

  if (lines.length === targetHeight && sourceWidth === targetWidth) {
    return lines.map((line) => line.padEnd(targetWidth, " "));
  }

  for (let row = 0; row < targetHeight; row += 1) {
    const sy = lines.length === 1 ? 0 : Math.round((row / (targetHeight - 1)) * (lines.length - 1));
    const sourceLine = String(lines[sy] || "").padEnd(sourceWidth, " ");
    let out = "";
    for (let col = 0; col < targetWidth; col += 1) {
      const sx = sourceWidth === 1 ? 0 : Math.round((col / (targetWidth - 1)) * (sourceWidth - 1));
      out += sourceLine.charAt(sx);
    }
    normalized.push(out);
  }

  return normalized;
}

async function convertWithAsciiImageConverter(imagePath, width, height) {
  const args = [
    imagePath,
    "--dimensions",
    width + "," + height,
    "--map",
    AIC_MAP
  ];
  const { stdout } = await execFileAsync(AIC_EXECUTABLE, args, {
    windowsHide: true,
    maxBuffer: 1024 * 1024 * 20
  });
  return normalizeConverterFrame(stdout, width, height);
}

function computeSobel(data, width, height) {
  const gxKernel = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1]
  ];
  const gyKernel = [
    [1, 2, 1],
    [0, 0, 0],
    [-1, -2, -1]
  ];
  const gx = new Array(width * height).fill(0);
  const gy = new Array(width * height).fill(0);

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      let sx = 0;
      let sy = 0;
      for (let ky = -1; ky <= 1; ky += 1) {
        for (let kx = -1; kx <= 1; kx += 1) {
          const px = x + kx;
          const py = y + ky;
          const value = data[py * width + px];
          sx += gxKernel[ky + 1][kx + 1] * value;
          sy += gyKernel[ky + 1][kx + 1] * value;
        }
      }
      const idx = y * width + x;
      gx[idx] = sx;
      gy[idx] = sy;
    }
  }

  return { gx, gy };
}

function chooseEdgeGlyph(gx, gy) {
  const angle = Math.atan2(gy, gx);
  const absAngle = Math.abs(angle);
  const eighth = Math.PI / 8;

  if (absAngle <= eighth || absAngle >= Math.PI - eighth) {
    return EDGE_GLYPHS.vertical;
  }
  if (absAngle >= Math.PI / 2 - eighth && absAngle <= Math.PI / 2 + eighth) {
    return EDGE_GLYPHS.horizontal;
  }
  if (angle > 0) {
    return EDGE_GLYPHS.diagNeg;
  }
  return EDGE_GLYPHS.diagPos;
}

function isSkinPixel(r, g, b) {
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

  if (y < 55 || y > 245) {
    return false;
  }

  return (
    r > 45 && g > 34 && b > 20 &&
    r > g && r > b &&
    Math.abs(r - g) > 8 &&
    cr >= 132 && cr <= 183 &&
    cb >= 80 && cb <= 136
  );
}

function encodeAsciiFrame(baseLines, gradients, featureMask, faceMask, microFaceMask, detailStrength, thresholdBands, width, height) {
  const lines = [];
  const featureLevels = FACE_FEATURE_GLYPHS.length - 1;
  const microLevels = MICRO_FACE_GLYPHS.length - 1;

  for (let y = 0; y < height; y += 1) {
    let row = "";

    for (let x = 0; x < width; x += 1) {
      const idx = y * width + x;
      const gx = gradients.gx[idx];
      const gy = gradients.gy[idx];
      const gradMag = Math.sqrt(gx * gx + gy * gy);
      const detail = detailStrength[idx];
      const baseGlyph = baseLines && baseLines[y] ? baseLines[y].charAt(x) || " " : " ";

      let glyph = baseGlyph;

      if (faceMask[idx]) {
        if (microFaceMask[idx] && detail > thresholdBands.microFaceThreshold) {
          const microIndex = Math.round(clamp((detail - thresholdBands.microFaceThreshold) / Math.max(1e-6, 1 - thresholdBands.microFaceThreshold), 0, 1) * microLevels);
          glyph = MICRO_FACE_GLYPHS.charAt(microIndex);
        } else if (detail > thresholdBands.faceFineOutline && gradMag > thresholdBands.faceOutlineStrong) {
          glyph = chooseEdgeGlyph(gx, gy);
        } else if (detail > thresholdBands.faceFeatureThreshold) {
          const featureIndex = Math.round(clamp((detail - thresholdBands.faceFeatureThreshold) / Math.max(1e-6, 1 - thresholdBands.faceFeatureThreshold), 0, 1) * featureLevels);
          glyph = FACE_FEATURE_GLYPHS.charAt(featureIndex);
        }
      } else if (featureMask[idx]) {
        if (detail > thresholdBands.handOutlineThreshold && gradMag > thresholdBands.faceEdgeThreshold) {
          glyph = chooseEdgeGlyph(gx, gy);
        } else if (detail > thresholdBands.handDetailThreshold) {
          glyph = FACE_FEATURE_GLYPHS.charAt(Math.max(0, Math.floor(featureLevels * 0.5)));
        }
      }

      row += glyph;
    }

    lines.push(row);
  }

  const horizontal = Array(width + 1).join("─");
  return ["┌" + horizontal + "┐", ...lines.map((line) => "│" + line + "│"), "└" + horizontal + "┘"].join("\n");
}

async function fetchBuffer(url) {
  const tempPath = path.join(os.tmpdir(), "rws-ascii-" + Math.random().toString(36).slice(2) + ".png");
  const psCommand = `Invoke-WebRequest -Uri "${url}" -OutFile "${tempPath}"`;
  try {
    await execFileAsync("powershell", ["-NoProfile", "-Command", psCommand], { windowsHide: true });
    return await fs.readFile(tempPath);
  } finally {
    await fs.rm(tempPath, { force: true });
  }
}

async function imageToAscii(buffer, sourcePath) {
  let converterInputPath = sourcePath || "";
  let tempPath = "";
  let baseLines;

  if (!converterInputPath) {
    tempPath = path.join(os.tmpdir(), "rws-aic-" + Math.random().toString(36).slice(2) + ".png");
    await sharp(buffer).png().toFile(tempPath);
    converterInputPath = tempPath;
  }

  try {
    baseLines = await convertWithAsciiImageConverter(converterInputPath, INNER_WIDTH, INNER_HEIGHT);
  } finally {
    if (tempPath) {
      await fs.rm(tempPath, { force: true });
    }
  }

  const { data, info } = await sharp(buffer)
    .rotate()
    .normalise()
    .sharpen({ sigma: 1.25, flat: 1.25, jagged: 2.9 })
    .resize(INNER_WIDTH, INNER_HEIGHT, { fit: "cover", position: "centre" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels;
  const luminanceBase = [];
  const skinMask = [];
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    luminanceBase.push((0.299 * r + 0.587 * g + 0.114 * b) / 255);
    skinMask.push(isSkinPixel(r, g, b));
  }

  const normalized = normalizeValues(luminanceBase);
  const lineArtScore = estimateLineArtScore(normalized);
  const isLineArt = lineArtScore >= 0.72;
  const baseInk = normalizeValues(normalized.map((value) => 1 - value));
  const gradients = computeSobel(baseInk, INNER_WIDTH, INNER_HEIGHT);
  const gradMagnitude = gradients.gx.map((gx, index) => Math.sqrt(gx * gx + gradients.gy[index] * gradients.gy[index]));
  const detailStrength = normalizeValues(gradMagnitude);
  const expandedSkinMask = dilateMask(skinMask, INNER_WIDTH, INNER_HEIGHT, 1);
  const anatomyMask = buildLikelyAnatomyMask(baseInk, INNER_WIDTH, INNER_HEIGHT);
  const faceMask = buildLikelyFaceMask(baseInk, INNER_WIDTH, INNER_HEIGHT);
  const featureMask = expandedSkinMask.map((value, index) => value || anatomyMask[index]);
  const microFaceMask = buildMicroFaceMask(faceMask, gradMagnitude, INNER_WIDTH, INNER_HEIGHT);

  const thresholdBands = {
    faceFeatureThreshold: quantile(detailStrength, isLineArt ? 0.68 : 0.72),
    faceEdgeThreshold: quantile(gradMagnitude, isLineArt ? 0.78 : 0.82),
    faceOutlineStrong: quantile(gradMagnitude, isLineArt ? 0.84 : 0.88),
    faceFineOutline: quantile(detailStrength, isLineArt ? 0.78 : 0.84),
    microFaceThreshold: quantile(detailStrength, isLineArt ? 0.72 : 0.76),
    handOutlineThreshold: quantile(detailStrength, isLineArt ? 0.74 : 0.8),
    handDetailThreshold: quantile(detailStrength, isLineArt ? 0.62 : 0.68)
  };

  return encodeAsciiFrame(baseLines, gradients, featureMask, faceMask, microFaceMask, detailStrength, thresholdBands, INNER_WIDTH, INNER_HEIGHT);
}

function cardKeyFromCode(code) {
  const [, group, raw] = code.split("-");
  if (group === "T") {
    const index = parseInt(raw, 10);
    return MAJOR_ARCANA[index];
  }

  const suit = SUIT_MAP[group];
  const rank = RANK_MAP[raw];
  if (!suit || !rank) {
    throw new Error("Unsupported code: " + code);
  }

  return rank + " OF " + suit;
}

function collectCardCodes() {
  const trumps = Array.from({ length: 22 }, (_, index) => {
    return "RWSa-T-" + String(index).padStart(2, "0");
  });
  const suitRanks = ["02", "03", "04", "05", "06", "07", "08", "09", "0A", "10", "J1", "J2", "QU", "KI"];
  const suits = ["C", "P", "S", "W"];
  const minors = [];

  suits.forEach((suit) => {
    suitRanks.forEach((rank) => {
      minors.push("RWSa-" + suit + "-" + rank);
    });
  });

  return trumps.concat(minors);
}

function normalizeName(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .trim();
}

function keyAliasesFromCardKey(cardKey) {
  const aliases = new Set();
  const upper = cardKey.toUpperCase();
  aliases.add(normalizeName(upper));
  aliases.add(normalizeName(upper.replace(/\bTHE\b/g, "")));
  aliases.add(normalizeName(upper.replace(/\bOF\b/g, "")));
  aliases.add(normalizeName(upper.replace(/\bTHE\b/g, "").replace(/\bOF\b/g, "")));
  return [...aliases];
}

function orderedCardKeysByOrdinal() {
  const major = MAJOR_ARCANA.slice();
  const pipRanks = ["ACE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN"];
  const courtRanks = ["PAGE", "KNIGHT", "QUEEN", "KING"];
  const suitsInOrder = ["PENTACLES", "WANDS", "CUPS", "SWORDS"];
  const ordered = [];

  major.forEach((title) => ordered.push(title));
  suitsInOrder.forEach((suit) => {
    pipRanks.forEach((rank) => ordered.push(rank + " OF " + suit));
    courtRanks.forEach((rank) => ordered.push(rank + " OF " + suit));
  });
  return ordered;
}

function cardKeyFromOrdinal(ordinal) {
  const ordered = orderedCardKeysByOrdinal();
  const index = ordinal - 1;
  if (index < 0 || index >= ordered.length) {
    return null;
  }
  return ordered[index];
}

function cardKeyFromFilename(filename, expectedCodes) {
  const stem = path.parse(filename).name;
  const upperStem = stem.toUpperCase();
  const ordinalMatch = upperStem.match(/^([0-9]{1,2})\s+/);
  const codeMatch = upperStem.match(/RWSA-(T|C|P|S|W)-([A-Z0-9]{2})/);
  if (ordinalMatch) {
    const ordinal = parseInt(ordinalMatch[1], 10);
    const key = cardKeyFromOrdinal(ordinal);
    if (key) {
      return key;
    }
  }
  if (codeMatch) {
    return cardKeyFromCode("RWSa-" + codeMatch[1] + "-" + codeMatch[2]);
  }

  const normalizedStem = normalizeName(stem);
  if (!normalizedStem) {
    return null;
  }

  const candidates = [];
  expectedCodes.forEach((code) => {
    const key = cardKeyFromCode(code);
    const aliases = keyAliasesFromCardKey(key);
    aliases.forEach((alias) => {
      if (alias === normalizedStem) {
        candidates.push({ key, score: 1000 });
      } else if (normalizedStem.includes(alias)) {
        candidates.push({ key, score: alias.length });
      } else if (alias.includes(normalizedStem)) {
        candidates.push({ key, score: normalizedStem.length - 5 });
      }
    });
  });

  candidates.sort((a, b) => b.score - a.score);
  return candidates.length ? candidates[0].key : null;
}

async function listImageFilesRecursive(rootDir) {
  const queue = [rootDir];
  const files = [];

  while (queue.length) {
    const current = queue.shift();
    const entries = await fs.readdir(current, { withFileTypes: true });
    entries.forEach((entry) => {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!entry.name.startsWith("__MACOSX")) {
          queue.push(fullPath);
        }
        return;
      }
      if (entry.name.startsWith("._")) {
        return;
      }
      if (/\.(png|jpe?g|webp|bmp|tiff?)$/i.test(entry.name)) {
        files.push(fullPath);
      }
    });
  }

  return files;
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch (_error) {
    return false;
  }
}

async function collectLocalCardImages(codes) {
  const imageEntries = await listImageFilesRecursive(SOURCE_IMAGE_DIR);
  const resolved = new Map();
  const sourceMap = {};

  for (const imagePath of imageEntries) {
    const fileName = path.basename(imagePath);
    const key = cardKeyFromFilename(fileName, codes);
    if (!key || resolved.has(key)) {
      continue;
    }
    resolved.set(key, imagePath);
    sourceMap[key] = imagePath;
  }

  const expectedKeys = codes.map(cardKeyFromCode);
  const missing = expectedKeys.filter((key) => !resolved.has(key));
  if (missing.length) {
    throw new Error(
      "Local tarot source directory does not map all 78 cards. Missing " +
      missing.length +
      " card(s): " +
      missing.slice(0, 10).join(", ") +
      (missing.length > 10 ? ", ..." : "")
    );
  }

  return { resolved, sourceMap };
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const codes = collectCardCodes();
  const sourceMap = {};
  const asciiCards = {};
  let localSource = null;

  if (SOURCE_IMAGE_DIR && await pathExists(SOURCE_IMAGE_DIR)) {
    localSource = await collectLocalCardImages(codes);
    console.log("Using local source directory:", SOURCE_IMAGE_DIR);
  }

  for (const code of codes) {
    const key = cardKeyFromCode(code);
    const imageUrl = SOURCE_IMAGE_BASE + code + ".png";
    const localPath = localSource ? localSource.resolved.get(key) : null;
    const imageBuffer = localPath ? await fs.readFile(localPath) : await fetchBuffer(imageUrl);
    const ascii = await imageToAscii(imageBuffer, localPath || "");

    sourceMap[key] = localPath || imageUrl;
    asciiCards[key] = ascii;
  }

  await fs.writeFile(OUT_SOURCE_MAP, JSON.stringify(sourceMap, null, 2) + "\n", "utf8");
  await fs.writeFile(OUT_ASCII, JSON.stringify(asciiCards, null, 2) + "\n", "utf8");

  console.log("Generated", Object.keys(asciiCards).length, "cards");
  console.log("ASCII size:", CARD_WIDTH + "x" + CARD_HEIGHT);
  console.log("Source map:", OUT_SOURCE_MAP);
  console.log("ASCII data:", OUT_ASCII);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
