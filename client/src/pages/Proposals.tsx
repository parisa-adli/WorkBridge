import { useTranslation } from "react-i18next";
import ProposalTable from "../features/proposals/ProposalTable";

function Proposals() {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="font-black text-secondary-700 text-xl mb-8">
        {t("proposal.list")}
      </h1>
      <ProposalTable />
    </div>
  );
}
export default Proposals;
