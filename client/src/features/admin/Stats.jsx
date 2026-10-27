import { HiCollection, HiCurrencyDollar, HiUser } from "react-icons/hi";

import Stat from "../../ui/Stat";

function Stats({ users, projects, proposals }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <Stat
        color="primary"
        title="کاربر ها"
        value={users}
        icon={<HiUser className="w-20 h-20" />}
      />
      <Stat
        color="green"
        title="درخواست ها"
        value={proposals}
        icon={<HiCurrencyDollar className="w-20 h-20" />}
      />
      <Stat
        color="sky"
        title="پروژه ها"
        value={projects}
        icon={<HiCollection className="w-20 h-20" />}
      />
    </div>
  );
}
export default Stats;
