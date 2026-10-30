import { useTranslation } from "react-i18next";
import ListState from "../../../ui/ListState";
import Table from "../../../ui/Table";
import useCategories from "../../../hooks/useCategories";
import CategoryRow from "./CategoryRow";

function CategoriesTable() {
  const { t } = useTranslation();
  const { isLoading, isError, rawCategories } = useCategories();

  return (
    <ListState isLoading={isLoading} isError={isError} total={rawCategories.length} resourceName={t("category.resource")}>
      <Table>
        <Table.Header>
          <Table.Row>
            <th>#</th>
            <th>{t("category.title")}</th>
            <th>{t("category.englishTitle")}</th>
            <th>{t("category.type")}</th>
            <th>{t("category.parent")}</th>
            <th>{t("common.actions")}</th>
          </Table.Row>
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
    </ListState>
  );
}
export default CategoriesTable;
