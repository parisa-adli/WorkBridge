import { useNavigate } from "react-router-dom";
import useUser from "./useUser";
import redirectByRole from "../../utils/redirectByRole";

function UserAvatar() {
  const { user } = useUser();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div
      onClick={() => redirectByRole(navigate, user.role)}
      className="flex items-center gap-x-2 text-secondary-600 cursor-pointer"
    >
      <img
        className="w-6 h-6 rounded-full object-cover object-center"
        src="/user.jpg"
        alt="user-account"
      />
      <span>{user.name}</span>
    </div>
  );
}
export default UserAvatar;
