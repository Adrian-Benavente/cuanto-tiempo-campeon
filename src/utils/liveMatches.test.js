jest.mock("../../api/_lib/zafronix-client", () => ({
  zafronixFetch: jest.fn(),
}));

jest.mock("../../api/_lib/fetch-matches", () => ({
  fetchMatchesForYear: jest.fn(),
}));

jest.mock("../../api/_lib/fetch-match-by-id", () => ({
  fetchMatchesByIds: jest.fn(),
}));

const { zafronixFetch } = require("../../api/_lib/zafronix-client");
const { fetchMatchesByIds } = require("../../api/_lib/fetch-match-by-id");
const { fetchMatchesForYear } = require("../../api/_lib/fetch-matches");
const {
  getLiveOrRecentMatches,
  LIVE_MATCHES_CACHE_TTL_MS,
} = require("../../api/_lib/fetch-live-matches");

const PRODUCTION_NOW = new Date("2026-06-14T18:30:00.000Z");

const LIVE_IN_PROGRESS_MATCH = {
  id: "2026-010",
  status: "scheduled",
  homeTeam: "Germany",
  awayTeam: "Curaçao",
  homeScore: null,
  awayScore: null,
  result: null,
  date: "2026-06-14",
  kickoffUtc: "2026-06-14T17:00:00.000Z",
};

const REFRESHED_LIVE_MATCH = {
  ...LIVE_IN_PROGRESS_MATCH,
  goals: [{ minute: 23, team: "home", scorer: "Havertz" }],
};

const FINISHED_MATCH = {
  id: "2026-005",
  status: "finished",
  homeTeam: "Haiti",
  awayTeam: "Scotland",
  homeScore: 0,
  awayScore: 1,
  result: "0-1",
  date: "2026-06-14",
  kickoffUtc: "2026-06-14T01:00:00.000Z",
};

describe("getLiveOrRecentMatches", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchMatchesByIds.mockImplementation(async (matchIds) =>
      matchIds
        .map((matchId) => {
          if (matchId === "2026-010") {
            return REFRESHED_LIVE_MATCH;
          }

          if (matchId === "live-1") {
            return {
              id: "live-1",
              status: "live",
              homeScore: 1,
              awayScore: 0,
            };
          }

          return null;
        })
        .filter(Boolean)
    );
  });

  it("returns live mode from the dedicated endpoint when Pro+ data is available", async () => {
    zafronixFetch.mockResolvedValue({
      matches: [
        {
          id: "live-1",
          status: "live",
          homeScore: 1,
          awayScore: 0,
        },
      ],
    });

    const payload = await getLiveOrRecentMatches("test-key", PRODUCTION_NOW);

    expect(payload).toEqual({
      mode: "live",
      year: 2026,
      matches: [
        {
          id: "live-1",
          status: "live",
          homeScore: 1,
          awayScore: 0,
        },
      ],
      source: "zafronix",
    });
    expect(fetchMatchesForYear).not.toHaveBeenCalled();
    expect(fetchMatchesByIds).toHaveBeenCalledWith(["live-1"], "test-key");
  });

  it("falls back to year fixture when the live endpoint returns 402", async () => {
    zafronixFetch.mockRejectedValue(
      new Error(
        'Zafronix request failed (402) for /matches/live: {"error":"live_data_is_pro"}'
      )
    );
    fetchMatchesForYear.mockResolvedValue([LIVE_IN_PROGRESS_MATCH, FINISHED_MATCH]);

    const payload = await getLiveOrRecentMatches("test-key", PRODUCTION_NOW);

    expect(fetchMatchesForYear).toHaveBeenCalledWith(2026, "test-key", {
      cacheTtlMs: LIVE_MATCHES_CACHE_TTL_MS,
    });
    expect(fetchMatchesByIds).toHaveBeenCalledWith(["2026-010"], "test-key");
    expect(payload).toEqual({
      mode: "live",
      year: 2026,
      matches: [
        {
          ...REFRESHED_LIVE_MATCH,
          homeScore: 1,
          awayScore: 0,
        },
      ],
      source: "zafronix",
      liveSource: "year",
    });
  });

  it("returns recent mode when there are no in-progress matches", async () => {
    zafronixFetch.mockRejectedValue(
      new Error(
        'Zafronix request failed (402) for /matches/live: {"error":"live_data_is_pro"}'
      )
    );
    fetchMatchesForYear.mockResolvedValue([FINISHED_MATCH]);

    const payload = await getLiveOrRecentMatches("test-key", PRODUCTION_NOW);

    expect(payload).toEqual({
      mode: "recent",
      year: 2026,
      matches: [FINISHED_MATCH],
      source: "zafronix",
    });
    expect(fetchMatchesByIds).not.toHaveBeenCalled();
  });
});
