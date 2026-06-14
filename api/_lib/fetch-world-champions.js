const { resolveCountryMeta } = require("./country-meta");
const { fallbackChampions } = require("./fallback-champions");
const { resolveTournamentEndDate } = require("./tournament-end-dates");
const { zafronixFetch } = require("./zafronix-client");

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
      const lastChampionDate = await resolveTournamentEndDate(
        year,
        apiKey,
        zafronixFetch
      );

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
