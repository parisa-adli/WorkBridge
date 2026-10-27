import Table from "../../ui/Table";
import {
  toPersianNumbers,
  toPersianNumbersWithComma,
} from "../../utils/toPersianNumber";
import truncateText from "../../utils/truncateText";
import StatusBadge from "../../ui/StatusBadge";

function ProposalRow({ proposal, index }) {
  const { description, duration, price, status } = proposal;
  return (
    <Table.Row>
      <td>{index + 1}</td>
      <td>{truncateText(description, 60)}</td>
      <td>{toPersianNumbers(duration)} روز</td>
      <td>{toPersianNumbersWithComma(price)}</td>
      <td>
        <StatusBadge status={status} />
      </td>
    </Table.Row>
  );
}
export default ProposalRow;
