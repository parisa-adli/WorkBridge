export default function toLocalDateShort(date) {
  const parsed = new Date(date ?? NaN);
  return isNaN(parsed) ? "-" : parsed.toLocaleDateString("fa-IR");
}
