const { getChampionFacts } = require("./_lib/fetch-champion-facts");

const CACHE_CONTROL = "public, s-maxage=86400, stale-while-revalidate=604800";

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const year = Number(req.query?.year) || 2022;
    const payload = await getChampionFacts(process.env.ZAFRONIX_API_KEY, year);

    res.setHeader("Cache-Control", CACHE_CONTROL);
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json(payload);
  } catch (error) {
    console.error("Unhandled error in /api/champion-facts:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
