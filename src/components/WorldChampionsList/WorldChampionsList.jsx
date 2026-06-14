import React, { useEffect, useMemo, useState } from "react";
import { intervalToDuration } from "date-fns";
import { useWorldChampionsContext } from "../../context/WorldChampionsContext";
import CountryFlag from "../CountryFlag/CountryFlag";
import styles from "./WorldChampionsList.module.css";

function formatDuration({ years, months, days, hours, minutes }, detailed) {
  if (detailed) {
    return (
      <>
        {years > 0 ? (years > 1 ? `${years} años, ` : `${years} año, `) : ""}
        {months > 0
          ? months > 1
            ? `${months} meses, `
            : `${months} mes, `
          : ""}
        {days > 0 ? (days > 1 ? `${days} días, ` : `${days} día, `) : ""}
        {hours > 0
          ? hours > 1
            ? `${hours} horas y `
            : `${hours} hora y `
          : ""}
        {minutes === 1 ? `${minutes} minuto` : `${minutes} minutos`}
      </>
    );
  }

  return (
    <>
      {years > 0 ? (years > 1 ? `${years} años` : `${years} año`) : ""}
      {months > 0 ? (months > 1 ? `, ${months} meses` : `, ${months} mes`) : ""}
      {days > 0 ? (days > 1 ? ` y ${days} días` : ` y ${days} día`) : ""}
    </>
  );
}

export default function WorldChampionsList() {
  const { champions } = useWorldChampionsContext();
  const [now, setNow] = useState(() => new Date());

  const championsWithDuration = useMemo(
    () =>
      champions.map((champion) => ({
        ...champion,
        duration: intervalToDuration({
          start: new Date(champion.lastChampionDate),
          end: now,
        }),
      })),
    [champions, now]
  );

  useEffect(() => {
    const refresh = setInterval(() => setNow(new Date()));
    return () => clearInterval(refresh);
  }, []);

  return (
    <ul className={styles.countriesList}>
      {championsWithDuration.map((champion, index) => (
        <li key={champion.slug} className={styles.countryListItem}>
          <CountryFlag
            champion={champion}
            imageClassName={styles.countryFlag}
            fallbackClassName={styles.countryFlagFallback}
          />
          {index === 0 ? (
            <span className={styles.lastChampionCountry}>
              {champion.displayName}: {formatDuration(champion.duration, true)}
            </span>
          ) : (
            <span>
              {champion.displayName}: {formatDuration(champion.duration, false)}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
