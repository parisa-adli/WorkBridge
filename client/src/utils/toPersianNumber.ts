import { activeLocale } from "../i18n";

// Names kept from the Persian-only days: digits follow the active language.
export function toPersianNumbersWithComma(n: number | string) {
  const numWithCommas = numberWithCommas(n); // 1000,2343
  const persianNumber = toPersianNumbers(numWithCommas);
  return persianNumber;
}

function numberWithCommas(x: number | string) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function toPersianNumbers(n: number | string) {
  const digits = new Intl.NumberFormat(activeLocale());
  return n.toString().replace(/\d/g, (x) => digits.format(Number(x)));
}
