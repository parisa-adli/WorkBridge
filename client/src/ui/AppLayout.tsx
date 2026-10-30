import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Sidebar from "./Sidebar";
import HeaderMenu from "./HeaderMenu";
import useUser from "../features/authentication/useUser";
import { cn } from "@/lib/utils";

// children: the role's sidebar links (CustomNavLink items)
function AppLayout({ children }: { children: ReactNode }) {
  const { isLoading } = useUser();

  return (
    <SidebarProvider>
      <Sidebar>{children}</Sidebar>
      {/* min-w-0: beside the fixed sidebar (lg+) a wide table scrolls in its own container, not the page */}
      <SidebarInset className="h-svh min-w-0">
        <header className="border-b py-4">
          <div
            className={cn(
              "container flex items-center justify-between gap-x-8 lg:justify-end xl:max-w-(--breakpoint-lg)",
              isLoading && "opacity-50 blur-xs"
            )}
          >
            <SidebarTrigger className="lg:hidden" />
            <HeaderMenu />
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="mx-auto flex max-w-(--breakpoint-lg) flex-col gap-y-12">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
export default AppLayout;
