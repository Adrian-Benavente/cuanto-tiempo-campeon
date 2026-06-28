import { computeBracketDimensions } from "./useBracketDimensions";

describe("computeBracketDimensions", () => {
  const roundCount = 5;

  it("keeps compact fixed dimensions on mobile widths", () => {
    expect(computeBracketDimensions(375, roundCount)).toEqual({
      matchWidth: 64,
      connectorWidth: 28,
    });
    expect(computeBracketDimensions(640, roundCount)).toEqual({
      matchWidth: 64,
      connectorWidth: 28,
    });
  });

  it("scales match width on desktop to fill the container", () => {
    const dimensions = computeBracketDimensions(900, roundCount);

    expect(dimensions.matchWidth).toBeGreaterThan(64);
    expect(dimensions.connectorWidth).toBe(Math.round(dimensions.matchWidth * (28 / 64)));
  });

  it("caps match width on very wide containers", () => {
    expect(computeBracketDimensions(2000, roundCount).matchWidth).toBe(140);
  });

  it("returns defaults when round count is missing", () => {
    expect(computeBracketDimensions(900, 0)).toEqual({
      matchWidth: 64,
      connectorWidth: 28,
    });
  });
});
