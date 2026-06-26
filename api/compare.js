const { getTournamentCompare } = require("./_lib/fetch-compare");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const result = await getTournamentCompare(
      process.env.ZAFRONIX_API_KEY,
      req.query?.years
    );

    if (!result.ok) {
      res.setHeader("Content-Type", "application/json");
      return res.status(result.status).json(result.body);
    }

    res.setHeader("Cache-Control", result.cacheControl);
    res.setHeader("Content-Type", "application/json");
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Unhandled error in /api/compare:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
