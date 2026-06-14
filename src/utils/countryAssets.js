const FLAG_CODE_OVERRIDES = {
  inglaterra: "gb-eng",
};

export function resolveFlagCode({ slug, countryCode } = {}) {
  if (slug && FLAG_CODE_OVERRIDES[slug]) {
    return FLAG_CODE_OVERRIDES[slug];
  }

  if (!countryCode || typeof countryCode !== "string") {
    return null;
  }

  return countryCode.toLowerCase();
}

export function countryCodeToFlagEmoji(countryCode = "") {
  if (!countryCode || countryCode.length !== 2) {
    return "🏳️";
  }

  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}
