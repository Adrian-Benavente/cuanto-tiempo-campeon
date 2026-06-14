import React from "react";
import styles from "./LoadingSkeleton.module.css";

const RANKING_PLACEHOLDERS = 7;

export default function LoadingSkeleton() {
  return (
    <div className={styles.skeleton} aria-busy="true" aria-label="Cargando datos">
      <div className={styles.heroSkeleton}>
        <div className={`${styles.block} ${styles.flagBlock}`} />
        <div className={styles.heroContent}>
          <div className={`${styles.block} ${styles.titleBlock}`} />
          <div className={`${styles.block} ${styles.subtitleBlock}`} />
          <div className={styles.countdownSkeleton}>
            {Array.from({ length: 4 }).map((_, index) => (
              <div className={`${styles.block} ${styles.countdownBlock}`} key={index} />
            ))}
          </div>
        </div>
      </div>

      <div className={styles.panelSkeleton}>
        <div className={`${styles.block} ${styles.sectionTitleBlock}`} />
        <ul className={styles.listSkeleton}>
          {Array.from({ length: RANKING_PLACEHOLDERS }).map((_, index) => (
            <li className={styles.rowSkeleton} key={index}>
              <div className={`${styles.block} ${styles.rankBlock}`} />
              <div className={`${styles.block} ${styles.flagSmallBlock}`} />
              <div className={`${styles.block} ${styles.nameBlock}`} />
              <div className={`${styles.block} ${styles.badgeBlock}`} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
