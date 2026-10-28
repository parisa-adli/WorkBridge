import { useTranslation } from "react-i18next";
import AppLayout from "../../ui/AppLayout";
import CustomNavLink from "../../ui/CustomNavLink";
import { IoIosApps } from "react-icons/io";
import { MdOutlinePostAdd } from "react-icons/md";
import { FaUser } from "react-icons/fa6";
import { AiFillDashboard } from "react-icons/ai";
import { BiCategory } from "react-icons/bi";

function AdminLayout() {
  const { t } = useTranslation();
  return (
    <AppLayout>
      <CustomNavLink to="dashboard">
        <AiFillDashboard />
        <span>{t("nav.dashboard")}</span>
      </CustomNavLink>

      <CustomNavLink to="users">
        <FaUser />
        <span>{t("nav.users")}</span>
      </CustomNavLink>

      <CustomNavLink to="categories">
        <BiCategory />
        <span>{t("nav.categories")}</span>
      </CustomNavLink>

      <CustomNavLink to="projects">
        <IoIosApps />
        <span>{t("nav.projects")}</span>
      </CustomNavLink>

      <CustomNavLink to="proposals">
        <MdOutlinePostAdd />
        <span>{t("nav.proposals")}</span>
      </CustomNavLink>
    </AppLayout>
  );
}
export default AdminLayout;
