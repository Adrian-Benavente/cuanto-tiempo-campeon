import React from "react";
import { useLocale } from "../../context/LocaleContext";
import styles from "./ChampionFacts.module.css";

export default function ChampionFacts({ facts }) {
  const { t } = useLocale();

  if (!facts) {
    return null;
  }

  return (
    <section className={styles.panel} aria-labelledby="champion-facts-title">
      <h2 className={styles.title} id="champion-facts-title">
        {t("championFactsTitle")}
      </h2>
      <p className={styles.summary}>
        {facts.host} {facts.year}: {facts.summary}
      </p>
      {facts.trivia?.length > 0 && (
        <ul className={styles.triviaList}>
          {facts.trivia.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
