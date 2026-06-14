jest.mock("../../api/_lib/zafronix-client", () => ({
  zafronixFetch: jest.fn(),
}));

jest.mock("../../api/_lib/fetch-matches", () => ({
  fetchMatchesForYear: jest.fn(),
}));

const { zafronixFetch } = require("../../api/_lib/zafronix-client");
const { fetchMatchesForYear } = require("../../api/_lib/fetch-matches");
const { getLiveOrRecentMatches } = require("../../api/_lib/fetch-live-matches");

const PRODUCTION_NOW = new Date("2026-06-14T18:30:00.000Z");

const LIVE_IN_PROGRESS_MATCH = {
  id: "2026-010",
  status: "scheduled",
  homeTeam: "Germany",
  awayTeam: "Curaçao",
  homeScore: 0,
  awayScore: 0,
  result: null,
  date: "2026-06-14",
  kickoffUtc: "2026-06-14T17:00:00.000Z",
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
  });

  it("falls back to year fixture when the live endpoint returns 402", async () => {
    zafronixFetch.mockRejectedValue(
      new Error(
        'Zafronix request failed (402) for /matches/live: {"error":"live_data_is_pro"}'
      )
    );
    fetchMatchesForYear.mockResolvedValue([LIVE_IN_PROGRESS_MATCH, FINISHED_MATCH]);

    const payload = await getLiveOrRecentMatches("test-key", PRODUCTION_NOW);

    expect(fetchMatchesForYear).toHaveBeenCalledWith(2026, "test-key");
    expect(payload).toEqual({
      mode: "live",
      year: 2026,
      matches: [LIVE_IN_PROGRESS_MATCH],
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
  });
});
