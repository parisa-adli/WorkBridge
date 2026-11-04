import { useTranslation } from "react-i18next";
import { CircleDollarSign, Layers, User } from "lucide-react";
import useProposals from "../proposals/useProposals";
import useProjects from "../../hooks/useProjects";
import useUsers from "./useUsers";

export default function useAdminDashboardStats() {
  const { t } = useTranslation();
  const proposals = useProposals();
  const projects = useProjects();
  const users = useUsers();

  return {
    isLoading: proposals.isLoading || projects.isLoading || users.isLoading,
    stats: [
      { title: t("stats.users"), value: users.total, icon: User },
      { title: t("stats.proposals"), value: proposals.total, icon: CircleDollarSign },
      { title: t("stats.projects"), value: projects.total, icon: Layers },
    ],
  };
}
