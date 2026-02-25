# Class Name Helper Spec

Short behavior contract (requirements + regression target).

## Supported Scope

- Should support:
  - `svelte` -> attribute `class`
  - `javascriptreact` -> attribute `className`
  - `typescriptreact` -> attribute `className`
- Should do nothing in unsupported languages (no transform, no code action).
- Should behave the same via command, keybinding, and code action.

## Configuration (`cnHelper.functionName`)

- Should default to `cn`.
- Should trim whitespace.
- Should accept only valid identifiers (`^[A-Za-z_$][\\w$]*$`).
- Should fallback to `cn` if empty/invalid.

Examples:

- Given `" cx "`, should use `cx`.
- Given `"cn.helper"`, should use `cn`.

## Matching Rules

- Should inspect only the active line.
- Should only transform when the cursor is inside the target attribute span.
- Should no-op when line length is `> 4000`.
- Given multiple attributes on one line, should only affect the one containing the cursor.

Match order (important):

1. unwrap string form (`FN("...")`)
2. unwrap variable/member form (`FN(expr)`)
3. wrap plain string attribute
4. wrap plain variable/member attribute

`FN` = sanitized configured function name.

## Functionality: Wrap String Attribute

- Given `class="..."` or `class='...'`, should produce `class={FN("...", "")}`.
- Given `className="..."` or `className='...'`, should produce `className={FN("...", "")}`.
- Should always use double quotes inside `FN(...)`.
- Should always add the second argument `, ""`.
- Should place the cursor inside the second empty string.

## Functionality: Unwrap String `FN(...)`

- Given `class={FN("...")}` or `className={FN('...')}`, should produce plain quoted attribute form.
- Should output double quotes in the plain attribute (`class="..."` / `className="..."`).
- Should only unwrap when there is exactly one string argument.
- Given multi-arg call (for example `FN("a", cond && "b")`), should not unwrap.
- Should place the cursor at the end of the replaced attribute span.

## Functionality: Wrap Variable / Member Expression

- Given `class={foo}` or `class={styles.root}`, should produce `class={FN(<expr>, "")}`.
- Given `className={styles["x"]}` or `className={styles[0]}`, should produce `className={FN(<expr>, "")}`.
- Should trim outer whitespace of the expression before inserting into output.
- Should always add the second argument `, ""`.
- Should place the cursor inside the second empty string.

Supported expression shape (effective matcher behavior):

- base identifier (`foo`)
- followed by zero or more of:
  - `.prop`
  - `["prop"]` / `['prop']`
  - `[0]`

## Functionality: Unwrap Variable / Member `FN(...)`

- Given `class={FN(foo)}` or `className={FN(styles.root)}`, should produce `class={foo}` / `className={styles.root}`.
- Should only unwrap when there is exactly one supported variable/member expression argument.
- Should not unwrap complex expressions or multi-arg calls.
- Should place the cursor at the end of the replaced attribute span.

## No-op Cases (Intentional)

Should return no transform / no code action for:

- unsupported language
- cursor outside target attribute
- line length > 4000
- multi-arg calls (`cn("a", cond && "b")`)
- complex expressions (`class={isActive ? "a" : "b"}`, `class={getClasses()}`, etc.)
- malformed syntax

## String Escaping

- Should support minimal unescape while parsing string forms: `\"`, `\'`, `\\`.
- Should escape `"` and `\` when outputting plain quoted attributes.
- Should not be treated as a full JavaScript string parser.

## Code Action Behavior

- Given a transform exists, should return exactly one code action.
- Should use kind `RefactorRewrite` (provider may also advertise quick-fix capability).
- Should use titles:
  - wrap: `Wrap <attr> with <FN>(...)`
  - unwrap: `Unwrap <FN>() in <attr>`
- Given no transform, should return no code action.
- Given a multi-line requested range, should return no code action.
- Given a document that is not the active editor document, should return no code action.

## Command Behavior (`cnHelper.toggleClassCnAtCursor`)

- Given no transform, should no-op.
- Given a transform, should:
  - replace only the matched attribute span on the current line
  - move cursor to the transform-defined position
  - reveal the new cursor position

## Minimum Regression Coverage (Checklist)

- string wrap / unwrap
- variable/member wrap / unwrap
- configured function name (`cx`)
- cursor inside vs outside attribute
- multi-arg no-op
- complex-expression no-op
- escaping roundtrip (`\"`, `\\`)
- line-length guard
- multiple attributes on one line
- command integration test (edit + cursor move)
- code action integration test (appears / disappears)
