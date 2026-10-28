// Fails on physical direction classes/properties; use logical ones (ms-, pe-, start-, text-start, border-e) so fa and en mirror.
import assert from "node:assert";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const PHYSICAL_CLASS =
  /(?<=^|[\s"'`:!}])-?(?:(?:scroll-)?[mp][lr]-[\w./[\]%-]+|(?:left|right)-[\w./[\]%-]+|(?:border|rounded)-(?:[lr]|[tb][lr])(?:-[\w./[\]%-]+)?|(?:text|float|clear)-(?:left|right))(?=$|[\s"'`])/;
const PHYSICAL_CSS = /\b(?:(?:margin|padding|border)-(?:left|right)|(?:text-align|float|clear)\s*:\s*(?:left|right))\b|^\s*(?:left|right)\s*:/;

for (const bad of ["ml-8", "md:pr-4", "-left-2", "border-l", "border-r-secondary-200", "rounded-tl-lg", "text-right", "!pl-2", "}ml-2"])
  assert.match(` ${bad} `, PHYSICAL_CLASS, bad);
for (const ok of ["ms-8", "rounded-lg", "border-red-500", "the right role", "gap-x-2", "translate-x-1", "top-right"])
  assert.doesNotMatch(` ${ok} `, PHYSICAL_CLASS, ok);
assert.match("text-align: right;", PHYSICAL_CSS);
assert.doesNotMatch("text-align: start;", PHYSICAL_CSS);

const src = fileURLToPath(new URL("../src", import.meta.url));
const files = readdirSync(src, { recursive: true }).filter((f) => /\.(tsx?|css)$/.test(f));
const hits = files.flatMap((f) =>
  readFileSync(join(src, f), "utf8")
    .split("\n")
    .flatMap((line, i) =>
      (f.endsWith(".css") ? [PHYSICAL_CSS, PHYSICAL_CLASS] : [PHYSICAL_CLASS])
        .flatMap((re) => [...line.matchAll(new RegExp(re, "g"))])
        .map((m) => `src/${f.replaceAll("\\", "/")}:${i + 1}: ${m[0].trim()}`)
    )
);

if (hits.length) {
  console.error(`Physical direction classes found; use logical ones:\n${hits.join("\n")}`);
  process.exit(1);
}
console.log(`direction check OK (${files.length} files)`);
