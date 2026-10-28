import { useTranslation } from "react-i18next";
import useCategories from "../../../hooks/useCategories";
import Filter from "../../../ui/Filter";
import FilterDropDown from "../../../ui/FilterDropDown";
import { PROJECT_STATUS_BADGES } from "../../../constants";

function ProjectsHeader() {
  const { t } = useTranslation();
  const { transformedCategories } = useCategories();
  const sortOptions = [
    { label: t("project.sortLatest"), value: "latest" },
    { label: t("project.sortEarliest"), value: "earliest" },
  ];
  const statusOptions = [
    { label: t("common.all"), value: "ALL" },
    ...Object.entries(PROJECT_STATUS_BADGES).map(([value, { label }]) => ({
      label: t(label),
      value,
    })),
  ];

  return (
    <div className="flex items-center flex-wrap gap-4 text-secondary-700 mb-8">
      <h1 className="text-lg font-bold ml-8">
        {t("project.list")}
      </h1>
      <div>
        <Filter filterField="status" options={statusOptions} />
      </div>

      <div>
        <FilterDropDown filterField="sort" options={sortOptions} />
      </div>

      <div>
        <FilterDropDown
          filterField="category"
          options={[
            {
              value: "ALL",
              label: t("project.allCategories"),
            },
            ...transformedCategories,
          ]}
        />
      </div>
    </div>
  );
}
export default ProjectsHeader;
