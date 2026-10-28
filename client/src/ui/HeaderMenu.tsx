import DarkModeToggle from "./DarkModeToggle";
import LanguageToggle from "./LanguageToggle";
import UserAvatar from "../features/authentication/UserAvatar";
import { useNavigate } from "react-router-dom";
import { HiArrowLeftOnRectangle } from "react-icons/hi2";
import useUser from "../features/authentication/useUser";
import Logout from "../features/authentication/Logout";

function HeaderMenu() {
  const { user } = useUser();
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/auth", { replace: true });
  };
  return (
    <ul className="flex items-center gap-x-4">
      <UserAvatar />
      <li className="flex">
        <DarkModeToggle />
      </li>
      <li className="flex">
        <LanguageToggle />
      </li>
      {user ? (
        <li className="flex">
          <Logout />
        </li>
      ) : (
        <li className="flex hover:text-rose-500">
          <button onClick={handleClick}>
            <HiArrowLeftOnRectangle className="h-5 w-5 text-secondary-500 hover:text-success ltr:-scale-x-100" />
          </button>
        </li>
      )}
    </ul>
  );
}
export default HeaderMenu;
