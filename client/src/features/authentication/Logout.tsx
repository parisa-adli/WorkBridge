import { LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import useLogout from "./useLogout";
import Loading from "../../ui/Loading";

function Logout() {
  const { isPending, logout } = useLogout();
  const { t } = useTranslation();
  return isPending ? (
    <Loading />
  ) : (
    <button onClick={() => logout()} aria-label={t("auth.logout")} title={t("auth.logout")}>
      <LogOut className="size-5 text-secondary-500 hover:text-error ltr:-scale-x-100" />
    </button>
  );
}
export default Logout;
