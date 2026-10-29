import { useTranslation } from "react-i18next";
import { CircleDollarSign, Layers, LayoutGrid } from "lucide-react";
import { toPersianNumbersWithComma } from "../../utils/toPersianNumber";
import Stat from "../../ui/Stat";
import { STATUS } from "../../constants";
import type { Proposal } from "../../types/api";

// shortcut: accepted proposals and the wallet cover the first PAGE_SIZE_MAX proposals only;
// move them to a stats endpoint if a freelancer outgrows that.
function Stats({ proposals, total }: { proposals: Proposal[]; total: number }) {
  const { t } = useTranslation();
  const numOfProposals = total;
  const acceptedProposals = proposals.filter((p) => p.status === STATUS.ACCEPTED)
  const balance = acceptedProposals
        .reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <Stat
        color="primary"
        title={t("stats.proposals")}
        value={numOfProposals}
        icon={<LayoutGrid className="size-20" />}
      />
      <Stat
        color="green"
        title={t("stats.acceptedProposals")}
        value={acceptedProposals.length}
        icon={<CircleDollarSign className="size-20" />}
      />
      <Stat
        color="sky"
        title={t("stats.wallet")}
        value={toPersianNumbersWithComma(balance)}
        icon={<Layers className="size-20" />}
      />
    </div>
  );
}
export default Stats;
