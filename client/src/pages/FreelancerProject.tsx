import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import useProject from "../features/project/useProject";
import useMoveBack from "../hooks/useMoveBack";
import Loading from "../ui/Loading";
import Empty from "../ui/Empty";
import StatusBadge from "../ui/StatusBadge";
import { PROJECT_STATUS_BADGES } from "../constants";
import type { Proposal, UserRef } from "../types/api";
import localized, { categoryName } from "../utils/localized";
import { toPersianNumbersWithComma } from "../utils/toPersianNumber";
import toLocalDateShort from "../utils/toLocalDateShort";

// Read-only project for freelancers: the server populates only their own proposal.
function FreelancerProject() {
  const { t } = useTranslation();
  const moveBack = useMoveBack();
  const { isLoading, project } = useProject();

  if (isLoading) return <Loading />;
  if (!project) return <Empty resourceName={t("project.resource")} />;

  const owner = project.owner as UserRef;
  const [myProposal] = project.proposals as Proposal[];
  const tags = localized(project, "tags");
  const details = [
    [t("project.category"), categoryName(project.category)],
    [t("roles.owner"), <span key="owner" dir="auto">{localized(owner, "name")}</span>],
    [t("project.budget"), toPersianNumbersWithComma(project.budget)],
    [t("project.deadline"), toLocalDateShort(project.deadline)],
    [t("common.status"), <StatusBadge key="status" status={project.status} badges={PROJECT_STATUS_BADGES} />],
    [
      t("project.yourProposal"),
      myProposal ? <StatusBadge key="proposal" status={myProposal.status} /> : t("project.noProposal"),
    ],
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-x-4">
        <button onClick={moveBack} aria-label={t("common.back")} className="btn btn--primary">
          <ArrowRight className="size-6 ltr:-scale-x-100" />
        </button>
        <h1 className="font-black text-text text-xl" dir="auto">
          {localized(project, "title")}
        </h1>
      </div>
      <p className="text-text-muted whitespace-pre-line" dir="auto">
        {localized(project, "description")}
      </p>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface rounded-xl p-6">
        {details.map(([label, value]) => (
          <div key={label}>
            <dt className="text-text-muted text-sm">{label}</dt>
            <dd className="font-bold mt-1">{value}</dd>
          </div>
        ))}
      </dl>
      {tags.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label={t("project.tags")}>
          {tags.map((tag) => (
            <li key={tag} className="badge badge--secondary" dir="auto">
              {tag}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
export default FreelancerProject;
