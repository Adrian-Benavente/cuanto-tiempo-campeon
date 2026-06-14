import { resolveFlagCode } from "./countryAssets";

describe("resolveFlagCode", () => {
  it("maps England to gb-eng", () => {
    expect(resolveFlagCode({ slug: "inglaterra", countryCode: "GB" })).toBe(
      "gb-eng"
    );
  });

  it("uses country code for standard nations", () => {
    expect(resolveFlagCode({ slug: "argentina", countryCode: "AR" })).toBe(
      "ar"
    );
  });

  it("returns null when country code is missing", () => {
    expect(resolveFlagCode({ slug: "unknown" })).toBeNull();
  });
});
