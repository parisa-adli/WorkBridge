import { useTranslation } from "react-i18next";
function Empty({ resourceName }: { resourceName: string }) {
  const { t } = useTranslation();
  return (
    <p className="font-bold text-secondary-700">{t("common.notFound", { name: resourceName })}</p>
  );
}
export default Empty;
