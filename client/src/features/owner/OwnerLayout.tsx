import { useTranslation } from "react-i18next";
import AppLayout from "../../ui/AppLayout";
import CustomNavLink from "../../ui/CustomNavLink";
import { Grip, LayoutDashboard } from "lucide-react";

function OwnerLayout() {
  const { t } = useTranslation();
  return (
    <AppLayout>
      <CustomNavLink to="dashboard">
        <LayoutDashboard />
        <span>{t("nav.dashboard")}</span>
      </CustomNavLink>

      <CustomNavLink to="projects">
        <Grip />
        <span>{t("nav.projects")}</span>
      </CustomNavLink>
    </AppLayout>
  );
}
export default OwnerLayout;
