const { fetchMatchesForYear } = require("./fetch-matches");
const {
  buildBracketLookup,
  buildKnockoutBracket,
  fetchBracketPayload,
  getEmptyKnockoutBracket,
} = require("./fetch-bracket");
const { fetchStandingsForYear, getEmptyStandings } = require("./fetch-world-cup-standings");
const { resolveKnockoutSideName } = require("./resolve-bracket-ref");
const { getCurrentWorldCupYear, getMatchDate } = require("./recent-matches");

const TOURNAMENT_START = new Date("2026-06-11T16:00:00.000Z");
const TOURNAMENT_END = new Date("2026-07-19T18:00:00.000Z");

const FIXTURE_CACHE_DURING =
  "public, s-maxage=21600, stale-while-revalidate=86400";
const FIXTURE_CACHE_PRE =
  "public, s-maxage=86400, stale-while-revalidate=604800";

const KNOCKOUT_STAGES = new Set([
  "round_of_32",
  "r32",
  "round_of_16",
  "r16",
  "quarter_final",
  "qf",
  "semi_final",
  "sf",
  "third_place",
  "thirdplace",
  "final",
]);

function normalizeStage(stage) {
  return String(stage ?? "")
    .trim()
    .toLowerCase()
    .replace("thirdplace", "third_place");
}

function isKnockoutMatch(match) {
  const stage = normalizeStage(match?.stage ?? match?.stageRaw);
  return KNOCKOUT_STAGES.has(stage);
}

function getMatchId(match) {
  return String(match?.id ?? match?.matchId ?? "");
}

function enrichMatchesWithBracket(matches, bracketLookup, { standings } = {}) {
  if (!bracketLookup?.size) {
    return matches;
  }

  return (Array.isArray(matches) ? matches : []).map((match) => {
    if (!isKnockoutMatch(match)) {
      return match;
    }

    const slot = bracketLookup.get(getMatchId(match));

    if (!slot) {
      return match;
    }

    const enriched = { ...match };
    const context = { standings, matches };

    const resolvedHome = resolveKnockoutSideName({
      match,
      slot,
      side: "home",
      ...context,
    });
    const resolvedAway = resolveKnockoutSideName({
      match,
      slot,
      side: "away",
      ...context,
    });

    if (resolvedHome) {
      enriched.homeTeam = resolvedHome;
      enriched.home = resolvedHome;
    }

    if (resolvedAway) {
      enriched.awayTeam = resolvedAway;
      enriched.away = resolvedAway;
    }

    if (slot.homeRef) {
      enriched.homeRef = slot.homeRef;
    }

    if (slot.awayRef) {
      enriched.awayRef = slot.awayRef;
    }

    return enriched;
  });
}

function isWorldCupInProgress(now = new Date()) {
  return now >= TOURNAMENT_START && now <= TOURNAMENT_END;
}

function sortMatchesChronologically(matches) {
  return (Array.isArray(matches) ? matches : []).slice().sort((left, right) => {
    const dateDiff = getMatchDate(left) - getMatchDate(right);

    if (dateDiff !== 0) {
      return dateDiff;
    }

    const kickoffLeft = left?.kickoff ?? "";
    const kickoffRight = right?.kickoff ?? "";

    return String(kickoffLeft).localeCompare(String(kickoffRight));
  });
}

function getFixtureCacheControl(now = new Date()) {
  if (now >= TOURNAMENT_START && now <= TOURNAMENT_END) {
    return FIXTURE_CACHE_DURING;
  }

  return FIXTURE_CACHE_PRE;
}

function getEmptyFixturePayload(now = new Date(), source = "fallback") {
  const year = getCurrentWorldCupYear(now);

  return {
    year,
    matches: [],
    standings: getEmptyStandings(),
    bracket: getEmptyKnockoutBracket(year),
    source,
  };
}

async function getWorldCupFixture(apiKey, now = new Date()) {
  const year = getCurrentWorldCupYear(now);

  if (!year) {
    return getEmptyFixturePayload(now, apiKey ? "zafronix" : "fallback");
  }

  if (!apiKey) {
    return {
      year,
      matches: [],
      standings: getEmptyStandings(),
      bracket: getEmptyKnockoutBracket(year),
      source: "fallback",
    };
  }

  try {
    const [matches, standings, bracketPayload] = await Promise.all([
      fetchMatchesForYear(year, apiKey),
      fetchStandingsForYear(year, apiKey),
      fetchBracketPayload(year, apiKey),
    ]);

    const sortedMatches = sortMatchesChronologically(matches);
    const bracketLookup = bracketPayload
      ? buildBracketLookup(bracketPayload)
      : new Map();
    const bracket = bracketPayload
      ? buildKnockoutBracket(bracketPayload, sortedMatches, standings)
      : getEmptyKnockoutBracket(year);

    return {
      year,
      matches: enrichMatchesWithBracket(sortedMatches, bracketLookup, { standings }),
      standings,
      bracket,
      source: "zafronix",
    };
  } catch (error) {
    console.error("Failed to fetch world cup fixture:", error);

    return {
      year,
      matches: [],
      standings: getEmptyStandings(),
      bracket: getEmptyKnockoutBracket(year),
      source: "fallback",
    };
  }
}

module.exports = {
  FIXTURE_CACHE_DURING,
  FIXTURE_CACHE_PRE,
  enrichMatchesWithBracket,
  getEmptyFixturePayload,
  getFixtureCacheControl,
  getWorldCupFixture,
  isWorldCupInProgress,
  sortMatchesChronologically,
};
