import { buildFlagGradient, getDefaultGradient } from "./flagGradient";

describe("flagGradient", () => {
  it("returns the default gradient when no colors are provided", () => {
    expect(buildFlagGradient()).toBe(getDefaultGradient());
    expect(buildFlagGradient([])).toBe(getDefaultGradient());
  });

  it("builds a single-color gradient with a light center", () => {
    expect(buildFlagGradient(["#75aadb"])).toBe(
      "linear-gradient(45deg, #75aadb 0%, #ffffff 35%, #ffffff 63%, #75aadb 100%)"
    );
  });

  it("builds a two-color gradient", () => {
    expect(buildFlagGradient(["#0055a4", "#ef4135"])).toBe(
      "linear-gradient(45deg, #0055a4 0%, #ffffff 35%, #ffffff 63%, #ef4135 100%)"
    );
  });

  it("builds a three-color gradient", () => {
    expect(buildFlagGradient(["#009b3a", "#fedf00", "#002776"])).toBe(
      "linear-gradient(45deg, #009b3a 0%, #fedf00 35%, #fedf00 63%, #002776 100%)"
    );
  });
});
