import { HiMenu } from "react-icons/hi";
import UserAvatar from "../features/authentication/UserAvatar";
import useUser from "../features/authentication/useUser";
import HeaderMenu from "./HeaderMenu";
import { FiMenu } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";

function Header({ isShowSidebar, toggleSidebar }) {
  const { isLoading } = useUser();

  return (
    <div className="bg-secondary-0 md:row-auto py-4 border-b border-secondary-200">
      <div
        className={`container xl:max-w-screen-lg flex items-center justify-between md:justify-end gap-x-8 
          ${isLoading ? "blur-sm opacity-50" : ""}
          `}
      >
        <button
          onClick={toggleSidebar}
          className="md:hidden transition-all duration-300 ease-out"
        >
          {!isShowSidebar ? (
            <FiMenu className="h-8 w-8 text-primary-900" />
          ) : (
            <RxCross2 className="h-8 w-8 text-primary-900" />
          )}
        </button>
        <HeaderMenu />
      </div>
    </div>
  );
}
export default Header;
