import { useTranslation } from "react-i18next";
import DarkModeToggle from "./DarkModeToggle";
import LanguageToggle from "./LanguageToggle";
import UserAvatar from "../features/authentication/UserAvatar";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import useUser from "../features/authentication/useUser";
import Logout from "../features/authentication/Logout";

function HeaderMenu() {
  const { t } = useTranslation();
  const { user } = useUser();
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/auth", { replace: true });
  };
  return (
    <ul className="flex items-center gap-x-4">
      <UserAvatar />
      <li className="flex">
        <DarkModeToggle />
      </li>
      <li className="flex">
        <LanguageToggle />
      </li>
      {user ? (
        <li className="flex">
          <Logout />
        </li>
      ) : (
        <li className="flex hover:text-rose-500">
          <button onClick={handleClick} aria-label={t("auth.login")} title={t("auth.login")}>
            {/* lucide's LogIn is the mirror of the old icon, so it flips in rtl */}
            <LogIn className="size-5 text-secondary-500 hover:text-success rtl:-scale-x-100" />
          </button>
        </li>
      )}
    </ul>
  );
}
export default HeaderMenu;
