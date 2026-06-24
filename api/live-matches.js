const { getRecentMatches } = require("./_lib/fetch-live-matches");
const { resolveTimeZone } = require("./_lib/recent-matches");

const RECENT_CACHE_CONTROL =
  "public, s-maxage=86400, stale-while-revalidate=604800";
const UPCOMING_CACHE_CONTROL =
  "public, s-maxage=300, stale-while-revalidate=1800";
const IDLE_CACHE_CONTROL =
  "public, s-maxage=300, stale-while-revalidate=1800";

function getCacheControl(mode) {
  if (mode === "recent") {
    return RECENT_CACHE_CONTROL;
  }

  if (mode === "upcoming") {
    return UPCOMING_CACHE_CONTROL;
  }

  return IDLE_CACHE_CONTROL;
}

async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const timeZone = resolveTimeZone(req.query?.tz);
    const payload = await getRecentMatches(process.env.ZAFRONIX_API_KEY, new Date(), {
      timeZone,
    });

    res.setHeader("Cache-Control", getCacheControl(payload.mode));
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json(payload);
  } catch (error) {
    console.error("Unhandled error in /api/live-matches:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

handler.getCacheControl = getCacheControl;
handler.RECENT_CACHE_CONTROL = RECENT_CACHE_CONTROL;
handler.UPCOMING_CACHE_CONTROL = UPCOMING_CACHE_CONTROL;

module.exports = handler;
