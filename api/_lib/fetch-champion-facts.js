const { resolveCountryMeta } = require("./country-meta");
const { zafronixFetch } = require("./zafronix-client");

const FINAL_FALLBACK = {
  year: 2022,
  host: "Qatar",
  summary: "Argentina ganó la final 3-3 (4-2 en penales) ante Francia.",
  trivia: [
    "Qatar 2022 fue el primer Mundial celebrado en invierno boreal.",
    "Lionel Messi levantó su primera Copa del Mundo.",
  ],
};

function findFinalMatch(matches = []) {
  return (
    matches.find((match) => match.stage === "final") ??
    matches.find((match) => /final/i.test(match.stage ?? "")) ??
    null
  );
}

function formatFinalSummary(finalMatch, championName) {
  if (!finalMatch) {
    return null;
  }

  const home = finalMatch.homeTeam ?? finalMatch.home ?? "?";
  const away = finalMatch.awayTeam ?? finalMatch.away ?? "?";
  const homeScore = finalMatch.homeScore ?? finalMatch.score?.home ?? "?";
  const awayScore = finalMatch.awayScore ?? finalMatch.score?.away ?? "?";

  return `${championName} ganó la final ${homeScore}-${awayScore} ante ${home === championName ? away : home}.`;
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
    const matches = matchesPayload?.matches ?? matchesPayload ?? [];
    const finalMatch = Array.isArray(matches)
      ? findFinalMatch(matches)
      : matches;
    const summary =
      formatFinalSummary(finalMatch, meta?.displayName ?? championName) ??
      FINAL_FALLBACK.summary;

    const triviaItems = triviaPayload?.trivia ?? triviaPayload?.items ?? [];
    const trivia = Array.isArray(triviaItems)
      ? triviaItems.slice(0, 3).map((item) => item.fact ?? item.text ?? String(item))
      : FINAL_FALLBACK.trivia;

    return {
      year,
      host: tournament?.host ?? tournament?.hostCountry ?? FINAL_FALLBACK.host,
      champion: meta?.displayName ?? championName,
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
