import { useTranslation } from "react-i18next";
import { CircleDollarSign, Layers, User } from "lucide-react";

import Stat from "../../ui/Stat";

type StatsProps = { users: number; projects: number; proposals: number };

function Stats({ users, projects, proposals }: StatsProps) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <Stat
        color="primary"
        title={t("stats.users")}
        value={users}
        icon={<User className="size-20" />}
      />
      <Stat
        color="green"
        title={t("stats.proposals")}
        value={proposals}
        icon={<CircleDollarSign className="size-20" />}
      />
      <Stat
        color="sky"
        title={t("stats.projects")}
        value={projects}
        icon={<Layers className="size-20" />}
      />
    </div>
  );
}
export default Stats;
