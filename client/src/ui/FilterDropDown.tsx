import type { ChangeEvent } from "react";
import { useSearchParams } from "react-router-dom";
import Select from "./Select";
import type { SelectOption } from "./RHFSelect";

type FilterDropDownProps = { options: SelectOption[]; filterField: string; label: string };

function FilterDropDown({ options, filterField, label }: FilterDropDownProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterValue = searchParams.get(filterField) || "";

  function handlerChange(e: ChangeEvent<HTMLSelectElement>) {
    searchParams.set(filterField, e.target.value);
    setSearchParams(searchParams);
  }
  return (
    <Select label={label} options={options} onChange={handlerChange} value={filterValue} />
  );
}
export default FilterDropDown;
