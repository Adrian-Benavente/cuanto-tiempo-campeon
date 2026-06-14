import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { t as translate } from "../i18n/translations";
import { getParam, updateSearchParams } from "../utils/urlParams";

const STORAGE_KEY = "locale";
const LocaleContext = createContext(null);

function resolveInitialLocale() {
  const fromUrl = getParam("lang");
  if (fromUrl === "en" || fromUrl === "es") {
    return fromUrl;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "es") {
    return stored;
  }

  const browserLang = navigator.language?.toLowerCase() ?? "es";
  return browserLang.startsWith("en") ? "en" : "es";
}

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(resolveInitialLocale);

  const setLocale = useCallback((nextLocale) => {
    setLocaleState(nextLocale);
    localStorage.setItem(STORAGE_KEY, nextLocale);
    updateSearchParams({ lang: nextLocale === "es" ? null : nextLocale });
    document.documentElement.lang = nextLocale;
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    const fromUrl = getParam("lang");
    if (fromUrl === "en" || fromUrl === "es") {
      if (fromUrl !== locale) {
        setLocaleState(fromUrl);
        localStorage.setItem(STORAGE_KEY, fromUrl);
      }
    }
  }, [locale]);

  const t = useCallback((key, vars) => translate(locale, key, vars), [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }

  return context;
}
