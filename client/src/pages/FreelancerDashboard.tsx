import useFreelancerDashboardStats from "../features/freelancer/useFreelancerDashboardStats";
import Dashboard from "../ui/Dashboard";

function FreelancerDashboard() {
  return <Dashboard {...useFreelancerDashboardStats()} />;
}
export default FreelancerDashboard;
