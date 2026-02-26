# Class Name Helper

<img width="100" src="https://github.com/j13z/vscode-class-name-helper/blob/main/images/icon.png?raw=true" alt="Class Name Helper logo"/>

Provides a code action for **fast class name refactorings** for Svelte + React, speeding up your Tailwind / utility-CSS workflows.

Shows up as a code action (bulb icon / `Alt+Enter`), no explicit command needed.\
Wrap and unwrap, with configurable helper functions like `cn` or `clsx`.

No more `class={cn(…)}` hand-typing 😌

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

## Features

- Usable via code action (`Alt+Enter` targeting caret) or the command palette command.
- Works in Svelte (`class`) and React / TSX (`className`).
- Configurable wrapper function name (`cn`, `cx`, `clsx`, …).
- Configurable: Optionally match  all attributes containing `"class"`, e.g. `classFoo` (default: enabled)

<p>&nbsp;</p>

## Install

- Not published to the Marketplace yet (still dogfooding). Install via VSIX for now.
- **Pre-build VSIX:** Download the `.vsix` from a [GitHub Release](https://github.com/j13z/vscode-class-name-helper/releases)
  - Install via VS Code: _Extensions → … → Install from VSIX …_
	<img width="500" src="https://github.com/j13z/vscode-class-name-helper/blob/main/docs/screenshot-install-vsix.png?raw=true"
  alt="Install VSIX from file" />

- **Built the VSIX yourself:** `pnpm install` → `pnpm run install:local`
- More details: [`DEVELOPMENT.md`](./DEVELOPMENT.md)

<p>&nbsp;</p>

## Wait, what is `cn`? 🤔

`cn` is a class composition helper you might define in your web frontend project:

- It turns “anything” into a class string (via [`clsx`](https://github.com/lukeed/clsx)).
- Then de-dupes / resolves conflicting Tailwind classes (via `twMerge` from [`tailwind-merge`](https://github.com/dcastil/tailwind-merge)).
- Think: “Compose my classes — but don’t leave me with `p-2 p-4`” duplicates.
- Useful in cases where you don't want to use [`tailwind-variants`](https://www.tailwind-variants.org/).


```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
```

Minimal example:

```svelte
<span
	class={cn(
		"px-2 py-1 text-sm",
		active ? "text-white" : "text-zinc-400",
		disabled && "text-zinc-600",
		className /* allow overrides → composition */
	)}
>
	{label}
</span>
```

<p>&nbsp;</p>

## Extension footprint

- Adds one code action / refactor command for supported files.
- Activates only for `svelte`, `javascriptreact`, and `typescriptreact` files.
- Does not scan the project, index files, or run background analysis.
- Work is local to the current line at the caret (small regex-based match / replace).
- Expected performance impact: no noticeable impact in normal use.

<p>&nbsp;</p>

## Limits (Intentional)

- Complex expressions inside `{…}` are left unchanged
- Multi-argument calls are not unwrapped

<p>&nbsp;</p>

## Development

Developer setup / local packaging docs: see [`DEVELOPMENT.md`](./DEVELOPMENT.md).
