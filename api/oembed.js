const SITE_ORIGIN = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const embedUrl = `${SITE_ORIGIN}/?embed=1`;
  const payload = {
    version: "1.0",
    type: "rich",
    provider_name: "¿Cuánto tiempo campeón?",
    provider_url: SITE_ORIGIN,
    title: "¿Cuánto tiempo campeón?",
    width: 420,
    height: 280,
    html: `<iframe src="${embedUrl}" width="420" height="280" frameborder="0" scrolling="no" title="¿Cuánto tiempo campeón?"></iframe>`,
  };

  res.setHeader("Cache-Control", "public, s-maxage=86400");
  res.setHeader("Content-Type", "application/json");
  return res.status(200).json(payload);
};
