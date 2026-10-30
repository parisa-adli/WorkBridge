import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type FilterProps = {
  options: { value: string; label: string }[];
  filterField: string;
};

function Filter({ options, filterField }: FilterProps) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentFilter = searchParams.get(filterField) || options[0].value;

  function handleChange(value: string) {
    if (!value) return; // clicking the active item would clear it; one filter is always on
    searchParams.set(filterField, value);
    searchParams.delete("page"); // a new filter starts on its first page
    setSearchParams(searchParams);
  }
  return (
    <div className="flex items-center gap-x-2 text-xs">
      <span>{t("common.status")}</span>
      <ToggleGroup
        type="single"
        variant="outline"
        value={currentFilter}
        onValueChange={handleChange}
        aria-label={t("common.status")}
      >
        {options.map(({ label, value }) => (
          <ToggleGroupItem key={value} value={value}>
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
export default Filter;
