import { useTranslation } from "react-i18next";
import { HiCollection, HiCurrencyDollar, HiUser } from "react-icons/hi";

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
        icon={<HiUser className="w-20 h-20" />}
      />
      <Stat
        color="green"
        title={t("stats.proposals")}
        value={proposals}
        icon={<HiCurrencyDollar className="w-20 h-20" />}
      />
      <Stat
        color="sky"
        title={t("stats.projects")}
        value={projects}
        icon={<HiCollection className="w-20 h-20" />}
      />
    </div>
  );
}
export default Stats;
