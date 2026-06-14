export const championTitlesFallback = [
  { slug: "brasil", displayName: "Brasil", countryCode: "BR", titles: 5 },
  { slug: "alemania", displayName: "Alemania", countryCode: "DE", titles: 4 },
  { slug: "italia", displayName: "Italia", countryCode: "IT", titles: 4 },
  { slug: "argentina", displayName: "Argentina", countryCode: "AR", titles: 3 },
  { slug: "francia", displayName: "Francia", countryCode: "FR", titles: 2 },
  { slug: "uruguay", displayName: "Uruguay", countryCode: "UY", titles: 2 },
  { slug: "inglaterra", displayName: "Inglaterra", countryCode: "GB", titles: 1 },
  { slug: "españa", displayName: "España", countryCode: "ES", titles: 1 },
];

export const FALLBACK_TITLES_BY_SLUG = Object.fromEntries(
  championTitlesFallback.map((entry) => [entry.slug, entry.titles])
);
