import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { House } from "lucide-react";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
} from "@/components/ui/sidebar";
import CustomNavLink from "./CustomNavLink";
import Logo from "./Logo";

// side="left" is the start side, so the sidebar and its drawer sit on the right in fa.
function Sidebar({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <ShadcnSidebar side="left">
      <SidebarHeader className="px-4 pt-4">
        <Link to="/" aria-label={t("app.name")} className="w-fit">
          <Logo variant="full" className="h-8" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <CustomNavLink to="/">
                <House />
                <span>{t("nav.home")}</span>
              </CustomNavLink>
              {children}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </ShadcnSidebar>
  );
}
export default Sidebar;
