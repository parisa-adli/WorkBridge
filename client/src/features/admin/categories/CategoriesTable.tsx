import { useTranslation } from "react-i18next";
import Empty from "../../../ui/Empty";
import Loading from "../../../ui/Loading";
import Table from "../../../ui/Table";
import useCategories from "../../../hooks/useCategories";
import CategoryRow from "./CategoryRow";

function CategoriesTable() {
  const { t } = useTranslation();
  const { isLoading, rawCategories } = useCategories();

  if (isLoading) return <Loading />;
  if (!rawCategories.length) return <Empty resourceName={t("category.resource")} />;

  return (
    <Table>
      <Table.Header>
        <tr className="title-row">
          <th>#</th>
          <th>{t("category.title")}</th>
          <th>{t("category.englishTitle")}</th>
          <th>{t("category.type")}</th>
          <th>{t("category.parent")}</th>
          <th>{t("common.actions")}</th>
        </tr>
      </Table.Header>
      <Table.Body>
        {rawCategories.map((category, index) => (
          <CategoryRow
            key={category._id}
            category={category}
            index={index}
            parent={rawCategories.find((c) => c._id === category.parentId)}
            childCount={rawCategories.filter((c) => c.parentId === category._id).length}
          />
        ))}
      </Table.Body>
    </Table>
  );
}
export default CategoriesTable;
