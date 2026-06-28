import { getKickoffRaw } from "./liveMatchData";

function getLocaleTag(locale) {
  return locale === "en" ? "en-US" : "es-AR";
}

function getIntlOptions(timeZone) {
  return timeZone ? { timeZone } : {};
}

export function formatMatchKickoffTime(match, locale, { timeZone } = {}) {
  const kickoffRaw = getKickoffRaw(match);

  if (!kickoffRaw) {
    return null;
  }

  const kickoff = new Date(kickoffRaw);

  if (Number.isNaN(kickoff.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(getLocaleTag(locale), {
    hour: "numeric",
    minute: "2-digit",
    ...getIntlOptions(timeZone),
  }).format(kickoff);
}

export function formatMatchDateTime(match, locale, { timeZone } = {}) {
  const kickoffRaw = getKickoffRaw(match);
  const intlOptions = getIntlOptions(timeZone);
  const localeTag = getLocaleTag(locale);

  if (kickoffRaw) {
    const kickoff = new Date(kickoffRaw);

    if (Number.isNaN(kickoff.getTime())) {
      return null;
    }

    const dateLabel = new Intl.DateTimeFormat(localeTag, {
      day: "numeric",
      month: "short",
      ...intlOptions,
    }).format(kickoff);

    const timeLabel = new Intl.DateTimeFormat(localeTag, {
      hour: "numeric",
      minute: "2-digit",
      ...intlOptions,
    }).format(kickoff);

    return {
      label: `${dateLabel} · ${timeLabel}`,
      dateTime: kickoffRaw,
    };
  }

  const rawDate = match?.date ?? match?.dateIso;

  if (!rawDate) {
    return null;
  }

  const parsed = new Date(rawDate);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const dateLabel = new Intl.DateTimeFormat(localeTag, {
    day: "numeric",
    month: "short",
    ...intlOptions,
  }).format(parsed);

  return {
    label: dateLabel,
    dateTime: rawDate,
  };
}
