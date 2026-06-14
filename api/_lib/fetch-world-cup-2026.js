const { zafronixFetch } = require("./zafronix-client");

const FALLBACK_2026 = {
  year: 2026,
  host: "Estados Unidos, México y Canadá",
  startDate: "2026-06-11T16:00:00.000Z",
  endDate: "2026-07-19T18:00:00.000Z",
};

async function getWorldCup2026(apiKey) {
  if (!apiKey) {
    return { ...FALLBACK_2026, source: "fallback" };
  }

  try {
    const payload = await zafronixFetch("/tournaments/2026", apiKey);
    const tournament = payload?.tournament ?? payload;
    const startDate = tournament?.datesIso?.start
      ? `${tournament.datesIso.start}T16:00:00.000Z`
      : FALLBACK_2026.startDate;
    const endDate = tournament?.datesIso?.end
      ? `${tournament.datesIso.end}T18:00:00.000Z`
      : FALLBACK_2026.endDate;

    return {
      year: 2026,
      host:
        tournament?.host ??
        tournament?.hostCountry ??
        FALLBACK_2026.host,
      startDate,
      endDate,
      source: "zafronix",
    };
  } catch (error) {
    console.error("Failed to fetch World Cup 2026:", error);
    return { ...FALLBACK_2026, source: "fallback" };
  }
}

module.exports = {
  getWorldCup2026,
};
