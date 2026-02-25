# Development

Developer docs for working on the extension locally.

## Setup

- `pnpm install`
- `pnpm run watch` (optional while developing)
- Press `F5` in VS Code to open an Extension Development Host
- Run the command `Class Name Helper: Toggle cn() Wrapper for class / className at Cursor`

## What to test manually

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
- `pnpm run package:vsix` (creates `class-name-helper-local.vsix`)
- `pnpm run install:local` (packages + installs via `code --install-extension ... --force`; requires `code` CLI in `PATH`)

## Local Packaging / Install Notes

- The package task builds a local `.vsix` without publishing.
- The VS Code in-app extension page content is based on packaged metadata + `README.md`.
- `publisher` in `package.json` must remain a valid VS Code publisher identifier for `vsce package`.

## Packaging / Marketplace docs

- `README.md` is the user-facing Marketplace / in-app extension page content.
- Keep this file (`DEVELOPMENT.md`) for contributor/developer workflow docs.

## Notes

- The transform logic is intentionally regex-based and line-local (not AST-based).
- `Spec.md` is the canonical behavior/regression contract. Update it when requirements change.
- `test-cases.md` is an informal sample list; `Spec.md` and automated tests are the source of truth.
