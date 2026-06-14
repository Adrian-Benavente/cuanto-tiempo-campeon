import React from "react";
import {
  countryCodeToFlagEmoji,
  resolveFlagCode,
} from "../../utils/countryAssets";

export default function CountryFlag({
  champion,
  imageClassName,
  fallbackClassName,
}) {
  const flagCode = resolveFlagCode(champion);

  if (flagCode) {
    return (
      <span
        className={`fi fi-${flagCode} ${imageClassName ?? ""}`.trim()}
        role="img"
        aria-label={`Bandera de ${champion.displayName}`}
      />
    );
  }

  return (
    <span
      className={fallbackClassName}
      role="img"
      aria-label={`Bandera de ${champion.displayName}`}
    >
      {countryCodeToFlagEmoji(champion.countryCode)}
    </span>
  );
}
