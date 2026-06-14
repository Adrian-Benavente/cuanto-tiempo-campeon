const { zafronixFetch } = require("./zafronix-client");
const { extractMatches } = require("./zafronix-normalize");

async function fetchMatchesForYear(year, apiKey) {
  const payload = await zafronixFetch(`/matches?year=${year}`, apiKey);
  return extractMatches(payload);
}

module.exports = {
  fetchMatchesForYear,
};
