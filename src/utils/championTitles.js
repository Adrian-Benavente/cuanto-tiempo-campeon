import { FALLBACK_TITLES_BY_SLUG } from "../api/champion-titles-fallback";

function findAggregateMatch(slug, aggregates = []) {
  return aggregates.find(
    (entry) =>
      entry.slug === slug ||
      entry.countryCode?.toLowerCase() === slug ||
      entry.displayName?.toLowerCase() === slug
  );
}

export function getTitlesForSlug(slug, aggregates = []) {
  const match = findAggregateMatch(slug, aggregates);

  if (match?.titles != null) {
    return match.titles;
  }

  return FALLBACK_TITLES_BY_SLUG[slug] ?? 1;
}

export function getMaxTitles(champions = [], aggregates = []) {
  if (!champions.length) {
    return 0;
  }

  return Math.max(
    ...champions.map((champion) => getTitlesForSlug(champion.slug, aggregates))
  );
}

export function getTitlesRatio(titles, maxTitles) {
  if (!maxTitles || maxTitles <= 0) {
    return 0;
  }

  return Math.min(1, titles / maxTitles);
}
