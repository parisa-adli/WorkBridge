import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown, UserRound } from "lucide-react";
import useUser from "./useUser";
import localized from "../../utils/localized";
import { ROLE_HOME } from "../../constants";
import initials from "../../utils/initials";
import type { User } from "../../types/api";
import Logout from "./Logout";
import Button from "../../ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

// The header's user menu: the avatar and name open the profile link and logout.
function UserAvatar() {
  const { t } = useTranslation();
  const { user } = useUser();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="px-2">
          <Avatar user={user} />
          <span dir="auto">{localized(user, "name")}</span>
          <ChevronDown className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to={`${ROLE_HOME[user.role]}/profile`}>
            <UserRound />
            {t("profile.title")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <Logout />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
export default UserAvatar;
