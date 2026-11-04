import { useTranslation } from "react-i18next";
import ListState from "../../ui/ListState";
import Table from "../../ui/Table";
import TablePagination from "../../ui/TablePagination";
import ProposalRow from "./ProposalRow";
import useProposals from "./useProposals";
import useUser from "../authentication/useUser";
import { ROLES } from "../../constants";

function ProposalTable() {
  const { t } = useTranslation();
  const { isLoading, isError, proposals, total, page, limit } = useProposals();
  const { user } = useUser();
  const isAdmin = user?.role === ROLES.ADMIN;

  return (
    <ListState isLoading={isLoading} isError={isError} total={total} resourceName={t("proposal.resource")}>
      <Table>
        <Table.Header>
          <Table.Row>
            <th>#</th>
            <th>{t("project.title")}</th>
            <th>{t("common.description")}</th>
            <th>{t("roles.owner")}</th>
            {isAdmin && <th>{t("roles.freelancer")}</th>}
            <th>{t("proposal.deliveryTime")}</th>
            <th>{t("proposal.cost")}</th>
            <th>{t("common.status")}</th>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {proposals.map((proposal, index) => (
            <ProposalRow
              key={proposal._id}
              proposal={proposal}
              index={(page - 1) * limit + index}
              isAdmin={isAdmin}
            />
          ))}
        </Table.Body>
      </Table>
      <TablePagination page={page} total={total} limit={limit} />
    </ListState>
  );
}
export default ProposalTable;
