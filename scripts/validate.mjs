// Validate every us/<state>/<slug>.json against schema/community.schema.json, plus the checks a schema can't express.
// Usage: node scripts/validate.mjs            exit 1 on any problem
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, STATES, communityFiles } from "./lib.mjs";

const schema = JSON.parse(readFileSync(join(ROOT, "schema/community.schema.json"), "utf8"));
const enums = JSON.parse(readFileSync(join(ROOT, "schema/enums.json"), "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false, allowUnionTypes: true });
addFormats(ajv);
const check = ajv.compile(schema);

const today = new Date().toISOString().slice(0, 10);
const problems = [];
const seen = new Map();
const files = communityFiles();

for (const { path, text } of files) {
  const bad = (msg) => problems.push(`${path}: ${msg}`);
  const m = /^us\/([a-z]{2})\/([a-z0-9]+(?:-[a-z0-9]+)*)\.json$/.exec(path);
  if (!m) { bad("path must be us/<state>/<slug>.json, lower case, hyphens only"); continue; }
  let d;
  try { d = JSON.parse(text); } catch (e) { bad(`not valid JSON (${e.message})`); continue; }
  if (!check(d)) {
    for (const e of check.errors) bad(`${e.instancePath || "/"} ${e.message}${e.params?.additionalProperty ? ` (${e.params.additionalProperty})` : ""}`);
    continue;
  }
  if (d.id !== path.slice(0, -5)) bad(`id "${d.id}" must equal the file path "${path.slice(0, -5)}"`);
  if (d.state !== m[1].toUpperCase()) bad(`state "${d.state}" must match folder "${m[1]}"`);
  if (!STATES[d.state]) bad(`unknown state code "${d.state}"`);
  if (d.checked > today) bad(`checked date ${d.checked} is in the future`);
  if (d.lora) {
    if (enums.RegionCode[d.lora.region] !== d.lora.regionNum) bad(`regionNum ${d.lora.regionNum} is not ${d.lora.region}`);
    if (enums.ModemPreset[d.lora.modemPreset] !== d.lora.modemPresetNum)
      bad(`modemPresetNum ${d.lora.modemPresetNum} is not ${d.lora.modemPreset} (expected ${enums.ModemPreset[d.lora.modemPreset]})`);
  }
  for (const [use, u] of Object.entries(d.uses ?? {})) {
    if (u.role && enums.Role[u.role] !== u.roleNum) bad(`uses.${use}.roleNum ${u.roleNum} is not ${u.role} (expected ${enums.Role[u.role]})`);
  }
  if (text !== JSON.stringify(d, null, 2) + "\n") bad("not in canonical form: 2-space indent, trailing newline (run: npm run format)");
  const key = `${d.state}|${d.name.toLowerCase()}`;
  if (seen.has(key)) bad(`same name as ${seen.get(key)}`);
  seen.set(key, path);
}

if (problems.length) {
  console.error(problems.join("\n"));
  console.error(`\n${problems.length} problem(s) in ${files.length} file(s).`);
  process.exit(1);
}
console.log(`${files.length} community file(s) valid.`);
