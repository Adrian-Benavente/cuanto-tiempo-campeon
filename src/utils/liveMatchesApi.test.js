const {
  getCacheControl,
  RECENT_CACHE_CONTROL,
  UPCOMING_CACHE_CONTROL,
} = require("../../api/live-matches");

describe("live-matches cache headers", () => {
  it("uses long cache for recent mode", () => {
    expect(getCacheControl("recent")).toBe(RECENT_CACHE_CONTROL);
    expect(RECENT_CACHE_CONTROL).toContain("s-maxage=86400");
  });

  it("uses short cache for upcoming mode", () => {
    expect(getCacheControl("upcoming")).toBe(UPCOMING_CACHE_CONTROL);
    expect(UPCOMING_CACHE_CONTROL).toContain("s-maxage=300");
  });

  it("uses short cache for idle mode", () => {
    expect(getCacheControl("idle")).toContain("s-maxage=300");
  });
});
