const COUNTRY_META = {
  Uruguay: { slug: "uruguay", displayName: "Uruguay", countryCode: "UY" },
  Italy: { slug: "italia", displayName: "Italia", countryCode: "IT" },
  "West Germany": {
    slug: "alemania",
    displayName: "Alemania",
    countryCode: "DE",
  },
  Germany: { slug: "alemania", displayName: "Alemania", countryCode: "DE" },
  Brazil: { slug: "brasil", displayName: "Brasil", countryCode: "BR" },
  England: { slug: "inglaterra", displayName: "Inglaterra", countryCode: "GB" },
  Argentina: { slug: "argentina", displayName: "Argentina", countryCode: "AR" },
  France: { slug: "francia", displayName: "Francia", countryCode: "FR" },
  Spain: { slug: "españa", displayName: "España", countryCode: "ES" },
};

const ZAFRONIX_TEAM_BY_SLUG = {
  ...Object.fromEntries(
    Object.entries(COUNTRY_META).map(([apiName, meta]) => [meta.slug, apiName])
  ),
  mexico: "Mexico",
  holanda: "Netherlands",
  portugal: "Portugal",
  belgica: "Belgium",
  croacia: "Croatia",
  colombia: "Colombia",
  chile: "Chile",
  peru: "Peru",
  ecuador: "Ecuador",
  paraguay: "Paraguay",
  bolivia: "Bolivia",
  venezuela: "Venezuela",
  usa: "United States",
  canada: "Canada",
  japon: "Japan",
  "corea-del-sur": "South Korea",
  marruecos: "Morocco",
  senegal: "Senegal",
  ghana: "Ghana",
  nigeria: "Nigeria",
  cameroon: "Cameroon",
  suecia: "Sweden",
  dinamarca: "Denmark",
  suiza: "Switzerland",
  polonia: "Poland",
  serbia: "Serbia",
  turquia: "Turkey",
  rusia: "Russia",
  ucrania: "Ukraine",
  austria: "Austria",
  hungria: "Hungary",
  checoslovaquia: "Czech Republic",
  noruega: "Norway",
  irlanda: "Ireland",
  grecia: "Greece",
  romania: "Romania",
  bulgaria: "Bulgaria",
  israel: "Israel",
  iran: "Iran",
  "arabia-saudita": "Saudi Arabia",
  qatar: "Qatar",
  australia: "Australia",
  "costa-rica": "Costa Rica",
  panama: "Panama",
  honduras: "Honduras",
  jamaica: "Jamaica",
};

// Prefer modern names when multiple API entries share a slug.
ZAFRONIX_TEAM_BY_SLUG.alemania = "Germany";

function resolveCountryMeta(championName) {
  return COUNTRY_META[championName] ?? null;
}

function getZafronixTeamName(slug) {
  if (!slug || typeof slug !== "string") {
    return null;
  }

  return ZAFRONIX_TEAM_BY_SLUG[slug.trim().toLowerCase()] ?? null;
}

module.exports = {
  COUNTRY_META,
  ZAFRONIX_TEAM_BY_SLUG,
  getZafronixTeamName,
  resolveCountryMeta,
};
