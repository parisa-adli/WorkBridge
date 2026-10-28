import { useTranslation } from "react-i18next";
import {
  HiCollection,
  HiCurrencyDollar,
  HiOutlineViewGrid,
} from "react-icons/hi";
import { toPersianNumbersWithComma } from "../../utils/toPersianNumber";
import Stat from "../../ui/Stat";
import { STATUS } from "../../constants";
import type { Proposal } from "../../types/api";

function Stats({ proposals }: { proposals: Proposal[] }) {
  const { t } = useTranslation();
  const numOfProposals = proposals.length;
  const acceptedProposals = proposals.filter((p) => p.status === STATUS.ACCEPTED)
  const balance = acceptedProposals
        .reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <Stat
        color="primary"
        title={t("stats.proposals")}
        value={numOfProposals}
        icon={<HiOutlineViewGrid className="w-20 h-20" />}
      />
      <Stat
        color="green"
        title={t("stats.acceptedProposals")}
        value={acceptedProposals.length}
        icon={<HiCurrencyDollar className="w-20 h-20" />}
      />
      <Stat
        color="sky"
        title={t("stats.wallet")}
        value={toPersianNumbersWithComma(balance)}
        icon={<HiCollection className="w-20 h-20" />}
      />
    </div>
  );
}
export default Stats;
