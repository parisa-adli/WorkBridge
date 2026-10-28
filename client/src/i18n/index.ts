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

// Server messages by `code`. The server writes Persian and one code can carry several texts
// (each validation rule has its own), so fa shows the message as sent; unknown codes keep it too.
export function apiMessage({ code, message, ...params }: { code?: string; message?: string }) {
  if (i18n.language === "fa" && message) return message;
  const key = `server.${code}`;
  return code && i18n.exists(key) ? i18n.t(key, params) : message;
}
