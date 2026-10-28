import { createContext, Fragment, useContext, useEffect, type ReactNode } from "react";
import useLocalStorageState from "../hooks/useLocalStorageState";
import i18n, { type Language } from "../i18n";

type LanguageContextValue = { language: Language; toggleLanguage: () => void };

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [stored, setLanguage] = useLocalStorageState<Language>("language", "fa");
  // localStorage is user-editable: anything but "en" means Persian
  const language: Language = stored === "en" ? "en" : "fa";

  // Only true on first mount (saved choice), before any useTranslation subscriber exists,
  // so the formatters' first render already sees the saved language.
  if (i18n.language !== language) void i18n.changeLanguage(language);

  const toggleLanguage = () => {
    const next = language === "fa" ? "en" : "fa";
    void i18n.changeLanguage(next);
    setLanguage(next);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "fa" ? "rtl" : "ltr";
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {/* shortcut: remounts the tree so formatter call sites re-render (form state is lost on switch); drop once Phase 27b leaves every component subscribed via useTranslation */}
      <Fragment key={language}>{children}</Fragment>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (context === undefined)
    throw new Error("LanguageContext was used outside of LanguageProvider");

  return context;
}
