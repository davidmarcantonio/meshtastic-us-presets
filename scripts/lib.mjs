// Shared helpers for validate.mjs and build-index.mjs. No network access.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

export const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");

export const STATES = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado", CT: "Connecticut",
  DE: "Delaware", DC: "District of Columbia", FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana",
  NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  PR: "Puerto Rico", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas",
  UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

/** Every us/<state>/<slug>.json, sorted, as { path, text }. path uses forward slashes. */
export function communityFiles() {
  const out = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir).sort()) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else out.push({ path: relative(ROOT, p).split(sep).join("/"), text: readFileSync(p, "utf8") });
    }
  };
  walk(join(ROOT, "us"));
  return out;
}

/** The index is a pure function of the community files, so the same commit always gives the same bytes. */
export function buildIndex(entries) {
  const communities = entries
    .map(({ path, data: d }) => ({
      id: d.id,
      state: d.state,
      name: d.name,
      area: d.area,
      status: d.status,
      path,
      checked: d.checked,
      contact: d.contact,
      ...(d.lora ? { modemPreset: d.lora.modemPreset, frequencySlot: d.lora.frequencySlot } : {}),
    }))
    .sort((a, b) => a.state.localeCompare(b.state) || a.name.localeCompare(b.name, "en") || a.id.localeCompare(b.id));
  const states = {};
  for (const c of communities) {
    states[c.state] ??= { name: STATES[c.state], published: 0, listed: 0 };
    states[c.state][c.status]++;
  }
  return {
    schema: "schema/community.schema.json",
    license: "CC0-1.0",
    count: communities.length,
    states,
    communities,
  };
}

export const stringify = (o) => JSON.stringify(o, null, 2) + "\n";
