"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Locale, getInitialLocale, supportedLocales } from "@/lib/i18n";

type LocaleContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const STORAGE_KEY = "printcut3d.locale";
const LocaleContext = createContext<LocaleContextType | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && supportedLocales.includes(stored)) {
      setLocaleState(stored);
      return;
    }
    setLocaleState(getInitialLocale(navigator.language));
  }, []);

  const setLocale = (value: Locale) => {
    localStorage.setItem(STORAGE_KEY, value);
    setLocaleState(value);
  };

  const ctx = useMemo(() => ({ locale, setLocale }), [locale]);
  return <LocaleContext.Provider value={ctx}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used inside LocaleProvider");
  }
  return context;
}
