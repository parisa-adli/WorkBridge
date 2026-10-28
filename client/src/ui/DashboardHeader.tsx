import { useTranslation } from "react-i18next";
function DashboardHeader() {
  const { t } = useTranslation();
  return (
    <div className="mb-8">
      <h1 className="font-bold text-2xl text-secondary-800 mb-2">{t("dashboard.title")}</h1>
      <p className="text-secondary-600">
        {t("dashboard.subtitle")}
      </p>
    </div>
  );
}
export default DashboardHeader;
