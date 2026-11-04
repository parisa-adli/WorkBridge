import useOwnerDashboardStats from "../features/owner/useOwnerDashboardStats";
import Dashboard from "../ui/Dashboard";

function OwnerDashboard() {
  return <Dashboard {...useOwnerDashboardStats()} />;
}
export default OwnerDashboard;
