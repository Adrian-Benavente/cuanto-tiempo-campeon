const { zafronixFetch } = require("./zafronix-client");

function getEmptyStandings() {
  return { groups: {} };
}

async function fetchStandingsForYear(year, apiKey) {
  if (!apiKey || !year) {
    return getEmptyStandings();
  }

  try {
    const payload = await zafronixFetch(`/standings?year=${year}`, apiKey);

    return {
      groups: payload?.groups && typeof payload.groups === "object" ? payload.groups : {},
    };
  } catch (error) {
    console.error("Failed to fetch world cup standings:", error);
    return getEmptyStandings();
  }
}

module.exports = {
  fetchStandingsForYear,
  getEmptyStandings,
};
