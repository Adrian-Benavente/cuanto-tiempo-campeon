const { resolveCountryMeta } = require("./country-meta");

const FALLBACK_AGGREGATES = [
  { slug: "brasil", displayName: "Brasil", countryCode: "BR", titles: 5 },
  { slug: "alemania", displayName: "Alemania", countryCode: "DE", titles: 4 },
  { slug: "italia", displayName: "Italia", countryCode: "IT", titles: 4 },
  { slug: "argentina", displayName: "Argentina", countryCode: "AR", titles: 3 },
  { slug: "francia", displayName: "Francia", countryCode: "FR", titles: 2 },
  { slug: "uruguay", displayName: "Uruguay", countryCode: "UY", titles: 2 },
  { slug: "inglaterra", displayName: "Inglaterra", countryCode: "GB", titles: 1 },
  { slug: "españa", displayName: "España", countryCode: "ES", titles: 1 },
];

const FALLBACK_TITLES_BY_SLUG = Object.fromEntries(
  FALLBACK_AGGREGATES.map((entry) => [entry.slug, entry.titles])
);

const KNOWN_SLUGS = new Set(FALLBACK_AGGREGATES.map((entry) => entry.slug));

function extractAggregatesPayload(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  return (
    payload?.data ??
    payload?.champions ??
    payload?.aggregates ??
    payload?.byCountry ??
    []
  );
}

function normalizeAggregate(entry) {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const titles = entry.titles ?? entry.count ?? entry.wins ?? entry.titlesCount;

  if (entry.slug && KNOWN_SLUGS.has(entry.slug) && titles != null) {
    const fallback = FALLBACK_AGGREGATES.find((item) => item.slug === entry.slug);

    return {
      ...fallback,
      ...entry,
      titles,
    };
  }

  const name =
    entry.country ??
    entry.name ??
    entry.champion ??
    entry.team ??
    entry.displayName;
  const meta = resolveCountryMeta(name);

  if (!meta || titles == null) {
    return null;
  }

  return {
    ...meta,
    titles,
  };
}

function mergeAggregatesWithFallback(normalized = []) {
  const bySlug = new Map(
    FALLBACK_AGGREGATES.map((entry) => [entry.slug, { ...entry }])
  );

  normalized.forEach((entry) => {
    if (!entry?.slug) {
      return;
    }

    const existing = bySlug.get(entry.slug) ?? {};
    bySlug.set(entry.slug, {
      ...existing,
      ...entry,
      titles: entry.titles ?? existing.titles,
    });
  });

  return Array.from(bySlug.values()).sort((left, right) => right.titles - left.titles);
}

module.exports = {
  FALLBACK_AGGREGATES,
  FALLBACK_TITLES_BY_SLUG,
  extractAggregatesPayload,
  mergeAggregatesWithFallback,
  normalizeAggregate,
};
