import type { ChangeEvent } from "react";
import { useSearchParams } from "react-router-dom";
import Select from "./Select";
import type { SelectOption } from "./RHFSelect";

type FilterDropDownProps = { options: SelectOption[]; filterField: string };

function FilterDropDown({ options, filterField }: FilterDropDownProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterValue = searchParams.get(filterField) || "";

  function handlerChange(e: ChangeEvent<HTMLSelectElement>) {
    searchParams.set(filterField, e.target.value);
    setSearchParams(searchParams);
  }
  return (
    <Select options={options} onChange={handlerChange} value={filterValue} />
  );
}
export default FilterDropDown;
