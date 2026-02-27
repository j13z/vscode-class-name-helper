# Change Log
<!-- https://keepachangelog.com/en/1.1.0/ -->


## [0.1.0] 2025-02-27

### Added

- Add setting: `cnHelper.matchAllContainingClass` (`Match all attributes containing "class"`)
    - When enabled (default: `true`), code action also works on class-like attributes such as `fooClass`, `classFoo`, `fooClassBar`


## [0.0.2] 2025-02-25

- Re-release of `0.0.1` (no functional extension changes)
    - Version bump only to recover from GitHub Actions / release workflow issues


## [0.0.1]

Initial release

### Added

- Toggle `class` / `className` string and variable values into helper calls and back
- Svelte + React/TSX support
- Wrapping uses configured helper function (`cnHelper.functionName`); unwrapping matches any supported wrapper name
- Code action support (cursor-based refactor) + tests (unit + integration)
- Local VSIX install workflow and GitHub Releases VSIX packaging workflow
