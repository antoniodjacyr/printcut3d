"use client";

import { Locale, localeFlags, localeLabels, supportedLocales } from "@/lib/i18n";

type LanguageSwitcherProps = {
  onLocaleChange: (locale: Locale) => void;
  selectedLocale: Locale;
};

export function LanguageSwitcher({ onLocaleChange, selectedLocale }: LanguageSwitcherProps) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5">
      {supportedLocales.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => onLocaleChange(locale)}
          className={`rounded-full px-2 py-1 text-sm transition ${
            selectedLocale === locale ? "bg-neon/20 text-white" : "text-zinc-300 hover:bg-white/10"
          }`}
          aria-label={`Switch language to ${localeLabels[locale]}`}
          title={localeLabels[locale]}
        >
          <span className="mr-1">{localeFlags[locale]}</span>
          <span>{locale.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}
