const FLAG_ICONS_VERSION = "7.5.0";
const COLOR_CACHE = new Map();

const QUANTIZE_STEP = 16;
const MIN_ALPHA = 128;
const LIGHT_COLOR_THRESHOLD = 240;

function quantizeChannel(channel) {
  return Math.min(
    255,
    Math.floor(channel / QUANTIZE_STEP) * QUANTIZE_STEP + QUANTIZE_STEP / 2
  );
}

function rgbToHex(r, g, b) {
  const toHex = (value) => value.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function isLightColor(r, g, b) {
  return (
    r >= LIGHT_COLOR_THRESHOLD &&
    g >= LIGHT_COLOR_THRESHOLD &&
    b >= LIGHT_COLOR_THRESHOLD
  );
}

export function getFlagSvgUrl(flagCode) {
  return `https://cdn.jsdelivr.net/npm/flag-icons@${FLAG_ICONS_VERSION}/flags/4x3/${flagCode}.svg`;
}

export function extractDominantColorsFromImageData(
  imageData,
  { maxColors = 3 } = {}
) {
  const buckets = new Map();

  for (let index = 0; index < imageData.data.length; index += 4) {
    const red = imageData.data[index];
    const green = imageData.data[index + 1];
    const blue = imageData.data[index + 2];
    const alpha = imageData.data[index + 3];

    if (alpha < MIN_ALPHA) {
      continue;
    }

    const quantizedRed = quantizeChannel(red);
    const quantizedGreen = quantizeChannel(green);
    const quantizedBlue = quantizeChannel(blue);
    const key = `${quantizedRed},${quantizedGreen},${quantizedBlue}`;

    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  const rankedColors = Array.from(buckets.entries())
    .map(([key, count]) => {
      const [red, green, blue] = key.split(",").map(Number);
      return {
        count,
        hex: rgbToHex(red, green, blue),
        isLight: isLightColor(red, green, blue),
      };
    })
    .sort((a, b) => b.count - a.count);

  const saturatedColors = rankedColors.filter((color) => !color.isLight);
  const prioritizedColors =
    saturatedColors.length > 0 ? saturatedColors : rankedColors;

  return prioritizedColors.slice(0, maxColors).map((color) => color.hex);
}

export function extractDominantColors(image, options = {}) {
  const canvas = document.createElement("canvas");
  const width = options.width ?? 120;
  const height = options.height ?? 90;
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    return [];
  }

  context.drawImage(image, 0, 0, width, height);
  const imageData = context.getImageData(0, 0, width, height);

  return extractDominantColorsFromImageData(imageData, options);
}

function loadFlagImage(flagCode) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error(`Failed to load flag image for "${flagCode}"`));
    image.src = getFlagSvgUrl(flagCode);
  });
}

export async function getDominantFlagColors(flagCode, options = {}) {
  if (!flagCode) {
    return [];
  }

  if (COLOR_CACHE.has(flagCode)) {
    return COLOR_CACHE.get(flagCode);
  }

  const image = await loadFlagImage(flagCode);
  const colors = extractDominantColors(image, options);

  COLOR_CACHE.set(flagCode, colors);
  return colors;
}
