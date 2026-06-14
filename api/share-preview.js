const { getSharePreviewData } = require("./_lib/share-preview-data");

function getOrigin(req) {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const protocol = req.headers["x-forwarded-proto"] || "http";
  return `${protocol}://${host}`;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildCanonicalUrl(origin, pais, lang) {
  const params = new URLSearchParams();
  if (pais) {
    params.set("pais", pais);
  }
  if (lang && lang !== "es") {
    params.set("lang", lang);
  }

  const query = params.toString();
  return query ? `${origin}/?${query}` : `${origin}/`;
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).send("Method not allowed");
  }

  const origin = getOrigin(req);
  const pais = typeof req.query?.pais === "string" ? req.query.pais : null;
  const lang = req.query?.lang === "en" ? "en" : "es";
  const preview = getSharePreviewData({ pais, lang });
  const canonicalUrl = buildCanonicalUrl(origin, pais, lang);
  const ogImageParams = new URLSearchParams();

  if (pais) {
    ogImageParams.set("pais", pais);
  }

  if (lang !== "es") {
    ogImageParams.set("lang", lang);
  }

  const ogImageQuery = ogImageParams.toString();
  const ogImageUrl = ogImageQuery
    ? `${origin}/api/og?${ogImageQuery}`
    : `${origin}/api/og`;

  const html = `<!DOCTYPE html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(preview.title)}</title>
    <meta name="description" content="${escapeHtml(preview.description)}" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:title" content="${escapeHtml(preview.title)}" />
    <meta property="og:description" content="${escapeHtml(preview.description)}" />
    <meta property="og:image" content="${escapeHtml(ogImageUrl)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="${escapeHtml(preview.siteName)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(preview.title)}" />
    <meta name="twitter:description" content="${escapeHtml(preview.description)}" />
    <meta name="twitter:image" content="${escapeHtml(ogImageUrl)}" />
    <meta http-equiv="refresh" content="0;url=${escapeHtml(canonicalUrl)}" />
  </head>
  <body>
    <p><a href="${escapeHtml(canonicalUrl)}">${escapeHtml(preview.title)}</a></p>
  </body>
</html>`;

  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.status(200).send(html);
};
