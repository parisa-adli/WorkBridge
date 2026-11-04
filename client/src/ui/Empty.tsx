import { useTranslation } from "react-i18next";
import { Empty as EmptyRoot, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

function Empty({ resourceName }: { resourceName: string }) {
  const { t } = useTranslation();
  return (
    <EmptyRoot>
      <EmptyHeader>
        <EmptyTitle>{t("common.notFound", { name: resourceName })}</EmptyTitle>
      </EmptyHeader>
    </EmptyRoot>
  );
}
export default Empty;
