const { resolveCountryMeta } = require("./country-meta");
const { getTeamName } = require("./zafronix-normalize");
const { zafronixFetch } = require("./zafronix-client");

const MIN_YEAR = 1930;
const MAX_YEAR = 2030;
const MIN_YEARS = 2;
const MAX_YEARS = 6;

const HISTORIC_CACHE_CONTROL =
  "public, s-maxage=86400, stale-while-revalidate=604800";
const LIVE_CACHE_CONTROL =
  "public, s-maxage=300, stale-while-revalidate=900";

function pickFirst(entry, keys) {
  for (const key of keys) {
    if (entry?.[key] !== undefined && entry?.[key] !== null) {
      return entry[key];
    }
  }

  return null;
}

function normalizeTeamName(value) {
  const raw = getTeamName(value);

  if (!raw) {
    return null;
  }

  return resolveCountryMeta(raw)?.displayName ?? raw;
}

function normalizePerson(value) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  const name = value.name ?? value.player ?? value.displayName;

  if (!name) {
    return null;
  }

  const goals = value.goals ?? value.goalCount ?? value.goalsScored;

  if (goals !== undefined && goals !== null) {
    return `${name} (${goals})`;
  }

  return name;
}

function normalizeNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeCompareRow(entry) {
  const year = Number(pickFirst(entry, ["year", "tournamentYear", "tournament"]));

  if (!Number.isFinite(year)) {
    return null;
  }

  return {
    year,
    champion: normalizeTeamName(
      pickFirst(entry, ["champion", "winner", "championTeam"])
    ),
    runnerUp: normalizeTeamName(
      pickFirst(entry, ["runnerUp", "runner_up", "runner-up", "secondPlace"])
    ),
    thirdPlace: normalizeTeamName(
      pickFirst(entry, ["thirdPlace", "third_place", "third-place", "bronze"])
    ),
    totalGoals: normalizeNumber(
      pickFirst(entry, ["totalGoals", "total_goals", "goals"])
    ),
    goalsPerMatch: normalizeNumber(
      pickFirst(entry, ["goalsPerMatch", "goals_per_match", "scoringRate"])
    ),
    attendance: normalizeNumber(
      pickFirst(entry, ["attendance", "totalAttendance", "total_attendance"])
    ),
    topScorer: normalizePerson(
      pickFirst(entry, ["topScorer", "top_scorer", "goldenBoot", "golden_boot"])
    ),
    bestPlayer: normalizePerson(
      pickFirst(entry, ["bestPlayer", "best_player", "goldenBall", "golden_ball"])
    ),
  };
}

function extractCompareRows(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.tournaments)) {
    return payload.tournaments;
  }

  if (Array.isArray(payload?.rows)) {
    return payload.rows;
  }

  if (Array.isArray(payload?.compare)) {
    return payload.compare;
  }

  if (payload && typeof payload === "object") {
    const keyedRows = Object.entries(payload)
      .filter(([key]) => /^\d{4}$/.test(key))
      .map(([year, value]) => ({
        year: Number(year),
        ...(typeof value === "object" && value ? value : {}),
      }));

    if (keyedRows.length) {
      return keyedRows;
    }
  }

  return [];
}

function parseYearsParam(yearsParam) {
  if (!yearsParam || typeof yearsParam !== "string") {
    return { error: "years query parameter is required" };
  }

  const years = [
    ...new Set(
      yearsParam
        .split(",")
        .map((value) => Number(value.trim()))
        .filter((value) => Number.isInteger(value))
    ),
  ].sort((left, right) => left - right);

  if (years.length < MIN_YEARS || years.length > MAX_YEARS) {
    return {
      error: `Provide between ${MIN_YEARS} and ${MAX_YEARS} distinct years`,
    };
  }

  if (years.some((year) => year < MIN_YEAR || year > MAX_YEAR)) {
    return {
      error: `Years must be between ${MIN_YEAR} and ${MAX_YEAR}`,
    };
  }

  return { years };
}

function getCompareCacheControl(years = []) {
  return years.includes(2026) ? LIVE_CACHE_CONTROL : HISTORIC_CACHE_CONTROL;
}

function sortRowsByYears(rows = [], years = []) {
  const order = new Map(years.map((year, index) => [year, index]));

  return [...rows].sort(
    (left, right) => (order.get(left.year) ?? 0) - (order.get(right.year) ?? 0)
  );
}

async function getTournamentCompare(apiKey, yearsParam) {
  const parsed = parseYearsParam(yearsParam);

  if (parsed.error) {
    return {
      ok: false,
      status: 400,
      body: { error: parsed.error },
    };
  }

  const { years } = parsed;
  const cacheControl = getCompareCacheControl(years);

  if (!apiKey) {
    return {
      ok: true,
      status: 200,
      cacheControl,
      body: {
        years,
        rows: [],
        source: "fallback",
        warning: "ZAFRONIX_API_KEY is not configured",
      },
    };
  }

  try {
    const payload = await zafronixFetch(
      `/compare?years=${years.join(",")}`,
      apiKey
    );
    const rows = sortRowsByYears(
      extractCompareRows(payload)
        .map(normalizeCompareRow)
        .filter(Boolean),
      years
    );

    return {
      ok: true,
      status: 200,
      cacheControl,
      body: {
        years,
        rows,
        source: "zafronix",
      },
    };
  } catch (error) {
    console.error("Failed to fetch tournament compare:", error);
    return {
      ok: true,
      status: 200,
      cacheControl,
      body: {
        years,
        rows: [],
        source: "fallback",
        warning: "Zafronix request failed",
      },
    };
  }
}

module.exports = {
  extractCompareRows,
  getCompareCacheControl,
  getTournamentCompare,
  normalizeCompareRow,
  parseYearsParam,
};
