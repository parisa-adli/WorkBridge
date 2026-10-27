import { useLocation } from "react-router-dom";
import useUser from "./useUser";

export default function useAuthorize() {
  const { isLoading, user } = useUser();
  const { pathname } = useLocation();

  let isAuthenticated = false;
  if (user) isAuthenticated = true;

  let isAuthorized = false;

  let isVerified = false;
  if (user && Number(user.status) === 2) isVerified = true;

  const ROLES = {
    admin: "ADMIN",
    owner: "OWNER",
    freelancer: "FREELANCER",
  };

  const desireRole = pathname.split("/").at(1);

  if (Object.keys(ROLES).includes(desireRole)) {
    if (user && user.role === ROLES[desireRole]) isAuthorized = true;
  }

  return { isLoading, isAuthenticated, isAuthorized, user, isVerified };
}
