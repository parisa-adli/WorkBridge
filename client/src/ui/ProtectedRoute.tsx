import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useAuthorize from "../features/authentication/useAuthorize";
import { useEffect, type ReactNode } from "react";
import Loading from "../ui/Loading";
import toast from "react-hot-toast";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // 1. load the authenticated user
  const { isLoading, isAuthenticated, isAuthorized, isVerified } =
    useAuthorize();

  // 2. check if is Authorized or not, check is Authenticated or not
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigate("/auth");
    } else if (!isVerified) {
      toast.error(t("auth.profileNotVerified"));
      navigate("/");
    } else if (!isAuthorized) {
      navigate("/not-access", { replace: true });
    }
  }, [isLoading, isAuthenticated, isAuthorized, isVerified, navigate, t]);

  // 3. while loading => show loading
  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen bg-secondary-100">
        <Loading />
      </div>
    );

  // 4. if user isAuthenticated and isAuthorized => render the app
  if (isAuthenticated && isVerified && isAuthorized) return children;
}
export default ProtectedRoute;
