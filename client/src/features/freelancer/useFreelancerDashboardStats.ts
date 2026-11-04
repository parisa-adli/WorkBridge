import { useTranslation } from "react-i18next";
import { CircleDollarSign, Layers, LayoutGrid } from "lucide-react";
import useProposals from "../proposals/useProposals";
import { LIMITS, STATUS } from "../../constants";
import { toPersianNumbersWithComma } from "../../utils/toPersianNumber";

export default function useFreelancerDashboardStats() {
  const { t } = useTranslation();
  const { isLoading, proposals, total } = useProposals(`?limit=${LIMITS.PAGE_SIZE_MAX}`);
  // shortcut: accepted proposals and the wallet cover the first PAGE_SIZE_MAX proposals only;
  // move them to a stats endpoint if a freelancer outgrows that.
  const accepted = proposals.filter((p) => p.status === STATUS.ACCEPTED);
  const balance = accepted.reduce((acc, curr) => acc + curr.price, 0);

  return {
    isLoading,
    stats: [
      { title: t("stats.proposals"), value: total, icon: LayoutGrid },
      { title: t("stats.acceptedProposals"), value: accepted.length, icon: CircleDollarSign },
      { title: t("stats.wallet"), value: toPersianNumbersWithComma(balance), icon: Layers },
    ],
  };
}
