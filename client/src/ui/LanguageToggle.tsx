import { useTranslation } from "react-i18next";
import { useLanguage } from "../context/LanguageContext";

function LanguageToggle() {
  const { toggleLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <button
      onClick={toggleLanguage}
      aria-label={t("language.switch")}
      className="text-sm font-bold text-primary-900"
    >
      {t("language.other")}
    </button>
  );
}
export default LanguageToggle;
