import DashboardHeader from "../../ui/DashboardHeader";
import Loading from "../../ui/Loading";
import useProposals from "../proposals/useProposals";
import useProjects from "../../hooks/useProjects";
import useUsers from "./useUsers";
import Stats from "./Stats";

function DashboardLayout() {
  const { isLoading: isLoading1, total: proposals } = useProposals();
  const { isLoading: isLoading2, total: projects } = useProjects();
  const { isLoading: isLoading3, total: users } = useUsers();

  if (isLoading1 || isLoading2 || isLoading3) return <Loading />;

  return (
    <div>
      <DashboardHeader />
      <Stats proposals={proposals} projects={projects} users={users} />
    </div>
  );
}
export default DashboardLayout;
