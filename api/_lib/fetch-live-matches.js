const { zafronixFetch } = require("./zafronix-client");

async function getLiveMatches(apiKey) {
  if (!apiKey) {
    return { matches: [], source: "fallback" };
  }

  try {
    const payload = await zafronixFetch("/matches/live", apiKey);
    const matches = payload?.matches ?? payload ?? [];

    return {
      matches: Array.isArray(matches) ? matches.slice(0, 5) : [],
      source: "zafronix",
    };
  } catch (error) {
    console.error("Failed to fetch live matches:", error);
    return { matches: [], source: "fallback" };
  }
}

module.exports = {
  getLiveMatches,
};
