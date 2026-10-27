import AppLayout from "../../ui/AppLayout";
import CustomNavLink from "../../ui/CustomNavLink";
import { IoIosApps } from "react-icons/io";
import { AiFillDashboard } from "react-icons/ai";

function OwnerLayout() {
  return (
    <AppLayout>
      <CustomNavLink to="dashboard">
        <AiFillDashboard />
        <span>داشبورد</span>
      </CustomNavLink>

      <CustomNavLink to="projects">
        <IoIosApps />
        <span>پروژه ها</span>
      </CustomNavLink>
    </AppLayout>
  );
}
export default OwnerLayout;
