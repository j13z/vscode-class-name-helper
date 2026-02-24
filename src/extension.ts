import * as vscode from "vscode"

export function activate(context: vscode.ExtensionContext) {
	// Post-edit cursor placement helper (needs to be registered inside activate)
	context.subscriptions.push(
		vscode.commands.registerCommand("typeframe._afterClassCnEdit", (pos: vscode.Position) => {
			const editor = vscode.window.activeTextEditor
			if (!editor) return
			editor.selection = new vscode.Selection(pos, pos)
			editor.revealRange(new vscode.Range(pos, pos))
		})
	)

	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider({ language: "svelte" }, new ClassCnCodeActionProvider(), {
			providedCodeActionKinds: [vscode.CodeActionKind.RefactorRewrite, vscode.CodeActionKind.QuickFix]
		})
	)
}

export function deactivate() {}

class ClassCnCodeActionProvider implements vscode.CodeActionProvider {
	public provideCodeActions(
		document: vscode.TextDocument,
		range: vscode.Range,
		_context: vscode.CodeActionContext
	): vscode.CodeAction[] {
		const editor = vscode.window.activeTextEditor
		if (!editor) return []
		if (editor.document !== document) return []
		if (document.languageId !== "svelte") return []

		const found = findAtCursor(editor)
		if (!found) return []

		const action = new vscode.CodeAction(found.title, vscode.CodeActionKind.RefactorRewrite)

		const edit = new vscode.WorkspaceEdit()
		edit.replace(document.uri, found.replaceRange, found.replacementText)
		action.edit = edit

		action.command = {
			command: "typeframe._afterClassCnEdit",
			title: "",
			arguments: [found.newCursor]
		}

		return [action]
	}
}

type Found = {
	title: string
	replaceRange: vscode.Range
	replacementText: string
	newCursor: vscode.Position
}

function findAtCursor(editor: vscode.TextEditor): Found | null {
	const doc = editor.document
	const pos = editor.selection.active
	const lineText = doc.lineAt(pos.line).text

	// UNWRAP: class={cn("foo")} -> class="foo"
	// - allow whitespace
	// - allow either "..." or '...'
	// - ONLY one arg (no comma)
	{
		// capture quote in group 1 so we can ensure same closing quote via backref \1
		const re = /\bclass\s*=\s*\{\s*cn\s*\(\s*(["'])([^"'\\]*(?:\\.[^"'\\]*)*)\1\s*\)\s*\}/g

		let m: RegExpExecArray | null
		while ((m = re.exec(lineText))) {
			const start = m.index
			const end = start + m[0].length
			if (pos.character < start || pos.character > end) continue

			const rawValue = m[2]
			const value = unescapeMinimal(rawValue)

			const replacement = `class="${escapeForDoubleQuotes(value)}"`
			const replaceRange = new vscode.Range(
				new vscode.Position(pos.line, start),
				new vscode.Position(pos.line, end)
			)

			const newCursor = new vscode.Position(pos.line, start + replacement.length - 1) // before closing "
			return {
				title: "Unwrap cn() in class",
				replaceRange,
				replacementText: replacement,
				newCursor
			}
		}
	}

	// WRAP: class="foo" -> class={cn("foo", "")}
	{
		const re = /\bclass\s*=\s*"([^"]*)"/g
		let m: RegExpExecArray | null
		while ((m = re.exec(lineText))) {
			const start = m.index
			const end = start + m[0].length
			if (pos.character < start || pos.character > end) continue

			const value = m[1]
			const escaped = escapeForDoubleQuotes(value)

			const replacement = `class={cn("${escaped}", "")}`
			const replaceRange = new vscode.Range(
				new vscode.Position(pos.line, start),
				new vscode.Position(pos.line, end)
			)

			const cursorOffset = `class={cn("`.length + escaped.length + `", "`.length
			const newCursor = new vscode.Position(pos.line, start + cursorOffset)

			return {
				title: "Wrap class with cn(...)",
				replaceRange,
				replacementText: replacement,
				newCursor
			}
		}
	}

	return null
}

function escapeForDoubleQuotes(s: string): string {
	return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}

function unescapeMinimal(s: string): string {
	return s.replace(/\\(["'\\])/g, "$1")
}
