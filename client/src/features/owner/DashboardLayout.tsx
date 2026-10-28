import useOwnerProjects from "../projects/useOwnerProjects";
import Stats from "./Stats";
import Loading from "../../ui/Loading";
import DashboardHeader from "../../ui/DashboardHeader";
import { LIMITS } from "../../constants";

function DashboardLayout() {
  const { isLoading, projects, total } = useOwnerProjects(`?limit=${LIMITS.PAGE_SIZE_MAX}`);
  if (isLoading) return <Loading />;
  return (
    <div>
      <DashboardHeader />
      <Stats projects={projects} total={total} />
    </div>
  );
}
export default DashboardLayout;
