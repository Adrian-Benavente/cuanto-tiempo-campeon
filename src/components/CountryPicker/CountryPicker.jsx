import React from "react";
import { useLocale } from "../../context/LocaleContext";
import { useSelectedCountry } from "../../context/SelectedCountryContext";
import styles from "./CountryPicker.module.css";

export default function CountryPicker() {
  const { t } = useLocale();
  const { selectedSlug, pickerOptions, setSelectedSlug } = useSelectedCountry();

  return (
    <label className={styles.picker}>
      <span className={styles.label}>{t("myTeam")}</span>
      <select
        className={styles.select}
        value={selectedSlug}
        onChange={(event) => setSelectedSlug(event.target.value)}
      >
        <option value="">{t("myTeamPlaceholder")}</option>
        <optgroup label="Campeones">
          {pickerOptions
            .filter((option) => option.group === "champions")
            .map((option) => (
              <option key={option.slug} value={option.slug}>
                {option.displayName}
              </option>
            ))}
        </optgroup>
        <optgroup label="Otros países">
          {pickerOptions
            .filter((option) => option.group === "neverWon")
            .map((option) => (
              <option key={option.slug} value={option.slug}>
                {option.displayName}
              </option>
            ))}
        </optgroup>
      </select>
    </label>
  );
}
