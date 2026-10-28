import { useTranslation } from "react-i18next";
import {
  HiCollection,
  HiCurrencyDollar,
  HiOutlineViewGrid,
} from "react-icons/hi";
import Stat from "../../ui/Stat";
import type { Project } from "../../types/api";

function Stats({ projects }: { projects: Project[] }) {
  const { t } = useTranslation();
  const numOfProjects = projects.length;
  const numOfAcceptedProjects = projects.filter(
    (project) => project.freelancer
  ).length;
  const numOfProposals = projects.reduce(
    (acc, curr) => acc + curr.proposals.length,
    0
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <Stat
        color="primary"
        title={t("stats.projects")}
        value={numOfProjects}
        icon={<HiOutlineViewGrid className="w-20 h-20" />}
      />
      <Stat
        color="green"
        title={t("stats.assignedProjects")}
        value={numOfAcceptedProjects}
        icon={<HiCurrencyDollar className="w-20 h-20" />}
      />
      <Stat
        color="sky"
        title={t("stats.proposals")}
        value={numOfProposals}
        icon={<HiCollection className="w-20 h-20" />}
      />
    </div>
  );
}
export default Stats;
