import { useTranslation } from "react-i18next";
import { HiArrowRight } from "react-icons/hi";
import { Link } from "react-router-dom";

function NotAccess() {
  const { t } = useTranslation();
  return (
    <div className="h-screen bg-secondary-0 p-10">
      <div className="container xl:max-w-screen-xl">
        <div className="sm:max-w-sm flex justify-center">
          <div>
            <h1 className="text-xl font-bold text-secondary-700 mb-8">
              {t("pages.notAccess")}
            </h1>
            <Link
              to="/"
              className="flex items-center gap-x-2 bg-primary-600 py-2 px-4 rounded-lg mb-4 text-secondary-50 "
            >
              <HiArrowRight className="w-6 h-6 text-secondary-50" />
              {t("pages.backHome")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
export default NotAccess;
