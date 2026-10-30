import { Link } from "react-router-dom";
import useUser from "./useUser";
import localized from "../../utils/localized";
import { ROLE_HOME } from "../../constants";
import initials from "../../utils/initials";
import type { User } from "../../types/api";
import { Avatar as AvatarRoot, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// The uploaded avatar, or the name's initials when there is none (or it fails to load). Decorative: the name is always shown next to it.
export function Avatar({ user, className = "size-6 text-xs" }: { user: User; className?: string }) {
  return (
    <AvatarRoot aria-hidden="true" className={className}>
      {user.avatarUrl && <AvatarImage className="object-cover" src={user.avatarUrl} alt="" />}
      <AvatarFallback className="text-[length:inherit] font-bold">{initials(localized(user, "name"))}</AvatarFallback>
    </AvatarRoot>
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
