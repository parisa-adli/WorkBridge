import { useTranslation } from "react-i18next";
import useUser from "../features/authentication/useUser";
import HeaderMenu from "./HeaderMenu";
import { Menu, X } from "lucide-react";

type HeaderProps = { isShowSidebar: boolean; toggleSidebar: () => void };

function Header({ isShowSidebar, toggleSidebar }: HeaderProps) {
  const { t } = useTranslation();
  const { isLoading } = useUser();

  return (
    <div className="bg-secondary-0 md:row-auto py-4 border-b border-secondary-200">
      <div
        className={`container xl:max-w-(--breakpoint-lg) flex items-center justify-between md:justify-end gap-x-8 
          ${isLoading ? "blur-xs opacity-50" : ""}
          `}
      >
        <button
          onClick={toggleSidebar}
          aria-label={t("common.menu")}
          aria-expanded={isShowSidebar}
          className="md:hidden transition-all duration-300 ease-out"
        >
          {!isShowSidebar ? (
            <Menu className="size-8 text-primary-900" />
          ) : (
            <X className="size-8 text-primary-900" />
          )}
        </button>
        <HeaderMenu />
      </div>
    </div>
  );
}
export default Header;
