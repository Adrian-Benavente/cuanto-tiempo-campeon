const { getTeamRoster } = require("./_lib/fetch-team-roster");

const CACHE_CONTROL = "public, s-maxage=86400, stale-while-revalidate=604800";

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const team = req.query?.team;

  if (!team || typeof team !== "string") {
    return res.status(400).json({ error: "Missing team query parameter" });
  }

  try {
    const payload = await getTeamRoster(team, process.env.ZAFRONIX_API_KEY);

    res.setHeader("Cache-Control", CACHE_CONTROL);
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json(payload);
  } catch (error) {
    console.error("Unhandled error in /api/team-roster:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
