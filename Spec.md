# Class Name Helper Spec

Short, testable requirements for the extension behavior.

## Scope

Supported VS Code language IDs:

- `svelte` -> attribute `class`
- `javascriptreact` -> attribute `className`
- `typescriptreact` -> attribute `className`

Unsupported languages must produce no transform / no code action.

Supported surfaces (same behavior):

- command `cnHelper.toggleClassCnAtCursor`
- keybinding
- code action

## Configuration

`cnHelper.functionName`:

- default: `cn`
- trim whitespace
- must be a valid identifier (`^[A-Za-z_$][\\w$]*$`)
- fallback to `cn` if invalid or empty

Examples:

- `" cx "` -> `cx`
- `"cn.helper"` -> `cn` (invalid)

## Matching Rules

- Only inspect the active line.
- Only transform when the cursor is inside the matched `class` / `className` attribute span.
- If line length is `> 4000`, do nothing.
- If multiple attributes exist on the line, only the one containing the cursor is eligible.

Match order (important):

1. unwrap string form: `FN("...")`
2. unwrap variable/member form: `FN(expr)`
3. wrap plain string attribute
4. wrap plain variable/member attribute

(`FN` = sanitized configured function name)

## Supported Transforms

### 1. Wrap string attribute

Input:

- `class="..."`
- `class='...'`
- `className="..."`
- `className='...'`

Output:

- `class={FN("...", "")}`
- `className={FN("...", "")}`

Rules:

- output always uses double quotes inside `FN(...)`
- inserts second arg `, ""`
- cursor moves inside the second empty string (`""`)

### 2. Unwrap string `FN(...)`

Input:

- `class={FN("...")}`
- `className={FN('...')}`

Output:

- `class="..."`
- `className="..."`

Rules:

- only if exactly one string argument
- multi-arg `FN(...)` is not unwrapped
- output uses double quotes
- cursor moves to end of replaced attribute span

### 3. Wrap variable/member attribute

Input examples:

- `class={fooClasses}`
- `class={styles.root}`
- `className={styles["root"]}`
- `className={styles[0]}`

Output:

- `class={FN(fooClasses, "")}`
- `className={FN(styles.root, "")}`

Rules:

- expression is trimmed before insertion into output
- inserts second arg `, ""`
- cursor moves inside the second empty string (`""`)

Supported expression shape (effective matcher behavior):

- identifier base (`foo`)
- then zero or more:
  - `.prop`
  - `["prop"]` / `['prop']`
  - `[0]`

### 4. Unwrap variable/member `FN(...)`

Input examples:

- `class={FN(fooClasses)}`
- `className={FN(styles.root)}`

Output:

- `class={fooClasses}`
- `className={styles.root}`

Rules:

- only if exactly one supported variable/member expression argument
- no unwrap for complex expressions or multi-arg calls
- cursor moves to end of replaced attribute span

## No-op / Unsupported Cases (Intentional)

Must return no transform / no code action for:

- multi-arg calls (for example `cn("a", active && "b")`)
- complex expressions in `{...}` (ternaries, calls, boolean expressions, etc.)
- malformed syntax
- unsupported language
- cursor outside target attribute
- line length > 4000

## String Escaping Behavior

String parsing is intentionally minimal:

- supports minimal unescape for `\"`, `\'`, `\\`
- plain attribute output escapes `"` and `\`
- not a full JS string parser

## Code Action Contract

When a transform exists:

- return exactly one code action
- kind: `RefactorRewrite` (provider also advertises quick-fix capability)
- title:
  - wrap: `Wrap <attr> with <FN>(...)`
  - unwrap: `Unwrap <FN>() in <attr>`

When no transform exists:

- return no code action

Provider constraints:

- no action for multi-line requested range
- no action if queried document is not the active editor document

## Command Contract

Command `cnHelper.toggleClassCnAtCursor`:

- no-op if no transform exists
- otherwise replace only the matched attribute span on the current line
- move cursor to transform-defined location
- reveal new cursor position

## Minimum Regression Coverage

Recommended tests:

- string wrap/unwrap
- variable wrap/unwrap
- configured function name (`cx`)
- cursor-inside vs cursor-outside attribute
- multi-arg no-op
- complex-expression no-op
- escaping roundtrip (`\"`, `\\`)
- line-length guard
- multiple attributes on one line
- command integration test (real editor edit + cursor move)
- code action integration test (appears/disappears correctly)
