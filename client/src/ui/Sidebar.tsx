import type { ReactNode } from "react";
import { GoHomeFill } from "react-icons/go";
import CustomNavLink from "./CustomNavLink";

type SidebarProps = { children: ReactNode; isShowSidebar: boolean };

function Sidebar({ children, isShowSidebar }: SidebarProps) {
  return (
    <div
      className={`bg-secondary-0 md:row-start-1 md:row-span-2 border-l border-secondary-200 p-4 transition-all duration-300 ease-in-out
        ${!isShowSidebar ? "hidden" : "block"}
        `}
    >
      <ul className="flex flex-col gap-y-4">
        <CustomNavLink to="/">
          <GoHomeFill />
          <span>خانه</span>
        </CustomNavLink>
        {children}
        {/* <li>
          <CustomNavLink to="/owner/dashboard">
            <GoHomeFill />
            <span>داشبورد</span>
          </CustomNavLink>
        </li>
        <li>
          <CustomNavLink to="/owner/projects">
            <IoIosApps />
            <span>پروژه ها</span>
          </CustomNavLink>
        </li> */}
      </ul>
    </div>
  );
}
export default Sidebar;
