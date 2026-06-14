const ZAFRONIX_BASE_URL = "https://api.zafronix.com/fifa/worldcup/v1";
const responseCache = new Map();

async function zafronixFetch(path, apiKey) {
  if (!apiKey) {
    throw new Error("ZAFRONIX_API_KEY is required");
  }

  const cached = responseCache.get(path);
  const headers = {
    "X-API-Key": apiKey,
    Accept: "application/json",
  };

  if (cached?.etag) {
    headers["If-None-Match"] = cached.etag;
  }

  const response = await fetch(`${ZAFRONIX_BASE_URL}${path}`, { headers });

  if (response.status === 304) {
    if (cached?.body !== undefined) {
      return cached.body;
    }

    throw new Error(`Zafronix returned 304 for ${path} without cached body`);
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Zafronix request failed (${response.status}) for ${path}: ${body}`
    );
  }

  const etag = response.headers.get("etag");
  const body = await response.json();

  if (etag) {
    responseCache.set(path, { etag, body });
  }

  return body;
}

function clearZafronixCache() {
  responseCache.clear();
}

module.exports = {
  ZAFRONIX_BASE_URL,
  clearZafronixCache,
  zafronixFetch,
};
