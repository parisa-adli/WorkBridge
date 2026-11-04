import { useSearchParams } from "react-router-dom";
import Select, { type SelectOption } from "./Select";

type FilterDropDownProps = { options: SelectOption[]; filterField: string; label: string };

function FilterDropDown({ options, filterField, label }: FilterDropDownProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  // no param shows the first option, as the native select did
  const filterValue = searchParams.get(filterField) || options[0]?.value;

  function handlerChange(value: string) {
    searchParams.set(filterField, value);
    searchParams.delete("page"); // a new filter starts on its first page
    setSearchParams(searchParams);
  }
  return (
    <Select label={label} options={options} onValueChange={handlerChange} value={filterValue} />
  );
}
export default FilterDropDown;
