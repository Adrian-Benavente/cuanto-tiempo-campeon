const { intervalToDuration } = require("date-fns");
const { fallbackChampions } = require("./fallback-champions");
const { NEVER_WON_TEAMS } = require("./never-won-teams");

const LABELS = {
  es: {
    siteName: "¿Cuánto tiempo campeón?",
    currentChampion: "{country} es el último campeón mundial",
    drought: "Hace {duration} que {country} no gana el Mundial",
    neverWon: "{country} nunca fue campeón del mundo",
    defaultTitle: "¿Cuánto tiempo campeón?",
    defaultDescription:
      "Contador en vivo de cuánto tiempo lleva cada campeón mundial sin repetir título.",
    year: "año",
    years: "años",
    month: "mes",
    months: "meses",
    day: "día",
    days: "días",
    and: "y",
  },
  en: {
    siteName: "How long since you won?",
    currentChampion: "{country} is the latest World Cup winner",
    drought: "It's been {duration} since {country} won the World Cup",
    neverWon: "{country} has never won the World Cup",
    defaultTitle: "How long since you won the World Cup?",
    defaultDescription:
      "Live counter of how long each world champion has waited for another title.",
    year: "year",
    years: "years",
    month: "month",
    months: "months",
    day: "day",
    days: "days",
    and: "and",
  },
};

function getLabels(lang) {
  return LABELS[lang] ?? LABELS.es;
}

function countryCodeToFlagEmoji(countryCode = "") {
  if (!countryCode || countryCode.length !== 2) {
    return "🏳️";
  }

  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

function formatDurationText(duration, locale = "es") {
  const labels = getLabels(locale);
  const { years = 0, months = 0, days = 0 } = duration;
  const parts = [];

  if (years > 0) {
    parts.push(`${years} ${years === 1 ? labels.year : labels.years}`);
  }

  if (months > 0) {
    parts.push(`${months} ${months === 1 ? labels.month : labels.months}`);
  }

  if (days > 0) {
    parts.push(`${days} ${days === 1 ? labels.day : labels.days}`);
  }

  if (parts.length === 0) {
    return `0 ${labels.days}`;
  }

  if (parts.length === 1) {
    return parts[0];
  }

  if (parts.length === 2) {
    return `${parts[0]} ${labels.and} ${parts[1]}`;
  }

  return `${parts.slice(0, -1).join(", ")} ${labels.and} ${parts.at(-1)}`;
}

function interpolate(template, vars) {
  return Object.entries(vars).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template
  );
}

function findCountryBySlug(slug) {
  if (!slug) {
    return null;
  }

  const champion = fallbackChampions.find((entry) => entry.slug === slug);
  if (champion) {
    return { ...champion, hasWon: true };
  }

  const neverWon = NEVER_WON_TEAMS.find((entry) => entry.slug === slug);
  if (neverWon) {
    return neverWon;
  }

  return null;
}

function getSharePreviewData({ pais, lang = "es" }) {
  const labels = getLabels(lang);
  const lastChampion = fallbackChampions[0];
  const country = findCountryBySlug(pais);

  if (!country) {
    return {
      siteName: labels.siteName,
      title: labels.defaultTitle,
      description: labels.defaultDescription,
      headline: labels.defaultTitle,
      subheadline: labels.defaultDescription,
      flagEmoji: "🏆",
      countryName: null,
      ogType: "default",
    };
  }

  const flagEmoji = countryCodeToFlagEmoji(country.countryCode);

  if (country.hasWon === false) {
    const headline = interpolate(labels.neverWon, {
      country: country.displayName,
    });

    return {
      siteName: labels.siteName,
      title: `${country.displayName} | ${labels.siteName}`,
      description: headline,
      headline,
      subheadline: labels.siteName,
      flagEmoji,
      countryName: country.displayName,
      ogType: "neverWon",
    };
  }

  if (lastChampion?.slug === country.slug) {
    const headline = interpolate(labels.currentChampion, {
      country: country.displayName,
    });

    return {
      siteName: labels.siteName,
      title: `${country.displayName} | ${labels.siteName}`,
      description: headline,
      headline,
      subheadline: labels.siteName,
      flagEmoji,
      countryName: country.displayName,
      ogType: "currentChampion",
    };
  }

  const duration = intervalToDuration({
    start: new Date(country.lastChampionDate),
    end: new Date(),
  });
  const durationText = formatDurationText(duration, lang);
  const headline = interpolate(labels.drought, {
    country: country.displayName,
    duration: durationText,
  });

  return {
    siteName: labels.siteName,
    title: `${country.displayName} | ${labels.siteName}`,
    description: headline,
    headline,
    subheadline: labels.siteName,
    flagEmoji,
    countryName: country.displayName,
    ogType: "drought",
  };
}

module.exports = {
  getSharePreviewData,
  countryCodeToFlagEmoji,
};
