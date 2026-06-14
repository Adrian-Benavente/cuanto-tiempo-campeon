const {
  getCacheControl,
  LIVE_CACHE_CONTROL,
} = require("../../api/live-matches");

describe("live-matches cache headers", () => {
  it("uses a 15 second CDN cache for live mode", () => {
    expect(getCacheControl("live")).toBe(LIVE_CACHE_CONTROL);
    expect(LIVE_CACHE_CONTROL).toContain("s-maxage=15");
  });

  it("keeps longer cache for recent and idle modes", () => {
    expect(getCacheControl("recent")).toContain("s-maxage=86400");
    expect(getCacheControl("idle")).toContain("s-maxage=300");
  });
});
