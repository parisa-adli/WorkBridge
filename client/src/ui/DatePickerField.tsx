import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarIcon } from "lucide-react";
import * as jalali from "date-fns-jalali";
import { faIR } from "@daypicker/persian";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLanguage } from "../context/LanguageContext";
import toLocalDateShort from "../utils/toLocalDateShort";
import Field from "./Field";

type DatePickerFieldProps = {
  label: string;
  date: Date | null;
  setDate: (date: Date | null) => void;
};

// fa: the Jalali calendar from @daypicker/persian (date-fns-jalali as the date library, Persian labels and digits).
const persianCalendar = { locale: faIR, dateLib: jalali, numerals: "arabext", dir: "rtl" } as const;

function DatePickerField({ label, date, setDate }: DatePickerFieldProps) {
  const { t } = useTranslation();
  const isFa = useLanguage().language === "fa";
  const [open, setOpen] = useState(false);

  return (
    <Field label={label}>
      {(control) => (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button {...control} variant="outline" className="w-full justify-start font-normal">
              <CalendarIcon aria-hidden="true" />
              {date ? toLocalDateShort(date) : <span className="text-muted-foreground">{t("common.pickDate")}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date ?? undefined}
              defaultMonth={date ?? undefined}
              onSelect={(day) => {
                // keep the time of the pick, as the old picker did: midnight of today would already be past
                const now = new Date();
                setDate(day ? new Date(day.getFullYear(), day.getMonth(), day.getDate(), now.getHours(), now.getMinutes()) : null);
                setOpen(false);
              }}
              {...(isFa && persianCalendar)}
            />
          </PopoverContent>
        </Popover>
      )}
    </Field>
  );
}
export default DatePickerField;
