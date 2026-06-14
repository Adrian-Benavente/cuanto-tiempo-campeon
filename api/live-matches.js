const { getLiveMatches } = require("./_lib/fetch-live-matches");

const CACHE_CONTROL = "public, s-maxage=60, stale-while-revalidate=300";

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const payload = await getLiveMatches(process.env.ZAFRONIX_API_KEY);

    res.setHeader("Cache-Control", CACHE_CONTROL);
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json(payload);
  } catch (error) {
    console.error("Unhandled error in /api/live-matches:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
