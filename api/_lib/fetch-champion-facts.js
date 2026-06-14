const { resolveCountryMeta } = require("./country-meta");
const { zafronixFetch } = require("./zafronix-client");
const {
  extractMatches,
  findFinalMatch,
  formatFinalSummary,
  formatHost,
} = require("./zafronix-normalize");

const FINAL_FALLBACK = {
  year: 2022,
  host: "Qatar",
  summary: "Argentina ganó la final 3-3 (4-2 en penales) ante Francia.",
  trivia: [
    "Qatar 2022 fue el primer Mundial celebrado en invierno boreal.",
    "Lionel Messi levantó su primera Copa del Mundo.",
  ],
};

function resolveDisplayName(name) {
  return resolveCountryMeta(name)?.displayName ?? name;
}

async function getChampionFacts(apiKey, year = 2022) {
  if (!apiKey) {
    return { ...FINAL_FALLBACK, source: "fallback" };
  }

  try {
    const [tournamentPayload, matchesPayload, triviaPayload] =
      await Promise.all([
        zafronixFetch(`/tournaments/${year}`, apiKey),
        zafronixFetch(`/matches?year=${year}&stage=final`, apiKey),
        zafronixFetch(`/trivia?year=${year}`, apiKey),
      ]);

    const tournament = tournamentPayload?.tournament ?? tournamentPayload;
    const championName = tournament?.champion ?? "Argentina";
    const meta = resolveCountryMeta(championName);
    const displayChampion = meta?.displayName ?? championName;
    const matches = extractMatches(matchesPayload);
    const finalMatch = findFinalMatch(matches);
    const summary =
      formatFinalSummary(finalMatch, displayChampion, resolveDisplayName) ??
      FINAL_FALLBACK.summary;

    const triviaItems = triviaPayload?.trivia ?? triviaPayload?.items ?? [];
    const trivia = Array.isArray(triviaItems)
      ? triviaItems.slice(0, 3).map((item) => item.fact ?? item.text ?? String(item))
      : FINAL_FALLBACK.trivia;
    const host = formatHost(
      tournament?.host ?? tournament?.hostCountry ?? FINAL_FALLBACK.host
    );

    return {
      year,
      host: host || FINAL_FALLBACK.host,
      champion: displayChampion,
      summary,
      trivia: trivia.length ? trivia : FINAL_FALLBACK.trivia,
      source: "zafronix",
    };
  } catch (error) {
    console.error("Failed to fetch champion facts:", error);
    return { ...FINAL_FALLBACK, source: "fallback" };
  }
}

module.exports = {
  getChampionFacts,
};
