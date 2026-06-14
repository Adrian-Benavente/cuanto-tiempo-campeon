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

function resolveCountryMeta(championName) {
  return COUNTRY_META[championName] ?? null;
}

module.exports = {
  COUNTRY_META,
  resolveCountryMeta,
};
