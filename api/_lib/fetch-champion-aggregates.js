const {
  extractAggregatesPayload,
  FALLBACK_AGGREGATES,
  mergeAggregatesWithFallback,
  normalizeAggregate,
} = require("./champion-titles");
const { zafronixFetch } = require("./zafronix-client");

async function getChampionAggregates(apiKey) {
  if (!apiKey) {
    return { aggregates: FALLBACK_AGGREGATES, source: "fallback" };
  }

  try {
    const payload = await zafronixFetch("/aggregates/champions", apiKey);
    const raw = extractAggregatesPayload(payload);
    const normalized = (Array.isArray(raw) ? raw : [])
      .map(normalizeAggregate)
      .filter(Boolean);
    const aggregates = mergeAggregatesWithFallback(normalized);

    return {
      aggregates,
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
