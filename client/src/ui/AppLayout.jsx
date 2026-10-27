import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import useShowSidebar from "../hooks/useShowSidebar";
import React from "react";

function AppLayout({ children }) {
  const { isShowSidebar, toggleSidebar } = useShowSidebar();

  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === Sidebar) {
      return React.cloneElement(child, { isShowSidebar });
    }
    return child;
  });

  return (
    <div className="grid h-screen grid-cols-1 md:grid-rows-[auto_1fr] md:grid-cols-[15rem_1fr]">
      <Header toggleSidebar={toggleSidebar} isShowSidebar={isShowSidebar} />
      {/* <Sidebar /> */}
      {enhancedChildren}
      <div className="bg-secondary-100 p-8 overflow-y-auto">
        <div className="max-w-screen-lg mx-auto flex flex-col gap-y-12">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
export default AppLayout;
