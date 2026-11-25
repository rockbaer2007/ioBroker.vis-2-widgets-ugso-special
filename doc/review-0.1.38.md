# Repository checker follow-up: 0.1.38

## Findings addressed

- E0078: Removed direct `eslint` and `@eslint/js` devDependencies. npm installs
  the compatible ESLint 9 peer dependencies of `@iobroker/eslint-config`.
- E5025 / S5026: Installed and enabled the license and manual-review release
  plugins. Release dry-run and actual preparation succeeded, including the
  explicit final diff-review prompt and verification hook.
- E8915: Added `cooldown.default-days: 7` for npm. This is the documented GitHub
  option; the bot message's `default` example is not the supported option name.
  Security updates are not delayed by this version-update cooldown.
- E8917: Ignore major `@types/node` updates; runtime/type major changes need
  deliberate compatibility review.
- W4040: Match `io-package.json` without a leading slash in VS Code settings.
- S8906 / S8908: Stagger monthly cron schedules (npm on day 7, Actions on day 11)
  and allow 15 open requests per ecosystem.
- W4001: Expected while LATEST inclusion PR #7083 remains open.
- S8913: Automatic merging remains intentionally disabled. Dependency updates
  require tests and maintainer review; adding an unused workflow would misstate
  the project's update policy.

References: [GitHub Dependabot options](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference)
and [repository checker](https://github.com/ioBroker/ioBroker.repochecker).

## Preservation and verification

The clean 0.1.37 source was archived locally before editing. No existing ioBroker
installation or VIS project was changed. Widget source, template IDs, federation
identity, option keys and runtime behavior are unchanged.

- Build and lint passed with zero lint warnings.
- Five unit tests and 47 package/schema tests passed.
- Three actual browser tests passed in the disposable local ioBroker fixture
  with VIS 2 2.20.11 (51 seconds), including all eleven languages, palette loading
  and fresh installed-package object export.
- Release dry-run, actual preparation and `git diff --check` passed.
- The local repository checker 5.24.3 no longer reports E0078, E5025, E8915,
  E8917, W4040, S5026, S8906 or S8908. Before publication it still reports the
  expected unpublished version/tag and remote CI-log availability findings.
  Scanning a clean source archive avoids unrelated test-fixture directories.

The fresh `vis-2-widgets-ugso-special-0.1.38.objects.json` is exported from the
installed package, not hand-written. It contains one installer-created admin
metadata object and no runtime states. The preceding structure checker already
reported no errors or warnings, and the maintainer marked that item complete.
Attach the new JSON to the release and link it in the PR; CI also stores the
dump and screenshots as review evidence.

`npm audit` reports eight moderate findings in development/test tooling. These
are not runtime widget dependencies. No force upgrade or downgrade of the
official browser fixture was applied as part of these configuration fixes.
