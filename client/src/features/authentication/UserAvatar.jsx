import useUser from "./useUser";
import usePickUser from "../../hooks/usePickUser";

function UserAvatar() {
  const { user } = useUser();
  const pickUser = usePickUser();

  return (
    <div
      onClick={() => pickUser(user.role)}
      className="flex items-center gap-x-2 text-secondary-600 cursor-pointer"
    >
      <img
        className="w-6 h-6 rounded-full object-cover object-center"
        src="/user.jpg"
        alt="user-account"
      />
      <span>{user?.name}</span>
    </div>
  );
}
export default UserAvatar;
