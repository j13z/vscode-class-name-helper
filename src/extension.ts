import * as vscode from "vscode"
import {
	findClassContainingAttributeNamesInLine,
	findClassCnEditInLine,
	findClassCnEditInText,
	getAttributeNameForLanguage,
	sanitizeFunctionName,
	type SupportedLanguageId
} from "./classCnTransform"

const SUPPORTED_LANGUAGES: SupportedLanguageId[] = ["svelte", "javascriptreact", "typescriptreact"]
const TOGGLE_COMMAND = "cnHelper.toggleClassCnAtCursor"

export function activate(context: vscode.ExtensionContext) {
	const provider = new ClassCnCodeActionProvider()
	const selector = SUPPORTED_LANGUAGES.map(language => ({ language }))

	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider(selector, provider, {
			providedCodeActionKinds: [vscode.CodeActionKind.RefactorRewrite, vscode.CodeActionKind.QuickFix]
		})
	)

	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand(TOGGLE_COMMAND, editor => {
			const found = findAtCursor(editor)
			if (!found) return

			editor
				.edit(builder => {
					builder.replace(found.replaceRange, found.replacementText)
				})
				.then(applied => {
					if (!applied) return
					const newCursor = editor.document.positionAt(found.newCursorOffset)
					editor.selection = new vscode.Selection(newCursor, newCursor)
					editor.revealRange(new vscode.Range(newCursor, newCursor))
				})
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
		if (!SUPPORTED_LANGUAGES.includes(document.languageId as SupportedLanguageId)) return []
		if (range.start.line !== range.end.line) return []

		const found = findAtCursor(editor)
		if (!found) return []

		const action = new vscode.CodeAction(found.title, vscode.CodeActionKind.RefactorRewrite)
		action.command = {
			command: TOGGLE_COMMAND,
			title: found.title
		}

		return [action]
	}
}

type Found = {
	title: string
	replaceRange: vscode.Range
	replacementText: string
	newCursorOffset: number
}

function findAtCursor(editor: vscode.TextEditor): Found | null {
	const doc = editor.document
	const pos = editor.selection.active
	const lineStartOffset = doc.offsetAt(new vscode.Position(pos.line, 0))
	const lineText = doc.lineAt(pos.line).text
	const config = vscode.workspace.getConfiguration("cnHelper", doc.uri)
	const functionName = sanitizeFunctionName(
		config.get<string>("functionName")
	)
	const matchAllContainingClass = config.get<boolean>("matchAllContainingClass", false)

	const attributeNames = matchAllContainingClass
		? findClassContainingAttributeNamesInLine(lineText)
		: (() => {
				const languageDefault = getAttributeNameForLanguage(doc.languageId)
				return languageDefault ? [languageDefault] : []
			})()

	for (const attributeName of attributeNames) {
		const match = findClassCnEditInLine({
			lineText,
			cursorCharacter: pos.character,
			attributeName,
			functionName
		})
		if (!match) continue

		return {
			title: match.title,
			replaceRange: new vscode.Range(
				new vscode.Position(pos.line, match.startCharacter),
				new vscode.Position(pos.line, match.endCharacter)
			),
			replacementText: match.replacementText,
			newCursorOffset: lineStartOffset + match.newCursorCharacter
		}
	}

	// Fallback for multi-line attribute values.
	const fullText = doc.getText()
	const attributeNamesForText = matchAllContainingClass
		? findClassContainingAttributeNamesInLine(fullText)
		: (() => {
				const languageDefault = getAttributeNameForLanguage(doc.languageId)
				return languageDefault ? [languageDefault] : []
			})()
	if (!attributeNamesForText.length) return null
	const cursorOffset = doc.offsetAt(pos)

	for (const attributeName of attributeNamesForText) {
		const match = findClassCnEditInText({
			text: fullText,
			cursorOffset,
			attributeName,
			functionName
		})
		if (!match) continue

		return {
			title: match.title,
			replaceRange: new vscode.Range(
				doc.positionAt(match.startCharacter),
				doc.positionAt(match.endCharacter)
			),
			replacementText: match.replacementText,
			newCursorOffset: match.newCursorCharacter
		}
	}

	return null
}
