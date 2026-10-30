import { useTranslation } from "react-i18next";
import { ArrowRight, House } from "lucide-react";
import { Link } from "react-router-dom";
import useMoveBack from "../hooks/useMoveBack";
import Button, { buttonClass } from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import { toPersianNumbers } from "../utils/toPersianNumber";

// Reference page for the Part F re-skins: tokens and ui/ components only.
function NotFound() {
  const { t } = useTranslation();
  const moveBack = useMoveBack();

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <EmptyState
        titleAs="h1"
        icon={
          <span aria-hidden="true" className="text-7xl font-bold text-primary">
            {toPersianNumbers(404)}
          </span>
        }
        title={t("pages.notFound")}
        description={t("pages.notFoundBody")}
      >
        <Link to="/" className={buttonClass()}>
          <House aria-hidden="true" className="size-5" />
          {t("pages.home")}
        </Link>
        <Button variant="outline" onClick={moveBack}>
          <ArrowRight aria-hidden="true" className="size-5 ltr:-scale-x-100" />
          {t("common.back")}
        </Button>
      </EmptyState>
    </main>
  );
}
export default NotFound;
