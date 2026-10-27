import { useLocation } from "react-router-dom";
import useUser from "./useUser";
import { ROLE_HOME, STATUS } from "../../constants";

export default function useAuthorize() {
  const { isLoading, user } = useUser();
  const { pathname } = useLocation();

  let isAuthenticated = false;
  if (user) isAuthenticated = true;

  let isVerified = false;
  if (user && Number(user.status) === STATUS.ACCEPTED) isVerified = true;

  const desireRole = pathname.split("/").at(1);
  const isAuthorized = !!user && ROLE_HOME[user.role] === `/${desireRole}`;

  return { isLoading, isAuthenticated, isAuthorized, user, isVerified };
}
