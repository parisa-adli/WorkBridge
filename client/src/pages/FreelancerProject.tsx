import { useTranslation } from "react-i18next";
import { ArrowRight, CircleAlert } from "lucide-react";
import useProject from "../features/project/useProject";
import useMoveBack from "../hooks/useMoveBack";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Loading from "../ui/Loading";
import { Badge } from "@/components/ui/badge";
import Empty from "../ui/Empty";
import EmptyState from "../ui/EmptyState";
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
  const { isLoading, isError, project } = useProject();

  if (isLoading) return <Loading />;
  if (isError) return <EmptyState icon={<CircleAlert className="text-destructive" />} title={t("project.loadError")} />;
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
        <Button variant="outline" size="icon" onClick={moveBack} aria-label={t("common.back")}>
          <ArrowRight className="ltr:-scale-x-100" />
        </Button>
        <h1 className="font-black text-xl" dir="auto">
          {localized(project, "title")}
        </h1>
      </div>
      <p className="text-muted-foreground whitespace-pre-line" dir="auto">
        {localized(project, "description")}
      </p>
      <Card>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {details.map(([label, value]) => (
            <div key={label}>
              <dt className="text-muted-foreground text-sm">{label}</dt>
              <dd className="font-bold mt-1">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>
      {tags.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label={t("project.tags")}>
          {tags.map((tag) => (
            <li key={tag}>
              <Badge variant="secondary" dir="auto">
                {tag}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
export default FreelancerProject;
