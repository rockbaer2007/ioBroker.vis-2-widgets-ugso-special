# ioBroker.vis-2-widgets-ugso-special

UGSo Special adds animated SVG lines and summing nodes to ioBroker VIS 2. [German documentation](doc/de/README.md)

## Installation

Install **UGSo Special** through the official ioBroker Admin **Adapters** page once
it is available in your selected repository. Do not install from GitHub or a custom URL.
The npm package is named `iobroker.vis-2-widgets-ugso-special`.
For an existing installation, export your VIS 2 project before switching packages.
Install the new package, restart VIS 2 and check the project before removing the old package.
Widget template IDs and the internal federation name are retained for existing projects.

After installation, open **UGSo Special** in the VIS 2 widget palette. See the [release page](https://github.com/rockbaer2007/ioBroker.vis-2-widgets-ugso-special/releases) for available versions.

## Widgets

The widget editor and runtime texts support all eleven ioBroker languages:
English, German, Spanish, French, Italian, Dutch, Polish, Portuguese, Russian,
Ukrainian and Simplified Chinese. VIS 2 selects its current language; unknown
languages fall back to English. The additional translations are AI-assisted and
welcome native-speaker review.

- **SVG-Line** reads an ioBroker state and draws a straight, right-angle or waypoint route. Configure the arrowheads, colours, dash lengths and cycle duration. A positive value animates forward, a negative value reverses direction and zero stops the animation. Speed can be fixed or proportional to the absolute input value.
- **SVG LineBox** is a circular node. Select up to four input lines and two output lines. The node sums the input values and an optional correction state, then passes the total to the output lines. It can also write the total in the VIS runtime to an existing writable numeric state under `0_userdata.0`. A missing selected input blocks the total until it becomes available.

In the editor, drag a yellow endpoint handle to snap a line to a node or another line. A line with an arrowhead cannot use that endpoint for visual docking. LineBox input and output selection controls value routing independently of docking.

## Development and releases

Use `npm ci` to install the locked dependencies. `npm run release:verify` builds
the widgets and runs shared ioBroker ESLint, unit tests and package validation.
`npm test` additionally runs the disposable ioBroker/VIS 2 browser fixture in all
eleven languages and exports its actual object structure. It does not access an
existing ioBroker installation.

The shared ESLint and Prettier configuration comes from `@iobroker/eslint-config`.
ESLint is installed through the shared configuration's peer dependencies.
Dependabot checks npm and GitHub Actions monthly at staggered cron times, with
up to 15 open requests per ecosystem. npm version updates have a seven-day
cooldown; Node type major updates require deliberate review. Updates are tested
and merged manually; automatic merging is intentionally disabled.

Prepare the next changelog under `WORK IN PROGRESS` and provide all eleven news
translations in `io-package.json` under the target version. Run
`npm run release -- patch --dry --yes` to review the release plan, then
`npm run release -- patch --yes` to create the local release commit and tag.
`@alcalzone/release-script` with its ioBroker, license and manual-review plugins
synchronizes package versions, changelog and news, checks license years and asks
for a final diff review. It executes `release:verify` before committing. The configured
`noPush` default keeps publication explicit: after review, push the commit and tag.
The existing official ioBroker deployment action publishes only after CI passes.

## Changelog

<!-- Add the next release notes below this marker. -->
### 0.1.38 (2026-11-25)

- Correct shared ESLint dependencies, release plugins and editor schema matching.
- Add a seven-day npm update cooldown, protect Node type major versions and stagger Dependabot checks.
- Preserve existing widget settings and VIS projects; keep dependency merges manually reviewed.

### 0.1.37 (2026-11-24)

- Adopt the shared ioBroker ESLint/Prettier configuration and release-script with its ioBroker plugin.
- Add monthly Dependabot checks, editor JSON schemas and compatible dependency ranges.
- Preserve widget templates, stored configuration and existing VIS projects.

### 0.1.36

- Add all nine previously missing widget language files in both source and build output, addressing checker W5603.
- Verify all eleven languages, 56 identical keys per dictionary and real browser language loading.
- Preserve existing widget IDs, settings and project data.

### 0.1.35

- Add complete German and English labels, options, help texts and runtime tooltips through VIS 2 i18n, with English fallback.
- Move German documentation to `doc/de`, remove GitHub installation instructions and document installation through Admin.
- Keep widget IDs, stored configuration keys, option values and existing projects compatible.
- Add translation, project compatibility and object export checks.

### 0.1.34

- Complete all eleven catalogue changelog languages and remove duplicate/unpublished news entries.
- Add linting and ioBroker package validation to CI; use the official deployment action with trusted publishing.
- Declare the React runtime dependencies explicitly. Widget IDs, configuration and VIS projects are unchanged.

Older entries: [CHANGELOG_OLD.md](CHANGELOG_OLD.md).

## License

MIT License. See [LICENSE](LICENSE).

Copyright (c) 2026 UGSo-Software <rockbaer2007@live.de>
