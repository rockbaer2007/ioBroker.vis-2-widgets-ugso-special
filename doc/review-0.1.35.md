# PR #7083: remediation and verification, 24 November 2026

Package: `iobroker.vis-2-widgets-ugso-special`, version **0.1.35**.
Review addressed: [maintainer's report for 0.1.34](https://github.com/ioBroker/ioBroker.repositories/pull/7083#issuecomment-7140397088).

## Findings addressed

1. **German-only widget UI:** all 56 translation keys now have complete English
   and German dictionaries. Editor groups, field labels, options, tooltips,
   endpoint handles, runtime messages and accessible labels are covered.
   `common.visWidgets.ugsoSpezial.i18n` enables the native VIS 2 file loader;
   unsupported languages use its English fallback. Console diagnostics are English.
2. **GitHub installation instructions:** removed the URL/tarball installation
   section. Both documentation languages describe installation through the official
   ioBroker Admin once the package is available in the selected repository.
3. **Documentation location:** moved German documentation from `README.de.md` to
   `doc/de/README.md`, fixed the language/license links and retained English as the
   primary README.

Existing template IDs, federation identity, field IDs, routing option values,
defaults and project data are retained. No project migration is required.

## Verification

| Check | Result |
| --- | --- |
| `npm run build` | Passed; both translation files included in widget output |
| `npm run lint` | Passed |
| `npm run test:package` | 47 passing, including the official package schema |
| `npm run test:unit` | 5 passing: complete keys, all editor strings, preserved project values, runtime translation/fallback, packaged files/docs |
| `CI=true npm test` | 3 passing against a working ioBroker/VIS 2 2.20.11 installation |
| Real browser language test | German and English editor groups, registered translations and LineBox tooltips verified |
| Widget installation | Both palette entries added and removed successfully |
| New object export | Read directly from the working installed 0.1.35 object database after widget tests |

Browser screenshots and the object dump are uploaded as the workflow artifact
`widget-review-evidence`. See [Test and Release runs](https://github.com/rockbaer2007/ioBroker.vis-2-widgets-ugso-special/actions/workflows/test-and-release.yml).
The release also provides the new dump as a downloadable JSON asset.

The tests use an isolated, disposable local/CI ioBroker installation. Existing
user installations, VIS projects and settings were not changed.

## Object dump scope

This is still a frontend-only package: `onlyWWW: true`, `mode: none`, empty
`objects` and `instanceObjects`. The fresh export uses the **current English
package name** and contains its real installer-created `.admin` metadata object.
It is not the previous export from `vis-2-widgets-ugso-spezial`, is not generated
from `io-package.json`, and does not invent an adapter instance or runtime states.
LineBox only writes to an existing, explicitly selected writable numeric
`0_userdata.0` state after validating the object.

## Non-blocking checker recommendations

- W6020: added `CHANGELOG_OLD.md` and linked it from the primary changelog.
- W4001: the LATEST entry is the subject of the still-open PR #7083.
- W0062: releases use the official ioBroker deployment action and npm trusted
  publishing/provenance; a second release-script mechanism was not introduced.
- Build-tool pins are retained for reproducibility; updates require an explicit
  rebuild and widget check. The existing ESLint flat configuration passes. The
  shared ESLint configuration, editor schema settings and Dependabot remain
  optional tooling recommendations, not claimed as implemented fixes.

The new release must be reviewed by the maintainer; passing local/CI tests is not
a claim of acceptance into LATEST.
