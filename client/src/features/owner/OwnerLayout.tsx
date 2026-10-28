import { useTranslation } from "react-i18next";
import AppLayout from "../../ui/AppLayout";
import CustomNavLink from "../../ui/CustomNavLink";
import { IoIosApps } from "react-icons/io";
import { AiFillDashboard } from "react-icons/ai";

function OwnerLayout() {
  const { t } = useTranslation();
  return (
    <AppLayout>
      <CustomNavLink to="dashboard">
        <AiFillDashboard />
        <span>{t("nav.dashboard")}</span>
      </CustomNavLink>

      <CustomNavLink to="projects">
        <IoIosApps />
        <span>{t("nav.projects")}</span>
      </CustomNavLink>
    </AppLayout>
  );
}
export default OwnerLayout;
