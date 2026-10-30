import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import { House } from "lucide-react";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";
import CustomNavLink from "./CustomNavLink";

// side="left" is the start side, so the sidebar and its drawer sit on the right in fa.
function Sidebar({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <ShadcnSidebar side="left">
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
