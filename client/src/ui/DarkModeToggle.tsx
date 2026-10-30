import { useTranslation } from "react-i18next";
import { Moon, Sun } from "lucide-react";
import { useDarkMode } from "../context/DarkModeContext";
import Button from "./Button";

function DarkModeToggle() {
  const { t } = useTranslation();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <Button variant="ghost" size="icon" onClick={toggleDarkMode} aria-label={t("common.darkMode")} aria-pressed={isDarkMode}>
      {isDarkMode ? <Sun /> : <Moon />}
    </Button>
  );
}
export default DarkModeToggle;
