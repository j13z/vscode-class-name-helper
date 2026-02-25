# Class Name Helper

Provides a code action (`Alt+Enter`) for fast cursor-based class name refactorings for Svelte + React (Tailwind-friendly).\
Wrap and unwrap with configurable helper functions like `cn` or `clsx`.

<p>&nbsp;</p>
<img width="500" src="https://github.com/j13z/vscode-class-name-helper/blob/main/docs/demo-wrap.gif?raw=true"
  alt="Wrap demo: convert a plain class value into a helper call at the cursor" />

- Example: `class="px-4"` → `class={cn("px-4", <cursor>)}`
- Example: `class={fooClasses}` → `class={cn(fooClasses, <cursor>)}`

<p>&nbsp;</p>
<img width="500" src="https://github.com/j13z/vscode-class-name-helper/blob/main/docs/demo-unwrap.gif?raw=true"
  alt="Unwrap demo: convert a helper call back to a plain class value at the cursor" />

- Example: `class={cn("px-4")}` → `class="px-4"`
- Example: ``class={cn(fooClasses)}`` → `class={fooClasses}`

<p>&nbsp;</p>
<p>&nbsp;</p>

## Features

- Use it at the caret via code action (`Alt+Enter`) or the command palette command.
- Works in Svelte (`class`) and React / TSX (`className`).
- Configurable wrapper function name (`cn`, `cx`, `clsx`, …).
  - Config: `cnHelper.functionName` (default: `cn`)
  - Wrapping uses the configured function; unwrapping matches supported wrapper calls regardless of function name.

## Install

- Download the `.vsix` from a GitHub Release
  - Install via VS Code: Extensions → `…` → `Install from VSIX …`
  - <img width="500" src="https://github.com/j13z/vscode-class-name-helper/blob/main/docs/screenshot-install-vsix.png?raw=true"
  alt="Install VSIX from file" />

- Alternatively: Local install after checkout
  - `pnpm install` → `pnpm run install:local`
- See `DEVELOPMENT.md` for more details

## Extension footprint

- Adds one code action / refactor command for supported files.
- Activates only for `svelte`, `javascriptreact`, and `typescriptreact` files.
- Does not scan the project, index files, or run background analysis.
- Work is local to the current line at the caret (small regex-based match/replace).
- Expected performance impact: no noticeable impact in normal use.

## Limits (Intentional)

- Complex expressions inside `{…}` are left unchanged
- Multi-argument calls are not unwrapped

<p>&nbsp;</p>
<p>&nbsp;</p>

## Development

Developer setup / local packaging docs: see [`DEVELOPMENT.md`](./DEVELOPMENT.md).
