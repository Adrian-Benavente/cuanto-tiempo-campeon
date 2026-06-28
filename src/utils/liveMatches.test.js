jest.mock("../../api/_lib/zafronix-client", () => ({
  zafronixFetch: jest.fn(),
}));

jest.mock("../../api/_lib/fetch-matches", () => ({
  fetchMatchesForYear: jest.fn(),
}));

jest.mock("../../api/_lib/fetch-world-cup-standings", () => ({
  fetchStandingsForYear: jest.fn(),
}));

jest.mock("../../api/_lib/fetch-bracket", () => ({
  ...jest.requireActual("../../api/_lib/fetch-bracket"),
  fetchBracketForYear: jest.fn(),
}));

const { fetchMatchesForYear } = require("../../api/_lib/fetch-matches");
const {
  buildBracketLookup,
  fetchBracketForYear,
} = require("../../api/_lib/fetch-bracket");
const { fetchStandingsForYear } = require("../../api/_lib/fetch-world-cup-standings");
const { getRecentMatches } = require("../../api/_lib/fetch-live-matches");

const PRODUCTION_NOW = new Date("2026-06-14T18:30:00.000Z");

const IN_PROGRESS_MATCH = {
  id: "2026-010",
  status: "scheduled",
  homeTeam: "Germany",
  awayTeam: "Curaçao",
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

const UPCOMING_MATCH = {
  id: "2026-020",
  status: "scheduled",
  homeTeam: "Brazil",
  awayTeam: "Morocco",
  result: null,
  date: "2026-06-14",
  kickoffUtc: "2026-06-14T22:00:00.000Z",
};

describe("getRecentMatches", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchBracketForYear.mockResolvedValue(new Map());
    fetchStandingsForYear.mockResolvedValue({ groups: {} });
  });

  it("returns in-progress matches first, then finished results", async () => {
    fetchMatchesForYear.mockResolvedValue([
      FINISHED_MATCH,
      IN_PROGRESS_MATCH,
      UPCOMING_MATCH,
    ]);

    const payload = await getRecentMatches("test-key", PRODUCTION_NOW, {
      timeZone: "UTC",
    });

    expect(payload).toEqual({
      mode: "recent",
      year: 2026,
      matches: [IN_PROGRESS_MATCH, FINISHED_MATCH],
      upcomingToday: [UPCOMING_MATCH],
      source: "zafronix",
    });
  });

  it("returns only finished matches when nothing is in progress", async () => {
    fetchMatchesForYear.mockResolvedValue([FINISHED_MATCH]);

    const payload = await getRecentMatches("test-key", PRODUCTION_NOW);

    expect(payload).toEqual({
      mode: "recent",
      year: 2026,
      matches: [FINISHED_MATCH],
      upcomingToday: [],
      source: "zafronix",
    });
  });

  it("returns upcoming mode when only today's upcoming matches exist", async () => {
    fetchMatchesForYear.mockResolvedValue([UPCOMING_MATCH]);

    const payload = await getRecentMatches("test-key", PRODUCTION_NOW, {
      timeZone: "UTC",
    });

    expect(payload).toEqual({
      mode: "upcoming",
      year: 2026,
      matches: [],
      upcomingToday: [UPCOMING_MATCH],
      source: "zafronix",
    });
  });

  it("returns idle when there are no matches to show", async () => {
    fetchMatchesForYear.mockResolvedValue([]);

    const payload = await getRecentMatches("test-key", PRODUCTION_NOW);

    expect(payload).toEqual({
      mode: "idle",
      year: 2026,
      matches: [],
      upcomingToday: [],
      source: "zafronix",
    });
  });

  it("resolves knockout placeholders in upcoming matches via bracket data", async () => {
    const upcomingKnockout = {
      id: "2026-073",
      stage: "round_of_32",
      status: "scheduled",
      homeTeam: "2A",
      awayTeam: "2B",
      homeRef: "2A",
      awayRef: "2B",
      result: null,
      date: "2026-06-28",
      kickoffUtc: "2026-06-28T19:00:00.000Z",
    };

    fetchMatchesForYear.mockResolvedValue([upcomingKnockout]);
    fetchBracketForYear.mockResolvedValue(
      buildBracketLookup({
        stages: {
          round_of_32: [
            {
              matchId: "2026-073",
              homeRef: "2A",
              awayRef: "2B",
              home: "Mexico",
              away: "Brazil",
            },
          ],
        },
      })
    );

    const payload = await getRecentMatches("test-key", new Date("2026-06-28T12:00:00.000Z"), {
      timeZone: "UTC",
    });

    expect(payload.mode).toBe("upcoming");
    expect(payload.upcomingToday[0]).toMatchObject({
      homeTeam: "Mexico",
      awayTeam: "Brazil",
    });
  });
});
