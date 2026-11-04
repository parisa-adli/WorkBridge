import { useTranslation } from "react-i18next";
import Empty from "../../ui/Empty";
import Table from "../../ui/Table";
import ProposalRow from "./ProposalRow";
import type { Proposal } from "../../types/api";

function ProposalsTable({ proposals }: { proposals: Proposal[] }) {
  const { t } = useTranslation();
  if (!proposals.length) return <Empty resourceName={t("proposal.resource")} />;

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <th>#</th>
          <th>{t("project.freelancer")}</th>
          <th>{t("common.description")}</th>
          <th>{t("proposal.deliveryTime")}</th>
          <th>{t("proposal.cost")}</th>
          <th>{t("common.status")}</th>
          <th>{t("common.actions")}</th>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {proposals.map((proposal, index) => (
          <ProposalRow key={proposal._id} proposal={proposal} index={index} />
        ))}
      </Table.Body>
    </Table>
  );
}
export default ProposalsTable;
