import React, { useCallback, useEffect, useState } from "react";
import { intervalToDuration } from "date-fns";
import worldChampionDates from "../../api/world-champion-dates";
import styles from "./WorldChampionsList.module.css";
import countryFlags from "../../api/flags";
import upperFirst from "../../utils/upperFirst";

export default function WorldChampionsList() {
  const [allTimeWorldChampions, setAllTimeWorldChampions] = useState([]);

  const getWorldChampionDates = useCallback(
    () =>
      Object.entries(worldChampionDates)
        .sort(([, a], [, b]) => b - a)
        .map(([country, championDate]) => {
          const { years, months, days, hours, minutes } = intervalToDuration({
            start: championDate,
            end: new Date(),
          });

          return {
            [country]: { years, months, days, hours, minutes },
          };
        }),
    []
  );

  useEffect(() => {
    setAllTimeWorldChampions(getWorldChampionDates());
    const refresh = setInterval(() =>
      setAllTimeWorldChampions(getWorldChampionDates())
    );
    return () => clearInterval(refresh);
  }, []);

  return (
    <ul className={styles.countriesList}>
      {allTimeWorldChampions.map((country, index) =>
        Object.entries(country).map(
          ([name, { years, months, days, hours, minutes }]) => (
            <li key={name} className={styles.countryListItem}>
              <img
                className={styles.countryFlag}
                src={countryFlags[name]}
                alt={`Bandera de ${upperFirst(name)}`}
              />
              {index === 0 ? (
                <span className={styles.lastChampionCountry}>
                  {upperFirst(name)}:{" "}
                  {years > 0
                    ? years > 1
                      ? `${years} años, `
                      : `${years} año, `
                    : ""}
                  {months > 0
                    ? months > 1
                      ? `${months} meses, `
                      : `${months} mes, `
                    : ""}
                  {days > 0
                    ? days > 1
                      ? `${days} días, `
                      : `${days} día, `
                    : ""}
                  {hours > 0
                    ? hours > 1
                      ? `${hours} horas y `
                      : `${hours} hora y `
                    : ""}
                  {minutes === 1 ? `${minutes} minuto` : `${minutes} minutos`}
                </span>
              ) : (
                <span>
                  {upperFirst(name)}:{" "}
                  {years > 0
                    ? years > 1
                      ? `${years} años, `
                      : `${years} año, `
                    : ""}
                  {months > 0
                    ? months > 1
                      ? `${months} meses y `
                      : `${months} mes y `
                    : ""}
                  {days > 0 ? (days > 1 ? `${days} días` : `${days} día`) : ""}
                </span>
              )}
            </li>
          )
        )
      )}
    </ul>
  );
}
