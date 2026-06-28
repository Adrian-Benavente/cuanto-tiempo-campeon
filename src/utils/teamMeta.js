import { NEVER_WON_TEAMS } from "../data/teams-fallback";

const CHAMPION_TEAMS = [
  { slug: "brasil", displayName: "Brasil", countryCode: "BR" },
  { slug: "alemania", displayName: "Alemania", countryCode: "DE" },
  { slug: "italia", displayName: "Italia", countryCode: "IT" },
  { slug: "argentina", displayName: "Argentina", countryCode: "AR" },
  { slug: "francia", displayName: "Francia", countryCode: "FR" },
  { slug: "uruguay", displayName: "Uruguay", countryCode: "UY" },
  { slug: "inglaterra", displayName: "Inglaterra", countryCode: "GB" },
  { slug: "españa", displayName: "España", countryCode: "ES" },
];

const EXTRA_API_TEAMS = [
  { apiName: "South Africa", slug: "south-africa", displayName: "Sudáfrica", countryCode: "ZA" },
  { apiName: "Tunisia", slug: "tunez", displayName: "Túnez", countryCode: "TN" },
  { apiName: "Ivory Coast", slug: "costa-de-marfil", displayName: "Costa de Marfil", countryCode: "CI" },
  { apiName: "Côte d'Ivoire", slug: "costa-de-marfil", displayName: "Costa de Marfil", countryCode: "CI" },
  { apiName: "Scotland", slug: "escocia", displayName: "Escocia", countryCode: "GB" },
  { apiName: "Türkiye", slug: "turquia", displayName: "Turquía", countryCode: "TR" },
  { apiName: "Turkey", slug: "turquia", displayName: "Turquía", countryCode: "TR" },
  { apiName: "USA", slug: "usa", displayName: "Estados Unidos", countryCode: "US" },
  { apiName: "United States", slug: "usa", displayName: "Estados Unidos", countryCode: "US" },
  { apiName: "Korea Republic", slug: "corea-del-sur", displayName: "Corea del Sur", countryCode: "KR" },
  { apiName: "Korea DPR", slug: "corea-del-norte", displayName: "Corea del Norte", countryCode: "KP" },
  { apiName: "Czechia", slug: "checoslovaquia", displayName: "Rep. Checa", countryCode: "CZ" },
  { apiName: "Czech Republic", slug: "checoslovaquia", displayName: "Rep. Checa", countryCode: "CZ" },
  { apiName: "Netherlands", slug: "holanda", displayName: "Países Bajos", countryCode: "NL" },
  { apiName: "West Germany", slug: "alemania", displayName: "Alemania", countryCode: "DE" },
  { apiName: "Germany", slug: "alemania", displayName: "Alemania", countryCode: "DE" },
  { apiName: "Algeria", slug: "argelia", displayName: "Argelia", countryCode: "DZ" },
  { apiName: "Egypt", slug: "egipto", displayName: "Egipto", countryCode: "EG" },
  { apiName: "DR Congo", slug: "rd-congo", displayName: "Rep. Democrática del Congo", countryCode: "CD" },
  { apiName: "Congo DR", slug: "rd-congo", displayName: "Rep. Democrática del Congo", countryCode: "CD" },
  {
    apiName: "Democratic Republic of the Congo",
    slug: "rd-congo",
    displayName: "Rep. Democrática del Congo",
    countryCode: "CD",
  },
  {
    apiName: "Bosnia and Herzegovina",
    slug: "bosnia",
    displayName: "Bosnia y Herzegovina",
    countryCode: "BA",
  },
  {
    apiName: "Bosnia-Herzegovina",
    slug: "bosnia",
    displayName: "Bosnia y Herzegovina",
    countryCode: "BA",
  },
  {
    apiName: "Bosnia & Herzegovina",
    slug: "bosnia",
    displayName: "Bosnia y Herzegovina",
    countryCode: "BA",
  },
  { apiName: "Cape Verde", slug: "cabo-verde", displayName: "Cabo Verde", countryCode: "CV" },
  { apiName: "Cabo Verde", slug: "cabo-verde", displayName: "Cabo Verde", countryCode: "CV" },
  { apiName: "Wales", slug: "gales", displayName: "Gales", countryCode: "GB" },
  { apiName: "Slovakia", slug: "eslovaquia", displayName: "Eslovaquia", countryCode: "SK" },
  { apiName: "Uzbekistan", slug: "uzbekistan", displayName: "Uzbekistán", countryCode: "UZ" },
  { apiName: "Iraq", slug: "irak", displayName: "Irak", countryCode: "IQ" },
  { apiName: "Jordan", slug: "jordania", displayName: "Jordania", countryCode: "JO" },
  { apiName: "Curaçao", slug: "curazao", displayName: "Curazao", countryCode: "CW" },
  { apiName: "Curacao", slug: "curazao", displayName: "Curazao", countryCode: "CW" },
  { apiName: "Haiti", slug: "haiti", displayName: "Haití", countryCode: "HT" },
  { apiName: "New Zealand", slug: "nueva-zelanda", displayName: "Nueva Zelanda", countryCode: "NZ" },
];

const ZAFRONIX_API_NAMES = {
  uruguay: "Uruguay",
  italia: "Italy",
  alemania: "Germany",
  brasil: "Brazil",
  inglaterra: "England",
  argentina: "Argentina",
  francia: "France",
  "españa": "Spain",
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

const FIFA_THREE_LETTER_BY_SLUG = {
  argentina: "ARG",
  brasil: "BRA",
  alemania: "GER",
  italia: "ITA",
  francia: "FRA",
  uruguay: "URU",
  inglaterra: "ENG",
  "españa": "ESP",
  mexico: "MEX",
  holanda: "NED",
  portugal: "POR",
  belgica: "BEL",
  croacia: "CRO",
  colombia: "COL",
  chile: "CHI",
  peru: "PER",
  ecuador: "ECU",
  paraguay: "PAR",
  bolivia: "BOL",
  venezuela: "VEN",
  usa: "USA",
  canada: "CAN",
  japon: "JPN",
  "corea-del-sur": "KOR",
  marruecos: "MAR",
  senegal: "SEN",
  ghana: "GHA",
  nigeria: "NGA",
  cameroon: "CMR",
  suecia: "SWE",
  dinamarca: "DEN",
  suiza: "SUI",
  polonia: "POL",
  serbia: "SRB",
  turquia: "TUR",
  rusia: "RUS",
  ucrania: "UKR",
  austria: "AUT",
  hungria: "HUN",
  checoslovaquia: "CZE",
  noruega: "NOR",
  irlanda: "IRL",
  grecia: "GRE",
  romania: "ROU",
  bulgaria: "BUL",
  israel: "ISR",
  iran: "IRN",
  "arabia-saudita": "KSA",
  qatar: "QAT",
  australia: "AUS",
  "costa-rica": "CRC",
  panama: "PAN",
  honduras: "HON",
  jamaica: "JAM",
  "south-africa": "RSA",
  tunez: "TUN",
  "costa-de-marfil": "CIV",
  escocia: "SCO",
  argelia: "ALG",
  egipto: "EGY",
  "rd-congo": "COD",
  bosnia: "BIH",
  "cabo-verde": "CPV",
  gales: "WAL",
  eslovaquia: "SVK",
  uzbekistan: "UZB",
  irak: "IRQ",
  jordania: "JOR",
  curazao: "CUW",
  haiti: "HAI",
  "nueva-zelanda": "NZL",
};

function normalizeTeamKey(name) {
  return String(name ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function buildApiNameLookup() {
  const lookup = new Map();

  const register = (apiName, meta) => {
    if (!apiName || !meta) {
      return;
    }

    lookup.set(normalizeTeamKey(apiName), meta);
  };

  [...CHAMPION_TEAMS, ...NEVER_WON_TEAMS].forEach((team) => {
    const apiName = ZAFRONIX_API_NAMES[team.slug];

    if (apiName) {
      register(apiName, team);
    }
  });

  Object.entries(ZAFRONIX_API_NAMES).forEach(([slug, apiName]) => {
    const known =
      [...CHAMPION_TEAMS, ...NEVER_WON_TEAMS].find((team) => team.slug === slug) ?? {
        slug,
        displayName: apiName,
        countryCode: null,
      };

    register(apiName, known);
  });

  EXTRA_API_TEAMS.forEach(({ apiName, ...meta }) => {
    register(apiName, meta);
  });

  return lookup;
}

const API_NAME_LOOKUP = buildApiNameLookup();

export function resolveTeamMeta(apiName) {
  if (!apiName || typeof apiName !== "string") {
    return null;
  }

  return API_NAME_LOOKUP.get(normalizeTeamKey(apiName)) ?? null;
}

export function getFifaThreeLetterCode(meta, apiName) {
  if (meta?.slug && FIFA_THREE_LETTER_BY_SLUG[meta.slug]) {
    return FIFA_THREE_LETTER_BY_SLUG[meta.slug];
  }

  if (apiName && typeof apiName === "string") {
    const trimmed = apiName.trim();

    if (trimmed.length >= 3) {
      return trimmed.slice(0, 3).toUpperCase();
    }
  }

  return "—";
}

export function resolveBracketTeam(rawName) {
  if (!rawName || typeof rawName !== "string" || !rawName.trim()) {
    return { isTbd: true, apiName: null, meta: null, fifaCode: null };
  }

  const apiName = rawName.trim();
  const meta = resolveTeamMeta(apiName);

  return {
    isTbd: false,
    apiName,
    meta: meta ?? {
      slug: null,
      displayName: apiName,
      countryCode: null,
    },
    fifaCode: getFifaThreeLetterCode(meta, apiName),
  };
}
