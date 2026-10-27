import Table from "../../ui/Table";
import {
  toPersianNumbers,
  toPersianNumbersWithComma,
} from "../../utils/toPersianNumber";
import truncateText from "../../utils/truncateText";

const statusStyle = [
  {
    label: "رد شده",
    className: "badge--danger",
  },
  {
    label: "در انتظار تایید",
    className: "badge--secondary",
  },
  {
    label: "تایید شده",
    className: "badge--success",
  },
];

const unknownStatus = { label: "نامشخص", className: "badge--secondary" };

function ProposalRow({ proposal, index }) {
  const { description, duration, price, status } = proposal;
  const badge = statusStyle[status] ?? unknownStatus;
  return (
    <Table.Row>
      <td>{index + 1}</td>
      <td>{truncateText(description, 60)}</td>
      <td>{toPersianNumbers(duration)} روز</td>
      <td>{toPersianNumbersWithComma(price)}</td>
      <td>
        <span className={`badge ${badge.className}`}>
          {badge.label}
        </span>
      </td>
    </Table.Row>
  );
}
export default ProposalRow;
