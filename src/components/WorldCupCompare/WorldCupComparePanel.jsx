import React, { useMemo } from "react";
import { useLocale } from "../../context/LocaleContext";
import styles from "./WorldCupComparePanel.module.css";

const METRIC_KEYS = [
  "champion",
  "runnerUp",
  "thirdPlace",
  "totalGoals",
  "goalsPerMatch",
  "attendance",
  "topScorer",
  "bestPlayer",
];

function formatMetricValue(key, value, t) {
  if (value === null || value === undefined || value === "") {
    return t("compareValueMissing");
  }

  if (key === "attendance") {
    return Number(value).toLocaleString();
  }

  if (key === "goalsPerMatch") {
    return Number(value).toFixed(2);
  }

  if (key === "totalGoals") {
    return String(Math.round(Number(value)));
  }

  return String(value);
}

export default function WorldCupComparePanel({
  years = [],
  rows = [],
  status = "idle",
  onClear,
}) {
  const { t } = useLocale();

  const rowsByYear = useMemo(() => {
    const map = new Map();

    rows.forEach((row) => {
      map.set(row.year, row);
    });

    return map;
  }, [rows]);

  if (years.length !== 2) {
    return null;
  }

  return (
    <div className={styles.panel} aria-live="polite">
      <div className={styles.header}>
        <h3 className={styles.title}>{t("comparePanelTitle")}</h3>
        <button type="button" className={styles.clearButton} onClick={onClear}>
          {t("compareClear")}
        </button>
      </div>

      {status === "loading" && (
        <p className={styles.status}>{t("compareLoading")}</p>
      )}

      {status === "error" && (
        <p className={styles.status} role="status">
          {t("compareError")}
        </p>
      )}

      {status === "success" && (
        <div className={styles.columns}>
          {years.map((year) => {
            const row = rowsByYear.get(year) ?? {};

            return (
              <div className={styles.column} key={year}>
                <h4 className={styles.yearTitle}>{year}</h4>
                <dl className={styles.metrics}>
                  {METRIC_KEYS.map((key) => (
                    <div className={styles.metricRow} key={key}>
                      <dt className={styles.metricLabel}>
                        {t(`compareMetric_${key}`)}
                      </dt>
                      <dd className={styles.metricValue}>
                        {formatMetricValue(key, row[key], t)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
