import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import fa from "./fa.json";
import en from "./en.json";

export type Language = "fa" | "en";

// Inline resources make init and changeLanguage synchronous.
void i18n.use(initReactI18next).init({
  resources: { fa: { translation: fa }, en: { translation: en } },
  lng: "fa",
  fallbackLng: "fa",
  interpolation: { escapeValue: false },
});

// Intl locale for the active language; formatters read it on each call.
export const activeLocale = () => (i18n.language === "en" ? "en-US" : "fa-IR");

export default i18n;
