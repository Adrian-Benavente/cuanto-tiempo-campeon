const { getLiveOrRecentMatches } = require("./_lib/fetch-live-matches");

const LIVE_CACHE_CONTROL = "public, s-maxage=60, stale-while-revalidate=300";
const RECENT_CACHE_CONTROL =
  "public, s-maxage=86400, stale-while-revalidate=604800";
const IDLE_CACHE_CONTROL =
  "public, s-maxage=300, stale-while-revalidate=1800";

function getCacheControl(mode) {
  if (mode === "live") {
    return LIVE_CACHE_CONTROL;
  }

  if (mode === "recent") {
    return RECENT_CACHE_CONTROL;
  }

  return IDLE_CACHE_CONTROL;
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const payload = await getLiveOrRecentMatches(process.env.ZAFRONIX_API_KEY);

    res.setHeader("Cache-Control", getCacheControl(payload.mode));
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json(payload);
  } catch (error) {
    console.error("Unhandled error in /api/live-matches:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
