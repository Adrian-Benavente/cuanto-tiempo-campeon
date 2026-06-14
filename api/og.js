const { ImageResponse } = require("@vercel/og");
const { getSharePreviewData } = require("./_lib/share-preview-data");

module.exports = async function handler(req) {
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  const url = new URL(req.url || "/", `${protocol}://${host}`);
  const pais = url.searchParams.get("pais");
  const lang = url.searchParams.get("lang") === "en" ? "en" : "es";
  const preview = getSharePreviewData({ pais, lang });

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "linear-gradient(135deg, #dbeafe 0%, #f8fafc 45%, #e0f2fe 100%)",
          color: "#0f172a",
          display: "flex",
          flexDirection: "column",
          fontFamily: "sans-serif",
          height: "100%",
          justifyContent: "center",
          padding: "64px",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            background: "rgba(255,255,255,0.72)",
            border: "1px solid rgba(255,255,255,0.9)",
            borderRadius: "32px",
            boxShadow: "0 20px 60px rgba(15,23,42,0.12)",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            maxWidth: "980px",
            padding: "56px 64px",
            textAlign: "center",
            width: "100%",
          }}
        >
          <div style={{ fontSize: 96, lineHeight: 1 }}>{preview.flagEmoji}</div>
          {preview.countryName ? (
            <div
              style={{
                color: "#1e40af",
                fontSize: 42,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {preview.countryName}
            </div>
          ) : null}
          <div
            style={{
              fontSize: 52,
              fontWeight: 800,
              lineHeight: 1.2,
              maxWidth: "900px",
            }}
          >
            {preview.headline}
          </div>
          <div
            style={{
              color: "#475569",
              fontSize: 28,
              fontWeight: 600,
            }}
          >
            {preview.subheadline}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
};
