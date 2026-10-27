import DatePickerModule, { type Value } from "react-multi-date-picker";
import type DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

// CJS build with __esModule: Vite 8 uses Node interop, so the default import is module.exports
const DatePicker =
  (DatePickerModule as unknown as { default?: typeof DatePickerModule }).default ??
  DatePickerModule;

type DatePickerFieldProps = {
  label: string;
  date: Value;
  setDate: (date: DateObject | null) => void;
};

function DatePickerField({ label, date, setDate }: DatePickerFieldProps) {
  return (
    <div>
      <span className="mb-2 block text-secondary-700">{label}</span>
      <DatePicker
        containerClassName="w-full"
        inputClass="textField__input"
        calendarPosition="bottom-center"
        value={date}
        onChange={setDate}
        format="YYYY/MM/DD"
        calendar={persian}
        locale={persian_fa}
      />
    </div>
  );
}
export default DatePickerField;
