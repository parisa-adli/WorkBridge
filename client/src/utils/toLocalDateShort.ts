import { activeLocale } from "../i18n";

export default function toLocalDateShort(date: string | number | Date | null | undefined) {
  const parsed = new Date(date ?? NaN);
  return isNaN(parsed.getTime()) ? "-" : parsed.toLocaleDateString(activeLocale());
}
