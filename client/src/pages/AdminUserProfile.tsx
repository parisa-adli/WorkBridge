import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { HiArrowRight } from "react-icons/hi";
import useUserProfile from "../features/admin/users/useUserProfile";
import ChangeUserStatus from "../features/admin/users/ChangeUserStatus";
import { Avatar } from "../features/authentication/UserAvatar";
import useMoveBack from "../hooks/useMoveBack";
import Loading from "../ui/Loading";
import Empty from "../ui/Empty";
import Card from "../ui/Card";
import StatusBadge from "../ui/StatusBadge";
import { PROJECT_STATUS_BADGES } from "../constants";
import localized from "../utils/localized";
import { toPersianNumbersWithComma } from "../utils/toPersianNumber";
import type { Project } from "../types/api";

function ProjectList({ title, projects }: { title: string; projects: Project[] }) {
  const { t } = useTranslation();
  return (
    <Card>
      <h2 className="font-bold mb-4">{title}</h2>
      {projects.length ? (
        <ul className="space-y-2">
          {projects.map((project) => (
            <li key={project._id} className="flex items-center justify-between gap-x-4">
              <Link to={`/admin/projects/${project._id}`} dir="auto" className="text-primary hover:underline">
                {localized(project, "title")}
              </Link>
              <StatusBadge status={project.status} badges={PROJECT_STATUS_BADGES} />
            </li>
          ))}
        </ul>
      ) : (
        <Empty resourceName={t("project.resource")} />
      )}
    </Card>
  );
}

function AdminUserProfile() {
  const { t } = useTranslation();
  const moveBack = useMoveBack();
  const { isLoading, profile } = useUserProfile();

  if (isLoading) return <Loading />;
  if (!profile) return <Empty resourceName={t("user.resource")} />;

  const { user, createdProjects, completedProjects, proposals } = profile;
  const details = [
    [t("auth.email"), user.email],
    [t("auth.phoneNumber"), user.phoneNumber],
    [t("user.role"), t(`roles.${user.role.toLowerCase()}`)],
    [t("profile.biography"), <span key="bio" dir="auto">{localized(user, "biography")}</span>],
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-x-4">
        <button onClick={moveBack} aria-label={t("common.back")} className="btn btn--primary">
          <HiArrowRight className="w-6 h-6 ltr:-scale-x-100" />
        </button>
        <Avatar user={user} className="w-12 h-12 text-base" />
        <h1 className="font-black text-text text-xl" dir="auto">
          {localized(user, "name")}
        </h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {details.map(([label, value]) => (
              <div key={label}>
                <dt className="text-text-muted text-sm">{label}</dt>
                <dd className="font-bold mt-1">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <Card>
          <h2 className="font-bold mb-2">{t("user.changeStatus")}</h2>
          <StatusBadge status={user.status} />
          <ChangeUserStatus userId={user._id} userStatus={user.status} />
        </Card>
      </div>
      <ProjectList title={t("user.createdProjects")} projects={createdProjects} />
      <ProjectList title={t("user.completedProjects")} projects={completedProjects} />
      <Card>
        <h2 className="font-bold mb-4">{t("proposal.list")}</h2>
        {proposals.length ? (
          <ul className="space-y-2">
            {proposals.map((proposal) => (
              <li key={proposal._id} className="flex items-center justify-between gap-x-4">
                <Link to={`/admin/projects/${proposal.project._id}`} dir="auto" className="text-primary hover:underline">
                  {localized(proposal.project, "title")}
                </Link>
                <span>{toPersianNumbersWithComma(proposal.price)}</span>
                <StatusBadge status={proposal.status} />
              </li>
            ))}
          </ul>
        ) : (
          <Empty resourceName={t("proposal.resource")} />
        )}
      </Card>
    </div>
  );
}
export default AdminUserProfile;
