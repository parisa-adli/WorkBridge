import { useTranslation } from "react-i18next";
import { CircleDollarSign, Layers, LayoutGrid } from "lucide-react";
import useOwnerProjects from "../projects/useOwnerProjects";
import { LIMITS } from "../../constants";

export default function useOwnerDashboardStats() {
  const { t } = useTranslation();
  const { isLoading, projects, total } = useOwnerProjects(`?limit=${LIMITS.PAGE_SIZE_MAX}`);
  // shortcut: assigned projects and proposals are counted over the first PAGE_SIZE_MAX projects only;
  // move them to a stats endpoint if an owner outgrows that.
  const assigned = projects.filter((project) => project.freelancer).length;
  const proposals = projects.reduce((acc, curr) => acc + curr.proposals.length, 0);

  return {
    isLoading,
    stats: [
      { title: t("stats.projects"), value: total, icon: LayoutGrid },
      { title: t("stats.assignedProjects"), value: assigned, icon: CircleDollarSign },
      { title: t("stats.proposals"), value: proposals, icon: Layers },
    ],
  };
}
