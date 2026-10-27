import useCategories from "../../../hooks/useCategories";
import Filter from "../../../ui/Filter";
import FilterDropDown from "../../../ui/FilterDropDown";
import { PROJECT_STATUS_BADGES } from "../../../constants";

const sortOptions = [
  {
    label: "مرتب سازی (جدید ترین)",
    value: "latest",
  },
  {
    label: "مرتب سازی (قدیمی ترین)",
    value: "earliest",
  },
];

const statusOptions = [
  {
    label: "همه",
    value: "ALL",
  },
  ...Object.entries(PROJECT_STATUS_BADGES).map(([value, { label }]) => ({
    label,
    value,
  })),
];

function ProjectsHeader() {
  const { transformedCategories } = useCategories();

  return (
    <div className="flex items-center flex-wrap gap-4 text-secondary-700 mb-8">
      <h1 className="text-lg font-bold ml-8">
        لیست پروژه ها
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
              label: "دسته بندی (همه)",
            },
            ...transformedCategories,
          ]}
        />
      </div>
    </div>
  );
}
export default ProjectsHeader;
