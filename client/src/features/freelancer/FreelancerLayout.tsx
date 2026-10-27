import AppLayout from "../../ui/AppLayout";
import CustomNavLink from "../../ui/CustomNavLink";
import { IoIosApps } from "react-icons/io";
import { MdOutlinePostAdd } from "react-icons/md";
import { AiFillDashboard } from "react-icons/ai";

function FreelancerLayout() {
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

      <CustomNavLink to="proposals">
        <MdOutlinePostAdd />
        <span>درخواست ها</span>
      </CustomNavLink>
    </AppLayout>
  );
}
export default FreelancerLayout;
