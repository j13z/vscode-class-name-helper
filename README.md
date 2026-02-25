# Class Name Helper

Fast cursor-based class name refactorings for Svelte + React (Tailwind-friendly). Wrap and unwrap with configurable helper functions like `cn` or `clsx`.

Use the code action (`Alt+Enter`) to toggle at the cursor between:

- `class="px-2 py-1"` and `class={cn("px-2 py-1", "")}`
- `class={fooClasses}` and `class={cn(fooClasses, "")}`
- `className="…"` and `className={cn("…", "")}`
- `className={styles.root}` and `className={cn(styles.root, "")}`

## Why

- Cursor-local and fast (line-only scan)
- Works in Svelte + React / TSX
- Command + keybinding + code action
- Configurable wrapper function name (`cn`, `cx`, …)

## Usage

- Put the cursor inside a `class` / `className` attribute
- Open code actions at the caret (`Alt+Enter`) and run the Class Name Helper action
- Or run `Class Name Helper: Toggle cn() Wrapper for class / className at Cursor`

## Supported

- Svelte (`class`)
- React JSX / TSX (`className`)

## Config

- `cnHelper.functionName` (default: `cn`)

## Install

No Marketplace publish is planned for now. Install via VSIX (GitHub Releases or local build); see `DEVELOPMENT.md`.

## Limits (Intentional)

- Multi-argument calls are not unwrapped
- Complex expressions inside `{…}` are left unchanged

## Development

Developer setup / local packaging docs: see `DEVELOPMENT.md`.
