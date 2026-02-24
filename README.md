# Class Name Helper

Fast cursor-based wrapping for `cn(…)` class strings.

`Class Name Helper` toggles between:

- `class="px-2 py-1"` and `class={cn("px-2 py-1", "")}`
- `className="…"` and `className={cn("…", "")}`

It only scans the current line at the cursor, so it stays lightweight.

## Usage

- Place the cursor inside a `class` / `className` attribute.
- Run the command: `Class Name Helper: Toggle cn() Wrapper for class/className at Cursor`
- Or use the shortcut:
  - macOS: `Cmd+Alt+C`
  - Windows/Linux: `Ctrl+Alt+C`
- The same action is also offered as a code action / quick fix.

## Supported Languages

- Svelte (`class`)
- React JSX / TSX (`className`)

## Setting

- `cnHelper.functionName` (default: `cn`)
  - Use this if your project uses `cx(…)` or another wrapper name.

## Notes

- Unwrap only triggers for a single string argument: `cn("…")`
- Multi-argument calls (for example `cn("a", active && "b")`) are intentionally left unchanged
