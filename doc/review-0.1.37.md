# Review follow-up: 0.1.37

## Remaining checker recommendations

- **W0062:** Installed and used `@alcalzone/release-script` with the ioBroker
  plugin. Both dry-run and actual local preparation of 0.1.37 succeeded. It
  synchronized package/lockfile/io-package versions and changelog, preserved the
  eleven prepared news translations and ran the verification hook. `noPush`
  keeps publication explicit; the official ioBroker deployment action remains
  responsible for publishing after successful CI.
- **S0048:** Replaced exact Vite/federation devDependency pins with compatible
  patch ranges. The lockfile still provides reproducible `npm ci` installations.
- **S0071 / S0073:** Use the shared `@iobroker/eslint-config`, including ESM,
  React and Prettier. ESLint 9 matches the configuration's current peer packages.
  Source and test formatting follows the shared rules. Two documented
  `class-methods-use-this` exceptions preserve VIS instance-method contracts;
  lint fails on any remaining warning.
- **S4036:** Added VS Code JSON schema associations for package.json and
  io-package.json using the official schema sources.
- **S8901:** Added monthly Dependabot checks for npm and GitHub Actions.
  Compatible minor/patch updates are grouped; updates still require review.
- **W4001:** Expected until repository inclusion PR #7083 is merged. The package
  cannot add itself to the official LATEST repository. No workaround or custom
  installation instruction was introduced.

## Preservation and backup

The clean 0.1.36 source was archived locally before editing. Only this widget
repository and its disposable local test fixture were changed. Widget templates
`tplUgsoSvgLine` / `tplUgsoLineBox`, federation identity, stored settings keys,
option values and project data remain compatible. Existing user projects and
ioBroker installations were not modified.

## Local verification

- Build passed.
- Shared ESLint passed with zero errors and zero warnings.
- All five unit tests passed, covering eleven complete dictionaries, 56 keys,
  project configuration compatibility, translated editor/runtime and English
  fallback.
- All 47 official/package validation tests passed.
- All three real browser tests passed in the disposable ioBroker fixture with
  VIS 2 2.20.11 (46 seconds): all eleven editor/runtime languages, widget palette
  add/delete and actual installed-package object export.
- `git diff --check` passed.
- Release dry-run and actual release preparation passed with automatic
  verification before the release commit.

The fresh `vis-2-widgets-ugso-special-0.1.37.objects.json` contains the actual
installer-created admin metadata object. This frontend-only package defines no
adapter instance or application state objects. Its structure is unchanged from
the previously accepted dump. CI additionally records browser screenshots and
the exported dump as review evidence.
