const { resolveCountryMeta } = require("./country-meta");
const { zafronixFetch } = require("./zafronix-client");
const { formatHost } = require("./zafronix-normalize");

const FALLBACK_TOURNAMENTS = [
  { year: 2022, champion: "Argentina", host: "Qatar" },
  { year: 2018, champion: "France", host: "Russia" },
  { year: 2014, champion: "Germany", host: "Brazil" },
  { year: 2010, champion: "Spain", host: "South Africa" },
  { year: 2006, champion: "Italy", host: "Germany" },
  { year: 2002, champion: "Brazil", host: "South Korea/Japan" },
  { year: 1998, champion: "France", host: "France" },
  { year: 1994, champion: "Brazil", host: "United States" },
  { year: 1990, champion: "West Germany", host: "Italy" },
  { year: 1986, champion: "Argentina", host: "Mexico" },
  { year: 1982, champion: "Italy", host: "Spain" },
  { year: 1978, champion: "Argentina", host: "Argentina" },
  { year: 1974, champion: "West Germany", host: "West Germany" },
  { year: 1970, champion: "Brazil", host: "Mexico" },
  { year: 1966, champion: "England", host: "England" },
  { year: 1962, champion: "Brazil", host: "Chile" },
  { year: 1958, champion: "Brazil", host: "Sweden" },
  { year: 1954, champion: "West Germany", host: "Switzerland" },
  { year: 1950, champion: "Uruguay", host: "Brazil" },
  { year: 1938, champion: "Italy", host: "France" },
  { year: 1934, champion: "Italy", host: "Italy" },
  { year: 1930, champion: "Uruguay", host: "Uruguay" },
];

function normalizeTournament(entry) {
  const meta = entry.champion ? resolveCountryMeta(entry.champion) : null;
  const upcoming = entry.year >= 2026 && !entry.champion;

  return {
    year: entry.year,
    champion: meta?.displayName ?? entry.champion ?? null,
    slug: meta?.slug ?? null,
    host: formatHost(entry.host ?? entry.hostCountry ?? entry.location ?? ""),
    upcoming,
  };
}

async function getTournamentsHistory(apiKey) {
  if (!apiKey) {
    return {
      tournaments: FALLBACK_TOURNAMENTS.map(normalizeTournament),
      source: "fallback",
    };
  }

  try {
    const payload = await zafronixFetch("/tournaments", apiKey);
    const raw = payload?.tournaments ?? payload ?? [];
    const tournaments = (Array.isArray(raw) ? raw : [])
      .filter(
        (entry) =>
          entry?.year &&
          entry.year <= 2026 &&
          (entry.champion || entry.year === 2026)
      )
      .map(normalizeTournament)
      .sort((a, b) => a.year - b.year);

    const normalized = tournaments.length
      ? tournaments
      : FALLBACK_TOURNAMENTS.map(normalizeTournament);

    if (!normalized.some((entry) => entry.year === 2026)) {
      normalized.push(
        normalizeTournament({
          year: 2026,
          champion: null,
          host: "United States / Canada / Mexico",
        })
      );
    }

    return {
      tournaments: normalized,
      source: "zafronix",
    };
  } catch (error) {
    console.error("Failed to fetch tournaments history:", error);
    return {
      tournaments: FALLBACK_TOURNAMENTS.map(normalizeTournament),
      source: "fallback",
    };
  }
}

module.exports = {
  getTournamentsHistory,
};
