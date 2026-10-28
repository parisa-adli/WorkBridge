import { useTranslation } from "react-i18next";
import Empty from "../../ui/Empty";
import Loading from "../../ui/Loading";
import Table from "../../ui/Table";
import TablePagination from "../../ui/TablePagination";
import ProposalRow from "./ProposalRow";
import useProposals from "./useProposals";
import useUser from "../authentication/useUser";
import { ROLES } from "../../constants";

function ProposalTable() {
  const { t } = useTranslation();
  const { isLoading, proposals, total, page, limit } = useProposals();
  const { user } = useUser();
  const isAdmin = user?.role === ROLES.ADMIN;
  if (isLoading) return <Loading />;
  if (!total) return <Empty resourceName={t("project.resource")} />;

  return (
    <>
      <Table>
        <Table.Header>
          <tr className="title-row">
            <th>#</th>
            <th>{t("project.title")}</th>
            <th>{t("common.description")}</th>
            <th>{t("roles.owner")}</th>
            {isAdmin && <th>{t("roles.freelancer")}</th>}
            <th>{t("proposal.deliveryTime")}</th>
            <th>{t("proposal.cost")}</th>
            <th>{t("common.status")}</th>
          </tr>
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
    </>
  );
}
export default ProposalTable;
