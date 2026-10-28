import DatePickerModule, { type Value } from "react-multi-date-picker";
import type DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";
import { useLanguage } from "../context/LanguageContext";

// CJS build with __esModule: Vite 8 uses Node interop, so the default import is module.exports
const DatePicker =
  (DatePickerModule as unknown as { default?: typeof DatePickerModule }).default ??
  DatePickerModule;

type DatePickerFieldProps = {
  label: string;
  date: Value;
  setDate: (date: DateObject | null) => void;
};

// The form converts the picked date to ISO, so the calendar is display-only.
function DatePickerField({ label, date, setDate }: DatePickerFieldProps) {
  const isFa = useLanguage().language === "fa";

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
        calendar={isFa ? persian : gregorian}
        locale={isFa ? persian_fa : gregorian_en}
      />
    </div>
  );
}
export default DatePickerField;
