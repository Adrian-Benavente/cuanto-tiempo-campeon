import {
  getLivePollInterval,
  IDLE_POLL_MS,
  LIVE_POLL_MS,
} from "../hooks/useSiteExtras";

describe("getLivePollInterval", () => {
  it("polls quickly before the live mode is known", () => {
    expect(getLivePollInterval("idle", false)).toBe(LIVE_POLL_MS);
  });

  it("polls quickly while matches are live", () => {
    expect(getLivePollInterval("live", true)).toBe(LIVE_POLL_MS);
  });

  it("polls slowly when there is no live match", () => {
    expect(getLivePollInterval("recent", true)).toBe(IDLE_POLL_MS);
    expect(getLivePollInterval("idle", true)).toBe(IDLE_POLL_MS);
  });
});
