import { useNavigate } from "react-router-dom";
import useAuthorize from "../features/authentication/useAuthorize";
import { useEffect } from "react";
import Loading from "../ui/Loading";
import toast from "react-hot-toast";

function ProtectedRoute({ children }) {
  const negative = useNavigate();

  // 1. load the authenticated user
  const { isLoading, isAuthenticated, isAuthorized, isVerified } =
    useAuthorize();

  // 2. check if is Authorized or not, check is Authenticated or not
  useEffect(() => {
    if (!isAuthenticated && !isLoading) negative("/auth");
    if (!isVerified && !isLoading) {
      toast.error("پروفایل شما هنوز تایید نشده است");
      negative("/");
    }

    if (!isAuthorized && !isLoading) negative("/not-access", { replace: true });
  }, [isLoading, isAuthenticated, isAuthorized, negative]);

  // 3. while loading => show loading
  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen bg-secondary-100">
        <Loading />
      </div>
    );

  // 4. if user isAuthenticated and isAuthorized => render the app
  if (isAuthenticated && isAuthorized) return children;
}
export default ProtectedRoute;
