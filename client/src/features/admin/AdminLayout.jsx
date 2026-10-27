import AppLayout from "../../ui/AppLayout";
import CustomNavLink from "../../ui/CustomNavLink";
import Sidebar from "../../ui/Sidebar";
import { IoIosApps } from "react-icons/io";
import { MdOutlinePostAdd } from "react-icons/md";
import { GoHomeFill } from "react-icons/go";
import { FaUser } from "react-icons/fa6";
import { AiFillDashboard } from "react-icons/ai";

function AdminLayout() {
  return (
    <AppLayout>
      <Sidebar>
        <CustomNavLink to="dashboard">
          <AiFillDashboard />
          <span>داشبورد</span>
        </CustomNavLink>

        <CustomNavLink to="users">
          <FaUser />
          <span>کاربران</span>
        </CustomNavLink>

        <CustomNavLink to="projects">
          <IoIosApps />
          <span>پروژه ها</span>
        </CustomNavLink>

        <CustomNavLink to="proposals">
          <MdOutlinePostAdd />
          <span>درخواست ها</span>
        </CustomNavLink>
      </Sidebar>
    </AppLayout>
  );
}
export default AdminLayout;
