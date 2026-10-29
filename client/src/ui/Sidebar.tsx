import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import { House } from "lucide-react";
import CustomNavLink from "./CustomNavLink";

type SidebarProps = { children: ReactNode; isShowSidebar: boolean };

function Sidebar({ children, isShowSidebar }: SidebarProps) {
  const { t } = useTranslation();
  return (
    <div
      className={`bg-secondary-0 md:row-start-1 md:row-span-2 border-e border-secondary-200 p-4 transition-all duration-300 ease-in-out
        ${!isShowSidebar ? "hidden" : "block"}
        `}
    >
      <ul className="flex flex-col gap-y-4">
        <CustomNavLink to="/">
          <House />
          <span>{t("nav.home")}</span>
        </CustomNavLink>
        {children}
      </ul>
    </div>
  );
}
export default Sidebar;
