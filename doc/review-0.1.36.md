# PR #7083: W5603 language follow-up

Version **0.1.36**, 24 November 2026.

The repository checker correctly reported missing locale files in both
`src/i18n` and the published widget bundle after 0.1.35. Although the native VIS 2
loader could fall back to English, the repository expects all eleven languages.

## Changes

- Added real translations for ES, FR, IT, NL, PL, PT, RU, UK and ZH-CN, alongside
  the existing EN/DE dictionaries. These translations are AI-assisted; native
  speaker feedback is welcome.
- All eleven dictionaries contain the same 56 keys. No empty entries or English
  placeholder copies were added to mask the missing-language warnings.
- The build copies all eleven dictionaries into
  `widgets/vis-2-widgets-ugso-special/i18n`.
- Tests now require exactly the eleven supported language filenames and verify
  identical keys and source/build contents.
- Widget/template IDs, stored configuration values and project data are unchanged.

## Verified locally

- Build and lint pass.
- Official package validation: 47 passing.
- Translation and compatibility unit tests: 5 passing, including French, Russian,
  Chinese runtime text and English fallback for an unsupported language.
- Real ioBroker/VIS 2 2.20.11 browser tests: 3 passing. The language test switches
  through all eleven languages and verifies registered translations, translated
  editor groups and each localized LineBox tooltip.
- Both widgets can be added and removed in the editor.
- A fresh object dump is exported after checking installed version 0.1.36. The
  frontend-only package still owns just its installer-created `.admin` metadata
  object; it does not create runtime device/channel/state objects.

CI repeats these checks and publishes screenshots and the dump in
`widget-review-evidence`. The release includes the new JSON dump and this report.

The W0062 release-script recommendation remains explained in the
[previous report](review-0.1.35.md): the project uses the official ioBroker
deployment action with npm trusted publishing and provenance. W4001 is expected
while PR #7083 adding the adapter to LATEST is still open.

Pre-change source backup: `M:/repos/_backups/ugso-special-before-0.1.36.zip`.
Only isolated local/CI test data was used; existing user installations and VIS
projects were not changed.
