// Rebuild index.json from the community files.
// Usage: node scripts/build-index.mjs           write index.json
//        node scripts/build-index.mjs --check   exit 1 if index.json is out of date
//        node scripts/build-index.mjs --format  also rewrite community files in canonical form
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ROOT, communityFiles, buildIndex, stringify } from "./lib.mjs";

const args = new Set(process.argv.slice(2));
const entries = communityFiles().map(({ path, text }) => ({ path, data: JSON.parse(text), text }));

if (args.has("--format")) {
  for (const e of entries) {
    const canon = stringify(e.data);
    if (canon !== e.text) { writeFileSync(join(ROOT, e.path), canon); console.log(`formatted ${e.path}`); }
  }
}

const next = stringify(buildIndex(entries));
const file = join(ROOT, "index.json");
const current = existsSync(file) ? readFileSync(file, "utf8") : "";

if (args.has("--check")) {
  if (current !== next) { console.error("index.json is out of date. Run: npm run index"); process.exit(1); }
  console.log("index.json is up to date.");
} else if (current !== next) {
  writeFileSync(file, next);
  console.log(`index.json rebuilt (${entries.length} communities).`);
} else {
  console.log("index.json unchanged.");
}
