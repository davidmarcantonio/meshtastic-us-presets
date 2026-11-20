# meshtastic-us-presets

Radio settings for [Meshtastic](https://meshtastic.org) communities in the United States, one JSON file per community.

Local meshes often run something other than the firmware defaults: a different modem preset, a fixed frequency slot, a higher hop limit. A new radio set to the defaults can sit in the middle of a busy mesh and hear nothing. This repository records what each community publishes, with a link to where they published it and the date it was last checked.

Unofficial. Not affiliated with Meshtastic LLC or with any community listed. Maintained by [David Marcantonio](https://marcantonio.me).

## What's in it

```
us/<state>/<slug>.json    one community
index.json                generated list of every community
schema/community.schema.json
schema/enums.json         protobuf enum numbers the validator checks against
```

Each community is one of two kinds:

| `status` | Meaning |
|---|---|
| `published` | The community states its settings on a public web page. The file holds those settings and links the page in `sources`. |
| `listed` | The community exists, but its settings are only in Discord, Facebook or similar. The file holds the name, area and a link. No radio settings. |

Nothing here is guessed. A field the community doesn't state is left out, and the firmware default applies.

## File format

```json
{
  "id": "us/ca/baymesh",
  "state": "CA",
  "name": "BayMe.sh",
  "area": "San Francisco, East Bay, Peninsula, South Bay, North Bay",
  "status": "published",
  "sources": ["https://bayme.sh/docs/getting-started/recommended-settings/"],
  "checked": "2026-11-18",
  "contact": { "type": "website", "url": "https://bayme.sh/" },
  "lora": { "region": "US", "regionNum": 1, "modemPreset": "MEDIUM_FAST", "modemPresetNum": 4, "frequencySlot": 45 },
  "primaryChannel": { "name": "", "psk": "AQ==" },
  "uses": {
    "everyday": { "role": "CLIENT", "roleNum": 0, "hopLimit": 6 },
    "home": { "role": "CLIENT_BASE", "roleNum": 12, "hopLimit": 4, "positionSecs": 21600 }
  },
  "mqtt": { "okToMqtt": false, "advice": "Optional. Turn it on only if you want your public messages online." },
  "notes": ["Licensed Operator mode must stay off, even with a callsign."]
}
```

- Enum fields come in pairs: the protobuf name and its number (`LONG_TURBO` = 9, `MEDIUM_TURBO` = 16, `CLIENT_BASE` = 12). The numbers are from [meshtastic/protobufs](https://github.com/meshtastic/protobufs/blob/master/meshtastic/config.proto) and CI rejects a pair that doesn't match.
- `frequencySlot` is `null` when the community doesn't publish one. Leave the radio on 0 (automatic).
- `uses.default` applies to any radio. `everyday` (handheld or vehicle), `home` (fixed node) and `extra` (a second radio near another of yours) override it.
- Intervals are in seconds.
- `checked` is the date someone last compared the file with its sources.

The full definition is [schema/community.schema.json](schema/community.schema.json).

## Using the data in your own site or tool

The data is public domain (CC0). No permission or credit needed.

- **Fetch it:** `https://raw.githubusercontent.com/davidmarcantonio/meshtastic-us-presets/main/index.json`, then each community's `path`.
- **Better, copy it at build time:** pull `index.json` and the files into your own build and serve them from your own host. Your pages then don't depend on GitHub at runtime, and your visitors' browsers don't contact a third party. [MeshNewb](https://github.com/davidmarcantonio/meshnewb) does this.
- **Pin a commit** if you need the data not to change under you.
- Treat `listed` entries as "ask the group": show the link, not a preset.
- Show `checked` and `sources` to your users. Communities change settings, and a visitor should be able to see how old the data is and where it came from.

`index.json` has one summary per community (`id`, `state`, `name`, `area`, `status`, `path`, `checked`, `contact`, and for published entries `modemPreset` and `frequencySlot`), plus per-state counts.

## Keeping it current

- A monthly check re-reads every source, updates `checked`, and opens a pull request for anything that changed.
- Anyone can report a change with the ["Submit or update a community"](../../issues/new?template=community.yml) form. No JSON needed.
- See [CONTRIBUTING.md](CONTRIBUTING.md) to edit files directly.

## License

[CC0 1.0](LICENSE). The data, schema and scripts are dedicated to the public domain. Community names belong to their communities.
