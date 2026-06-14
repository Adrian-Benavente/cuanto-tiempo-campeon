import React from "react";
import { useWorldChampionsContext } from "../../context/WorldChampionsContext";
import CountryFlag from "../CountryFlag/CountryFlag";
import styles from "./Header.module.css";

export default function Header() {
  const { lastChampion } = useWorldChampionsContext();

  if (!lastChampion) {
    return null;
  }

  return (
    <header>
      <CountryFlag
        champion={lastChampion}
        imageClassName={styles.championFlag}
        fallbackClassName={styles.championFlagFallback}
      />
      <h1 className={styles.mainTitle}>
        {lastChampion.displayName} es el último campeón mundial
      </h1>
      <p className={styles.paragraph}>
        ¿Cuándo fue la última vez que saliste campeón del mundo?
      </p>
    </header>
  );
}
