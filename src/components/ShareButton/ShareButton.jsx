import React, { useState } from "react";
import { useLocale } from "../../context/LocaleContext";
import { useSelectedCountry } from "../../context/SelectedCountryContext";
import { useWorldChampionsContext } from "../../context/WorldChampionsContext";
import { buildShareUrl } from "../../utils/urlParams";
import styles from "./ShareButton.module.css";

function ShareIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.icon}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
      <path d="M12 3v12" />
      <path d="m8 7 4-4 4 4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.icon}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function getShareText(t, selectedCountry, lastChampion) {
  if (!selectedCountry) {
    return t("subtitle");
  }

  if (selectedCountry.hasWon === false) {
    return t("shareTextNever", { country: selectedCountry.displayName });
  }

  if (lastChampion?.slug === selectedCountry.slug) {
    return t("shareText", { country: selectedCountry.displayName });
  }

  return t("shareTextDrought", { country: selectedCountry.displayName });
}

export default function ShareButton() {
  const { locale, t } = useLocale();
  const { selectedCountry, selectedSlug } = useSelectedCountry();
  const { lastChampion } = useWorldChampionsContext();
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = buildShareUrl({ countrySlug: selectedSlug, lang: locale });
    const text = getShareText(t, selectedCountry, lastChampion);

    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, text, url });
        return;
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      window.prompt(t("share"), url);
    }
  }

  const label = copied ? t("shareCopied") : t("share");

  return (
    <button
      aria-label={label}
      className={`${styles.button} ${copied ? styles.copied : ""}`}
      onClick={handleShare}
      type="button"
    >
      {copied ? <CheckIcon /> : <ShareIcon />}
      <span>{label}</span>
    </button>
  );
}
