const LABELS = {
  es: {
    year: "año",
    years: "años",
    month: "mes",
    months: "meses",
    day: "día",
    days: "días",
    hour: "hora",
    hours: "horas",
    minute: "minuto",
    minutes: "minutos",
    and: "y",
  },
  en: {
    year: "year",
    years: "years",
    month: "month",
    months: "months",
    day: "day",
    days: "days",
    hour: "hour",
    hours: "hours",
    minute: "minute",
    minutes: "minutes",
    and: "and",
  },
};

function getLabels(locale) {
  return LABELS[locale] ?? LABELS.es;
}

export function formatDurationText(
  { years = 0, months = 0, days = 0, hours = 0, minutes = 0 },
  detailed = false,
  locale = "es"
) {
  const labels = getLabels(locale);

  if (detailed) {
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

    if (hours > 0) {
      parts.push(`${hours} ${hours === 1 ? labels.hour : labels.hours}`);
    }

    if (minutes > 0) {
      parts.push(
        `${minutes} ${minutes === 1 ? labels.minute : labels.minutes}`
      );
    }

    if (parts.length === 0) {
      return `0 ${labels.minutes}`;
    }

    if (parts.length === 1) {
      return parts[0];
    }

    return `${parts.slice(0, -1).join(", ")} ${labels.and} ${parts.at(-1)}`;
  }

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

export function formatDuration(duration, detailed = false, locale = "es") {
  return formatDurationText(duration, detailed, locale);
}

export function getLiveCountdownParts(startDate, endDate) {
  const diffMs = Math.max(0, endDate - startDate);
  const totalSeconds = Math.floor(diffMs / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function padCountdownValue(value) {
  return String(value).padStart(2, "0");
}
