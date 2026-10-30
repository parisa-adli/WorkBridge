import { useTranslation } from "react-i18next";
import { useLanguage } from "../context/LanguageContext";
import Button from "./Button";

function LanguageToggle() {
  const { toggleLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <Button variant="ghost" size="icon" onClick={toggleLanguage} aria-label={`${t("language.other")} ${t("language.switch")}`} className="font-bold">
      {t("language.other")}
    </Button>
  );
}
export default LanguageToggle;
