# Development

Developer docs for working on the extension locally.

## Setup

- `pnpm install`
- `pnpm run watch` (optional while developing)
- Press `F5` in VS Code to open an Extension Development Host
- Run the command `Class Name Helper: Toggle cn() Wrapper for class / className at Cursor`

## What to test manually

- Use `test-cases.md` as a copy/paste playground for quick checks in the Extension Development Host.
- Toggle at cursor for:
  - `class="..."`
  - `class={fooClasses}`
  - `className="..."`
  - `className={fooClasses}`
- No-op for:
  - `cn("a", cond && "b")`
  - complex expressions like `class={isActive ? "a" : "b"}`

## Commands

- `pnpm run compile` or `pnpm run build`
- `pnpm test` (unit tests)
- `pnpm run test:vscode` (integration tests in VS Code; downloads a VS Code test binary on first run)
- `pnpm run release:check` (runs tests + verifies current `package.json` version has a `CHANGELOG.md` entry)
- `pnpm run release:tag` (runs checks, requires clean git state, creates annotated tag `v<version>`)
- `pnpm run package:vsix` (creates versioned `.vsix`, e.g. `class-name-helper-0.0.1.vsix`)
- `pnpm run package:vsix:local` (creates `class-name-helper-local.vsix`)
- `pnpm run install:local` (packages local VSIX and installs via `code --install-extension ... --force`; requires `code` CLI in `PATH`)

## Release flow (lean)

- Update `package.json` version and `CHANGELOG.md`
- Run `pnpm run release:tag`
- Push commits + tag (`git push --follow-tags`)
- GitHub Actions builds/tests/packages and uploads the VSIX to the GitHub Release

## Install (VSIX)

No Marketplace publish is planned for now. Install via VSIX instead.

### Release path (GitHub Releases)

- Download the `.vsix` from the GitHub Releases page:
  - [https://github.com/j13z/vscode-class-name-helper/releases](https://github.com/j13z/vscode-class-name-helper/releases)
- Install in VS Code UI:
  - Extensions view
  - `...` menu
  - `Install from VSIX...`
- CLI alternative:
  - `code --install-extension /path/to/class-name-helper-X.Y.Z.vsix`

### Local build path

- Checkout repo
- `pnpm install`
- `pnpm run install:local`

## Local Packaging / Install Notes

- `package:vsix` is the versioned output used for GitHub Releases / CI.
- `package:vsix:local` is the local convenience output for manual installs.
- The VS Code in-app extension page content is based on packaged metadata + `README.md`.
- `publisher` in `package.json` must remain a valid VS Code publisher identifier for `vsce package`.

## Packaging / Marketplace docs

- `README.md` is the user-facing Marketplace / in-app extension page content.
- Keep this file (`DEVELOPMENT.md`) for contributor/developer workflow docs.

## Notes

- The transform logic is intentionally regex-based and line-local (not AST-based).
- Wrapping uses `cnHelper.functionName`; unwrapping accepts any matching wrapper function name.
- `Spec.md` is the canonical behavior/regression contract. Update it when requirements change.
- `test-cases.md` is an informal sample list; `Spec.md` and automated tests are the source of truth.
