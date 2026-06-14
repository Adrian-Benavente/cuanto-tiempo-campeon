const ZAFRONIX_BASE_URL = "https://api.zafronix.com/fifa/worldcup/v1";

async function zafronixFetch(path, apiKey) {
  const response = await fetch(`${ZAFRONIX_BASE_URL}${path}`, {
    headers: {
      "X-API-Key": apiKey,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Zafronix request failed (${response.status}) for ${path}: ${body}`
    );
  }

  return response.json();
}

module.exports = {
  ZAFRONIX_BASE_URL,
  zafronixFetch,
};
