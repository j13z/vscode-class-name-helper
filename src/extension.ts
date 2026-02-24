import * as vscode from "vscode"

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand("typeframe.wrapClassWithCn", async () => {
			const editor = vscode.window.activeTextEditor
			if (!editor) return

			const doc = editor.document
			const pos = editor.selection.active
			const line = doc.lineAt(pos.line)
			const text = line.text

			// 1) Revert: class={cn("foo")}  -> class="foo"
			// Only if cn(...) has exactly ONE string literal arg (no commas).
			{
				const re = /\bclass\s*=\s*\{\s*cn\(\s*"([^"]*)"\s*\)\s*\}/g
				let m: RegExpExecArray | null
				while ((m = re.exec(text))) {
					const start = m.index
					const end = start + m[0].length
					const fullRange = new vscode.Range(
						new vscode.Position(pos.line, start),
						new vscode.Position(pos.line, end)
					)

					if (!fullRange.contains(pos)) continue

					const value = m[1]
					const replacement = `class="${value}"`

					await editor.edit(edit => {
						edit.replace(fullRange, replacement)
					})

					// cursor at end of class value
					const newCursor = new vscode.Position(pos.line, start + replacement.length - 1) // before closing "
					editor.selection = new vscode.Selection(newCursor, newCursor)
					editor.revealRange(new vscode.Range(newCursor, newCursor))
					return
				}
			}

			// 2) Wrap: class="foo" -> class={cn("foo", "")}
			{
				const re = /\bclass\s*=\s*"([^"]*)"/g
				let m: RegExpExecArray | null
				while ((m = re.exec(text))) {
					const start = m.index
					const end = start + m[0].length
					const fullRange = new vscode.Range(
						new vscode.Position(pos.line, start),
						new vscode.Position(pos.line, end)
					)

					// Cursor may be anywhere inside `class=...` (including on class / = / quotes / value)
					if (!fullRange.contains(pos)) continue

					const value = m[1]
					const escaped = escapeForDoubleQuotes(value)

					// IMPORTANT: no quotes around the expression
					const replacement = `class={cn("${escaped}", "")}`

					await editor.edit(edit => {
						edit.replace(fullRange, replacement)
					})

					// Place cursor inside second arg quotes: class={cn("...", "|")}
					const cursorOffset = `class={cn("`.length + escaped.length + `", "`.length
					const newCursor = new vscode.Position(pos.line, start + cursorOffset)
					editor.selection = new vscode.Selection(newCursor, newCursor)
					editor.revealRange(new vscode.Range(newCursor, newCursor))
					return
				}
			}

			// If not in a supported class=... form, do nothing.
		})
	)
}

export function deactivate() {}

function escapeForDoubleQuotes(s: string): string {
	return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}
