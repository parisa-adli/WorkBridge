import useAdminDashboardStats from "../features/admin/useAdminDashboardStats";
import Dashboard from "../ui/Dashboard";

function AdminDashboard() {
  return <Dashboard {...useAdminDashboardStats()} />;
}
export default AdminDashboard;
