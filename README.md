# Class Name Helper

Fast cursor-based toggling for `cn(...)` wrappers in Svelte + React.

Toggle at the cursor between:

- `class="px-2 py-1"` and `class={cn("px-2 py-1", "")}`
- `class={fooClasses}` and `class={cn(fooClasses, "")}`
- `className="…"` and `className={cn("…", "")}`
- `className={styles.root}` and `className={cn(styles.root, "")}`

Built for quick refactors while editing Tailwind / utility-class UIs.

## Why

- Cursor-local and fast (line-only scan)
- Works in Svelte + React / TSX
- Command + keybinding + code action
- Configurable wrapper function name (`cn`, `cx`, ...)

## Usage

- Put the cursor inside a `class` / `className` attribute
- Run `Class Name Helper: Toggle cn() Wrapper for class / className at Cursor`
- Shortcut:
  - macOS: `Cmd+Alt+C`
  - Windows/Linux: `Ctrl+Alt+C`

## Supported

- Svelte (`class`)
- React JSX / TSX (`className`)

## Config

- `cnHelper.functionName` (default: `cn`)

## Limits (Intentional)

- Multi-argument calls are not unwrapped
- Complex expressions inside `{...}` are left unchanged

## Development

Developer setup / local packaging docs: see `DEVELOPMENT.md`.
