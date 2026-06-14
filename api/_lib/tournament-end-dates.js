const FINAL_WHISTLE_UTC = "T18:00:00.000Z";

const TOURNAMENT_END_ISO = {
  1930: "1930-07-30",
  1934: "1934-06-10",
  1938: "1938-06-19",
  1950: "1950-07-16",
  1954: "1954-07-04",
  1958: "1958-06-29",
  1962: "1962-06-17",
  1966: "1966-07-30",
  1970: "1970-06-21",
  1974: "1974-07-07",
  1978: "1978-06-25",
  1982: "1982-07-11",
  1986: "1986-06-29",
  1990: "1990-07-08",
  1994: "1994-07-17",
  1998: "1998-07-12",
  2002: "2002-06-30",
  2006: "2006-07-09",
  2010: "2010-07-11",
  2014: "2014-07-13",
  2018: "2018-07-15",
  2022: "2022-12-18",
  2026: "2026-07-19",
};

function toChampionDate(isoDate) {
  return `${isoDate}${FINAL_WHISTLE_UTC}`;
}

function getKnownTournamentEndDate(year) {
  const iso = TOURNAMENT_END_ISO[year];

  if (!iso) {
    return null;
  }

  return toChampionDate(iso);
}

async function resolveTournamentEndDate(year, apiKey, zafronixFetch) {
  const knownDate = getKnownTournamentEndDate(year);

  if (knownDate) {
    return knownDate;
  }

  const payload = await zafronixFetch(`/tournaments/${year}`, apiKey);
  const endDate = payload?.tournament?.datesIso?.end;

  if (!endDate) {
    throw new Error(`Missing end date for tournament ${year}`);
  }

  return toChampionDate(endDate);
}

module.exports = {
  FINAL_WHISTLE_UTC,
  TOURNAMENT_END_ISO,
  getKnownTournamentEndDate,
  resolveTournamentEndDate,
  toChampionDate,
};
