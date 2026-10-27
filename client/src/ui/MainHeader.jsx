import { Link } from "react-router-dom";
import UserAvatar from "../features/authentication/UserAvatar";
import HeaderMenu from "./HeaderMenu";

function MainHeader() {
  return (
    <div className=" md:row-auto py-4 md:px-8 border-b border-secondary-200">
      <div className="container xl:max-w-screen-xl flex items-center justify-between">
        <Link to="/" className="font-bold text-lg text-secondary-700">
          فریلنسر اپ
        </Link>
        <div className="flex items-center justify-around gap-x-8">
          <HeaderMenu />
        </div>
      </div>
    </div>
  );
}
export default MainHeader;
