import {
  extractDominantColorsFromImageData,
  getFlagSvgUrl,
} from "./extractFlagColors";

function createImageData(pixels) {
  const height = pixels.length;
  const width = pixels[0]?.length ?? 0;
  const imageData = {
    data: new Uint8ClampedArray(width * height * 4),
    width,
    height,
  };

  pixels.forEach((row, rowIndex) => {
    row.forEach((pixel, columnIndex) => {
      const offset = (rowIndex * row.length + columnIndex) * 4;
      imageData.data[offset] = pixel[0];
      imageData.data[offset + 1] = pixel[1];
      imageData.data[offset + 2] = pixel[2];
      imageData.data[offset + 3] = pixel[3] ?? 255;
    });
  });

  return imageData;
}

describe("extractFlagColors", () => {
  it("builds the CDN url for a flag code", () => {
    expect(getFlagSvgUrl("ar")).toBe(
      "https://cdn.jsdelivr.net/npm/flag-icons@7.5.0/flags/4x3/ar.svg"
    );
    expect(getFlagSvgUrl("gb-eng")).toBe(
      "https://cdn.jsdelivr.net/npm/flag-icons@7.5.0/flags/4x3/gb-eng.svg"
    );
  });

  it("extracts dominant saturated colors and deprioritizes white", () => {
    const imageData = createImageData([
      [
        [255, 255, 255, 255],
        [255, 255, 255, 255],
        [117, 170, 219, 255],
      ],
      [
        [255, 255, 255, 255],
        [117, 170, 219, 255],
        [117, 170, 219, 255],
      ],
      [
        [117, 170, 219, 255],
        [117, 170, 219, 255],
        [255, 255, 255, 255],
      ],
    ]);

    const colors = extractDominantColorsFromImageData(imageData, {
      maxColors: 2,
    });

    expect(colors).toHaveLength(1);
    expect(colors[0]).not.toBe("#ffffff");
  });

  it("ignores transparent pixels", () => {
    const imageData = createImageData([
      [
        [0, 0, 0, 0],
        [200, 16, 46, 255],
        [200, 16, 46, 255],
      ],
    ]);

    expect(extractDominantColorsFromImageData(imageData)).toEqual(["#c81828"]);
  });
});
