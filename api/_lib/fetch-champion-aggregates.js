const { resolveCountryMeta } = require("./country-meta");
const { zafronixFetch } = require("./zafronix-client");

const FALLBACK_AGGREGATES = [
  { slug: "brasil", displayName: "Brasil", countryCode: "BR", titles: 5 },
  { slug: "alemania", displayName: "Alemania", countryCode: "DE", titles: 4 },
  { slug: "italia", displayName: "Italia", countryCode: "IT", titles: 4 },
  { slug: "argentina", displayName: "Argentina", countryCode: "AR", titles: 3 },
  { slug: "francia", displayName: "Francia", countryCode: "FR", titles: 2 },
  { slug: "uruguay", displayName: "Uruguay", countryCode: "UY", titles: 2 },
  { slug: "inglaterra", displayName: "Inglaterra", countryCode: "GB", titles: 1 },
  { slug: "españa", displayName: "España", countryCode: "ES", titles: 1 },
];

function normalizeAggregate(entry) {
  const meta = resolveCountryMeta(entry.country ?? entry.name ?? entry.champion);

  if (!meta) {
    return null;
  }

  return {
    ...meta,
    titles: entry.titles ?? entry.count ?? entry.wins ?? 1,
  };
}

async function getChampionAggregates(apiKey) {
  if (!apiKey) {
    return { aggregates: FALLBACK_AGGREGATES, source: "fallback" };
  }

  try {
    const payload = await zafronixFetch("/aggregates/champions", apiKey);
    const raw = payload?.champions ?? payload?.aggregates ?? payload ?? [];
    const aggregates = (Array.isArray(raw) ? raw : [])
      .map(normalizeAggregate)
      .filter(Boolean)
      .sort((a, b) => b.titles - a.titles);

    return {
      aggregates: aggregates.length ? aggregates : FALLBACK_AGGREGATES,
      source: "zafronix",
    };
  } catch (error) {
    console.error("Failed to fetch champion aggregates:", error);
    return { aggregates: FALLBACK_AGGREGATES, source: "fallback" };
  }
}

module.exports = {
  getChampionAggregates,
};
