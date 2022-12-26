import React from "react";
import worldChampionDates from "../../api/world-champion-dates";
import upperFirst from "../../utils/upperFirst";
import teamBadges from "../../api/badges";
import styles from "./Header.module.css";

export default function Header() {
  const lastChampion = Object.entries(worldChampionDates)
    .sort(([, a], [, b]) => b - a)
    .map(([name]) => name)[0];

  return (
    <header>
      <img
        alt="Escudo de la Asociación del Fútbol Argentino (AFA), con tres estrellas en la parte superior"
        className={styles.badge}
        src={teamBadges[lastChampion]}
      />
      <h1 className={styles.mainTitle}>
        {upperFirst(lastChampion)} es el último campeón mundial
      </h1>
      <p className={styles.paragraph}>
        ¿Cuándo fue la última vez que saliste campeón del mundo?
      </p>
    </header>
  );
}
