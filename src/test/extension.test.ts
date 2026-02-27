import * as assert from "node:assert/strict"
import * as vscode from "vscode"

suite("Extension integration", () => {
	const disposables: vscode.Disposable[] = []

	teardown(async () => {
		while (disposables.length) {
			disposables.pop()?.dispose()
		}

		await vscode.commands.executeCommand("workbench.action.closeAllEditors")
	})

	test("command toggles class string at cursor in svelte document", async () => {
		const editor = await openEditor(`<div class="px-2 py-1"></div>`, "svelte")
		setCursor(editor, "px-2")

		await vscode.commands.executeCommand("cnHelper.toggleClassCnAtCursor")
		await waitForDocumentText(editor.document, `<div class={cn("px-2 py-1", )}></div>`)

		assert.equal(editor.document.getText(), `<div class={cn("px-2 py-1", )}></div>`)

		const line = editor.document.lineAt(0).text
		const cursor = editor.selection.active.character
		const expectedCursor = line.indexOf(`", )`) + 3
		assert.equal(cursor, expectedCursor)
	})

	test("code action is offered only when cursor is inside supported attribute", async () => {
		const editor = await openEditor(`<div class="one" data-x="two"></div>`, "svelte")

		setCursor(editor, "one")
		const actionsInside = await getCodeActions(editor)
		assert.ok(actionsInside.some(action => action.title.includes("Wrap class with cn")))

		setCursor(editor, "data-x")
		const actionsOutside = await getCodeActions(editor)
		assert.equal(actionsOutside.length, 0)
	})

	test("command wraps multi-line class string and joins whitespace", async () => {
		const before = `<div class="foo
    bar qux
    baz bat"
></div>`
		const after = `<div class={cn("foo bar qux baz bat", )}
></div>`

		const editor = await openEditor(before, "svelte")
		setCursor(editor, "bar qux")

		await vscode.commands.executeCommand("cnHelper.toggleClassCnAtCursor")
		await waitForDocumentText(editor.document, after)

		assert.equal(editor.document.getText(), after)
		const cursorOffset = editor.document.offsetAt(editor.selection.active)
		assert.equal(cursorOffset, after.indexOf(" )}") + 1)
	})

	test("multi-line wrap keeps cursor before )} and not after following content", async () => {
		const before = `<div
	class="rounded-lg bg-popover p-6 shadow-lg border border-border focus:outline-none
		data-[state=open]:animate-in data-[state=closed]:animate-out
		data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
>
	<form></form>
</div>`
		const after = `<div
	class={cn("rounded-lg bg-popover p-6 shadow-lg border border-border focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", )}
>
	<form></form>
</div>`

		const editor = await openEditor(before, "svelte")
		setCursor(editor, "data-[state=open]:animate-in")

		await vscode.commands.executeCommand("cnHelper.toggleClassCnAtCursor")
		await waitForDocumentText(editor.document, after)

		const docText = editor.document.getText()
		const cursorOffset = editor.document.offsetAt(editor.selection.active)
		assert.equal(cursorOffset, after.indexOf(" )}") + 1)
		assert.ok(cursorOffset < docText.indexOf("<form>"))
	})
})

async function openEditor(content: string, language: string): Promise<vscode.TextEditor> {
	const doc = await vscode.workspace.openTextDocument({ content, language })
	const editor = await vscode.window.showTextDocument(doc)
	return editor
}

function setCursor(editor: vscode.TextEditor, token: string) {
	const idx = editor.document.getText().indexOf(token)
	assert.notEqual(idx, -1, `token not found: ${token}`)
	const pos = editor.document.positionAt(idx)
	editor.selection = new vscode.Selection(pos, pos)
}

async function getCodeActions(editor: vscode.TextEditor): Promise<vscode.CodeAction[]> {
	const pos = editor.selection.active
	const range = new vscode.Range(pos, pos)
	const actions = await vscode.commands.executeCommand<
		(vscode.CodeAction | vscode.Command)[]
	>("vscode.executeCodeActionProvider", editor.document.uri, range)

	return (actions ?? []).filter((action): action is vscode.CodeAction => "edit" in action || "kind" in action)
}

async function waitForDocumentText(
	document: vscode.TextDocument,
	expected: string,
	timeoutMs = 1000
): Promise<void> {
	const start = Date.now()
	while (Date.now() - start < timeoutMs) {
		if (document.getText() === expected) return
		await new Promise(resolve => setTimeout(resolve, 20))
	}

	assert.equal(document.getText(), expected)
}
