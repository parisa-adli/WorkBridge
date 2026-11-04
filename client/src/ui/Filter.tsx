import { useId } from "react";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FilterProps = {
  options: { value: string; label: string }[];
  filterField: string;
};

function Filter({ options, filterField }: FilterProps) {
  const { t } = useTranslation();
  const labelId = useId();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentFilter = searchParams.get(filterField) || options[0].value;

  function handleChange(value: string) {
    searchParams.set(filterField, value);
    searchParams.delete("page"); // a new filter starts on its first page
    setSearchParams(searchParams);
  }
  return (
    <Tabs value={currentFilter} onValueChange={handleChange}>
      <Label id={labelId}>{t("common.status")}</Label>
      <TabsList aria-labelledby={labelId}>
        {options.map(({ label, value }) => (
          // no TabsContent: the list below is the panel, so drop the dangling aria-controls
          <TabsTrigger
            key={value}
            value={value}
            aria-controls={undefined}
            className="px-4"
          >
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
export default Filter;
