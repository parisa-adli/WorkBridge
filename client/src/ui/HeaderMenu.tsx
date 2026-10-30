import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import DarkModeToggle from "./DarkModeToggle";
import LanguageToggle from "./LanguageToggle";
import { buttonClass } from "./Button";
import UserAvatar from "../features/authentication/UserAvatar";
import useUser from "../features/authentication/useUser";

function HeaderMenu() {
  const { t } = useTranslation();
  const { user } = useUser();
  return (
    <div className="flex items-center gap-x-1">
      <UserAvatar />
      <DarkModeToggle />
      <LanguageToggle />
      {!user && (
        <Link to="/auth" replace aria-label={t("auth.login")} title={t("auth.login")} className={buttonClass({ variant: "ghost", size: "icon" })}>
          {/* lucide's LogIn is the mirror of the old icon, so it flips in rtl */}
          <LogIn className="rtl:-scale-x-100" />
        </Link>
      )}
    </div>
  );
}
export default HeaderMenu;
