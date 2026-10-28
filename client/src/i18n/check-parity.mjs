// Fails when a translation key exists in only one locale file.
import { readFileSync } from "node:fs";

const keys = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([k, v]) =>
    typeof v === "object" ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]
  );
const load = (lng) =>
  new Set(keys(JSON.parse(readFileSync(new URL(`./${lng}.json`, import.meta.url), "utf8"))));

const fa = load("fa");
const en = load("en");
const missing = [
  ...[...fa].filter((k) => !en.has(k)).map((k) => `en is missing ${k}`),
  ...[...en].filter((k) => !fa.has(k)).map((k) => `fa is missing ${k}`),
];

if (missing.length) {
  console.error(missing.join("\n"));
  process.exit(1);
}
console.log(`i18n parity OK (${fa.size} keys)`);
