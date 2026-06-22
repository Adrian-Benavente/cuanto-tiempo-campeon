const { getZafronixTeamName } = require("./country-meta");
const { getCurrentWorldCupYear } = require("./recent-matches");
const { zafronixFetch } = require("./zafronix-client");

function extractRosterPayload(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload?.data ?? payload?.roster ?? payload?.players ?? [];
}

function normalizeRosterPlayer(entry) {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const name = entry.name ?? entry.fullName;

  if (!name || typeof name !== "string") {
    return null;
  }

  const club =
    typeof entry.club === "string"
      ? entry.club
      : entry.club?.name ?? null;

  return {
    jersey: entry.jersey ?? null,
    name,
    position: entry.position ?? null,
    goals: entry.goals ?? 0,
    captain: Boolean(entry.captain),
    club,
  };
}

function normalizeRoster(players = []) {
  return (Array.isArray(players) ? players : [])
    .map(normalizeRosterPlayer)
    .filter(Boolean)
    .sort((left, right) => {
      const leftJersey = left.jersey ?? Number.MAX_SAFE_INTEGER;
      const rightJersey = right.jersey ?? Number.MAX_SAFE_INTEGER;

      if (leftJersey !== rightJersey) {
        return leftJersey - rightJersey;
      }

      return left.name.localeCompare(right.name);
    });
}

function getEmptyRosterPayload(teamSlug, year, source = "fallback") {
  return {
    year,
    team: teamSlug,
    players: [],
    source,
  };
}

async function getTeamRoster(teamSlug, apiKey, now = new Date()) {
  const year = getCurrentWorldCupYear(now);
  const slug = teamSlug?.trim().toLowerCase();

  if (!year || !slug) {
    return getEmptyRosterPayload(slug ?? null, year, apiKey ? "zafronix" : "fallback");
  }

  const apiName = getZafronixTeamName(slug);

  if (!apiName) {
    return getEmptyRosterPayload(slug, year, apiKey ? "zafronix" : "fallback");
  }

  if (!apiKey) {
    return getEmptyRosterPayload(slug, year, "fallback");
  }

  try {
    const payload = await zafronixFetch(
      `/teams/${encodeURIComponent(apiName)}/roster?year=${year}`,
      apiKey
    );
    const players = normalizeRoster(extractRosterPayload(payload));

    return {
      year,
      team: slug,
      players,
      source: "zafronix",
    };
  } catch (error) {
    if (error?.message?.includes("(404)")) {
      return getEmptyRosterPayload(slug, year, "zafronix");
    }

    console.error("Failed to fetch team roster:", error);
    return getEmptyRosterPayload(slug, year, "fallback");
  }
}

module.exports = {
  extractRosterPayload,
  getEmptyRosterPayload,
  getTeamRoster,
  normalizeRoster,
  normalizeRosterPlayer,
};
