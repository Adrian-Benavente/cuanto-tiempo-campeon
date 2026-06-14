const {
  getFixtureCacheControl,
  getWorldCupFixture,
} = require("./_lib/fetch-world-cup-fixture");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const payload = await getWorldCupFixture(process.env.ZAFRONIX_API_KEY);

    res.setHeader("Cache-Control", getFixtureCacheControl());
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json(payload);
  } catch (error) {
    console.error("Unhandled error in /api/world-cup-fixture:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
