import DashboardHeader from "../../ui/DashboardHeader";
import Loading from "../../ui/Loading";
import useProposals from "../proposals/useProposals";
import Stats from "./Stats";
import { LIMITS } from "../../constants";

function DashboardLayout() {
  const { isLoading, proposals, total } = useProposals(`?limit=${LIMITS.PAGE_SIZE_MAX}`);
  if (isLoading) return <Loading />;
  return (
    <div>
      <DashboardHeader />
      <Stats proposals={proposals} total={total} />
    </div>
  );
}
export default DashboardLayout;
