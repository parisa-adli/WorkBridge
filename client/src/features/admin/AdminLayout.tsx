import { useTranslation } from "react-i18next";
import AppLayout from "../../ui/AppLayout";
import CustomNavLink from "../../ui/CustomNavLink";
import { FilePlus, Grip, LayoutDashboard, LayoutGrid, User } from "lucide-react";

function AdminLayout() {
  const { t } = useTranslation();
  return (
    <AppLayout>
      <CustomNavLink to="dashboard">
        <LayoutDashboard />
        <span>{t("nav.dashboard")}</span>
      </CustomNavLink>

      <CustomNavLink to="users">
        <User />
        <span>{t("nav.users")}</span>
      </CustomNavLink>

      <CustomNavLink to="categories">
        <LayoutGrid />
        <span>{t("nav.categories")}</span>
      </CustomNavLink>

      <CustomNavLink to="projects">
        <Grip />
        <span>{t("nav.projects")}</span>
      </CustomNavLink>

      <CustomNavLink to="proposals">
        <FilePlus />
        <span>{t("nav.proposals")}</span>
      </CustomNavLink>
    </AppLayout>
  );
}
export default AdminLayout;
