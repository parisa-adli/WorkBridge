import { useTranslation } from "react-i18next";
import { ArrowLeft, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { ROLE_HOME } from "../constants";
import useUser from "../features/authentication/useUser";
import { buttonClass } from "../ui/Button";
import EmptyState from "../ui/EmptyState";

// Reference page for the Part F re-skins: tokens and ui/ components only.
function NotAccess() {
  const { t } = useTranslation();
  const { user } = useUser();
  const home = user && ROLE_HOME[user.role];

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <EmptyState
        titleAs="h1"
        icon={
          <span className="grid h-18 w-18 place-items-center rounded-full bg-accent text-destructive">
            <Lock aria-hidden="true" className="size-8" />
          </span>
        }
        title={t("pages.notAccess")}
        description={t("pages.notAccessBody")}
      >
        {home && (
          <Link to={`${home}/dashboard`} className={buttonClass()}>
            {t("pages.goDashboard")}
            <ArrowLeft aria-hidden="true" className="size-5 ltr:-scale-x-100" />
          </Link>
        )}
        <Link to="/" className={buttonClass({ variant: home ? "ghost" : "primary" })}>
          {t("pages.home")}
        </Link>
      </EmptyState>
    </main>
  );
}
export default NotAccess;
