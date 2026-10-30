import { LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import useLogout from "./useLogout";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

// An item of the header's user menu.
function Logout() {
  const { isPending, logout } = useLogout();
  const { t } = useTranslation();
  return (
    <DropdownMenuItem variant="destructive" disabled={isPending} onSelect={() => logout()}>
      <LogOut className="ltr:-scale-x-100" />
      {t("auth.logout")}
    </DropdownMenuItem>
  );
}
export default Logout;
