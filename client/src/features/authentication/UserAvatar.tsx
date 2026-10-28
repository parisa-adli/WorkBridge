import { Link } from "react-router-dom";
import useUser from "./useUser";
import localized from "../../utils/localized";
import { ROLE_HOME } from "../../constants";
import initials from "../../utils/initials";
import type { User } from "../../types/api";

// The uploaded avatar, or the name's initials when there is none. Decorative: the name is always shown next to it.
export function Avatar({ user, className = "w-6 h-6 text-xs" }: { user: User; className?: string }) {
  return user.avatarUrl ? (
    <img className={`rounded-full object-cover object-center ${className}`} src={user.avatarUrl} alt="" />
  ) : (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center rounded-full bg-primary-soft font-bold text-primary ${className}`}
    >
      {initials(localized(user, "name"))}
    </span>
  );
}

function UserAvatar() {
  const { user } = useUser();

  if (!user) return null;

  return (
    <Link to={`${ROLE_HOME[user.role]}/profile`} className="flex items-center gap-x-2 text-secondary-600">
      <Avatar user={user} />
      <span dir="auto">{localized(user, "name")}</span>
    </Link>
  );
}
export default UserAvatar;
