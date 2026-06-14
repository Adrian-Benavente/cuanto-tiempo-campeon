import React, { useEffect, useState } from "react";
import { useLocale } from "../../context/LocaleContext";
import styles from "./InstallPrompt.module.css";

export default function InstallPrompt() {
  const { t } = useLocale();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function handleBeforeInstall(event) {
      event.preventDefault();
      setDeferredPrompt(event);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  if (!deferredPrompt || dismissed) {
    return null;
  }

  async function handleInstall() {
    await deferredPrompt.prompt();
    setDeferredPrompt(null);
    setDismissed(true);
  }

  return (
    <div className={styles.banner}>
      <button className={styles.button} onClick={handleInstall} type="button">
        {t("addToHome")}
      </button>
      <button
        className={styles.dismiss}
        onClick={() => setDismissed(true)}
        type="button"
        aria-label="Cerrar"
      >
        ×
      </button>
    </div>
  );
}
