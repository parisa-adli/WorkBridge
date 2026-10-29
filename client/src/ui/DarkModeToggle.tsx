import { useTranslation } from "react-i18next";
import { Moon, Sun } from "lucide-react";
import { useDarkMode } from "../context/DarkModeContext";

function DarkModeToggle() {
  const { t } = useTranslation();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button onClick={toggleDarkMode} aria-label={t("common.darkMode")} aria-pressed={isDarkMode}>
      {isDarkMode ? (
        <Sun className="size-5 text-primary-900" />
      ) : (
        <Moon className="size-5 text-primary-900" />
      )}
    </button>
  );
}
export default DarkModeToggle;
