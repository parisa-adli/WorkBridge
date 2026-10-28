import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import useShowSidebar from "../hooks/useShowSidebar";

// children: the role's sidebar links (CustomNavLink items)
function AppLayout({ children }: { children: ReactNode }) {
  const { isShowSidebar, toggleSidebar } = useShowSidebar();

  return (
    <div className="grid h-screen grid-cols-1 md:grid-rows-[auto_1fr] md:grid-cols-[15rem_1fr]">
      <Header toggleSidebar={toggleSidebar} isShowSidebar={isShowSidebar} />
      <Sidebar isShowSidebar={isShowSidebar}>{children}</Sidebar>
      <div className="bg-secondary-100 p-8 overflow-y-auto">
        <div className="max-w-screen-lg mx-auto flex flex-col gap-y-12">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
export default AppLayout;
