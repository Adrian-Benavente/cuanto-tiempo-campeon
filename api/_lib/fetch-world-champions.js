const { resolveCountryMeta } = require("./country-meta");
const { fallbackChampions } = require("./fallback-champions");

const ZAFRONIX_BASE_URL = "https://api.zafronix.com/fifa/worldcup/v1";
const FINAL_WHISTLE_UTC = "T18:00:00.000Z";

async function zafronixFetch(path, apiKey) {
  const response = await fetch(`${ZAFRONIX_BASE_URL}${path}`, {
    headers: {
      "X-API-Key": apiKey,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Zafronix request failed (${response.status}) for ${path}: ${body}`
    );
  }

  return response.json();
}

function toChampionDate(isoDate) {
  return `${isoDate}${FINAL_WHISTLE_UTC}`;
}

async function fetchTournamentEndDate(year, apiKey) {
  const payload = await zafronixFetch(`/tournaments/${year}`, apiKey);
  const endDate = payload?.tournament?.datesIso?.end;

  if (!endDate) {
    throw new Error(`Missing end date for tournament ${year}`);
  }

  return toChampionDate(endDate);
}

async function fetchWorldChampionsFromZafronix(apiKey) {
  const tournaments = await zafronixFetch("/tournaments", apiKey);
  const latestWinBySlug = new Map();

  for (const tournament of tournaments) {
    if (!tournament?.champion || !tournament?.year) {
      continue;
    }

    const meta = resolveCountryMeta(tournament.champion);

    if (!meta) {
      throw new Error(
        `Unsupported champion mapping for "${tournament.champion}"`
      );
    }

    const existing = latestWinBySlug.get(meta.slug);

    if (!existing || tournament.year > existing.year) {
      latestWinBySlug.set(meta.slug, {
        meta,
        year: tournament.year,
      });
    }
  }

  const champions = await Promise.all(
    Array.from(latestWinBySlug.values()).map(async ({ meta, year }) => {
      const lastChampionDate = await fetchTournamentEndDate(year, apiKey);

      return {
        ...meta,
        lastChampionDate,
      };
    })
  );

  return champions.sort(
    (a, b) =>
      new Date(b.lastChampionDate).getTime() -
      new Date(a.lastChampionDate).getTime()
  );
}

async function getWorldChampions(apiKey) {
  if (!apiKey) {
    return {
      champions: fallbackChampions,
      source: "fallback",
      warning: "ZAFRONIX_API_KEY is not configured",
    };
  }

  try {
    const champions = await fetchWorldChampionsFromZafronix(apiKey);

    return {
      champions,
      source: "zafronix",
    };
  } catch (error) {
    console.error("Failed to fetch world champions from Zafronix:", error);

    return {
      champions: fallbackChampions,
      source: "fallback",
      warning: "Zafronix request failed; serving fallback data",
    };
  }
}

module.exports = {
  getWorldChampions,
};
