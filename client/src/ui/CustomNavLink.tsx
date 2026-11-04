import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";

function CustomNavLink({ children, to }: { children: ReactNode; to: string }) {
  const { setOpenMobile } = useSidebar();

  // NavLink marks the current page with aria-current; the drawer closes once a page is picked.
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        className="aria-[current=page]:bg-sidebar-accent aria-[current=page]:font-medium aria-[current=page]:text-sidebar-accent-foreground"
      >
        <NavLink to={to} end={to === "/"} onClick={() => setOpenMobile(false)}>
          {children}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
export default CustomNavLink;
