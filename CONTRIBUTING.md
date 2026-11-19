# Contributing

## The one rule

Record what the community says, and link where it says it. Never guess a value. If the community doesn't state something, leave the field out.

## Easiest: the issue form

Open ["Submit or update a community"](../../issues/new?template=community.yml) and fill in the fields. This works well when the settings are in a Discord pin or a Facebook post: copy them into the form and say where you read them. A maintainer turns it into a file.

## Editing files directly

1. Find or create `us/<state>/<slug>.json`. State is the two-letter code in lower case. The slug is the community name in lower case with hyphens, for example `us/oh/dayton-mesh.json`.
2. Copy an existing file of the same kind as a starting point:
   - published: [`us/ca/baymesh.json`](us/ca/baymesh.json)
   - listed: [`us/ca/san-diego-mesh.json`](us/ca/san-diego-mesh.json)
3. Check it:
   ```sh
   npm ci
   npm run format    # rewrites files with standard spacing
   npm run validate  # checks every file
   ```
4. Open a pull request with your community file(s) only. Leave `index.json` out of the commit: CI validates every file, and `index.json` is rebuilt on `main` after the merge. (Two pull requests that both edit a generated file would conflict.)

## Published or listed?

| Situation | `status` |
|---|---|
| Settings are on a public page that opens without logging in | `published`, with that page in `sources` |
| Settings are only in Discord, Facebook, a chat group, or a page that needs an account | `listed` |
| The community has a site but it says nothing about radio settings | `listed` |
| The community explicitly says "use the Meshtastic defaults" | `published`, with the defaults they name (usually `LONG_FAST`, slot 20) |

A community that runs two sets of settings (for example an older LongFast mesh and a newer LongTurbo one) gets one file per set.

Settings relayed from a private channel can be accepted as `published` only if a public URL confirms them. Otherwise keep the entry `listed` and put what you know in the issue, so the next person knows where to look.

## Field notes

- `id` must equal the file path without `.json`. `state` must match the folder.
- Enum pairs must agree: `"modemPreset": "LONG_TURBO"` goes with `"modemPresetNum": 9`. The table is [schema/enums.json](schema/enums.json).
- `frequencySlot` is the number entered in the app (LoRa > Frequency Slot). Use `null` if it isn't published. Don't work it out from a frequency or a channel name.
- `checked` is today's date when you have re-read every URL in `sources`.
- Only include channel keys the community publishes openly. Never copy a key from a private chat.
- `notes` are short, plain sentences. No opinions.

## Removing a community

If a group has shut down or asks to be removed, open an issue or a pull request deleting its file.
