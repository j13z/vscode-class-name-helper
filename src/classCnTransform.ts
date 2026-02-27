export type SupportedLanguageId = "svelte" | "javascriptreact" | "typescriptreact"

export type AttributeName = string

export type LineEditMatch = {
	mode: "wrap" | "unwrap"
	title: string
	startCharacter: number
	endCharacter: number
	replacementText: string
	newCursorCharacter: number
}

type FindLineEditParams = {
	lineText: string
	cursorCharacter: number
	attributeName: AttributeName
	functionName: string
}

type FindTextEditParams = {
	text: string
	cursorOffset: number
	attributeName: AttributeName
	functionName: string
	maxTextLength?: number
}

const MAX_LINE_LENGTH = 4000
const MAX_TEXT_LENGTH = 200_000

export function getAttributeNameForLanguage(languageId: string): AttributeName | null {
	if (languageId === "svelte") return "class"
	if (languageId === "javascriptreact" || languageId === "typescriptreact") return "className"
	return null
}

export function sanitizeFunctionName(value: string | undefined): string {
	const trimmed = value?.trim()
	if (!trimmed) return "cn"
	return /^[A-Za-z_$][\w$]*$/.test(trimmed) ? trimmed : "cn"
}

export function findClassContainingAttributeNamesInLine(lineText: string): string[] {
	const names = new Set<string>()
	const re = /\b([A-Za-z_$][\w$-]*)\s*=/g

	let m: RegExpExecArray | null
	while ((m = re.exec(lineText))) {
		const name = m[1]
		if (!name.toLowerCase().includes("class")) continue
		names.add(name)
	}

	return Array.from(names)
}

export function findClassCnEditInLine(params: FindLineEditParams): LineEditMatch | null {
	const { lineText, cursorCharacter, attributeName, functionName } = params

	return findClassCnEditInText({
		text: lineText,
		cursorOffset: cursorCharacter,
		attributeName,
		functionName,
		maxTextLength: MAX_LINE_LENGTH
	})
}

export function findClassCnEditInText(params: FindTextEditParams): LineEditMatch | null {
	const { text, cursorOffset, attributeName, functionName, maxTextLength = MAX_TEXT_LENGTH } = params

	if (text.length > maxTextLength) return null
	if (!text.includes(attributeName)) return null

	const escapedAttributeName = escapeRegExp(attributeName)
	// UNWRAP: class={cn("foo")} / className={cn("foo")}
	{
		const re = new RegExp(
			String.raw`\b${escapedAttributeName}\s*=\s*\{\s*([A-Za-z_$][\w$]*)\s*\(\s*(["'])([^"'\\]*(?:\\.[^"'\\]*)*)\2\s*(?:,\s*)?\)\s*\}`,
			"g"
		)

		let m: RegExpExecArray | null
		while ((m = re.exec(text))) {
			const start = m.index
			const end = start + m[0].length
			if (cursorOffset < start || cursorOffset > end) continue

			const matchedFunctionName = m[1]
			const rawValue = m[3]
			const value = unescapeMinimal(rawValue)
			const replacement = `${attributeName}="${escapeForDoubleQuotes(value)}"`

			return {
				mode: "unwrap",
				title: `Unwrap ${matchedFunctionName}() in ${attributeName}`,
				startCharacter: start,
				endCharacter: end,
				replacementText: replacement,
				newCursorCharacter: start + replacement.length - 1
			}
		}
	}

	// UNWRAP VARIABLE: class={cn(fooClasses)} / className={cn(styles.root)}
	{
		const re = new RegExp(
			String.raw`\b${escapedAttributeName}\s*=\s*\{\s*([A-Za-z_$][\w$]*)\s*\(\s*([^)]+?)\s*(?:,\s*)?\)\s*\}`,
			"g"
		)

		let m: RegExpExecArray | null
		while ((m = re.exec(text))) {
			const start = m.index
			const end = start + m[0].length
			if (cursorOffset < start || cursorOffset > end) continue

			const matchedFunctionName = m[1]
			const expression = m[2].trim()
			if (!isSimpleVariableExpression(expression)) continue

			const replacement = `${attributeName}={${expression}}`

			return {
				mode: "unwrap",
				title: `Unwrap ${matchedFunctionName}() in ${attributeName}`,
				startCharacter: start,
				endCharacter: end,
				replacementText: replacement,
				newCursorCharacter: start + replacement.length - 1
			}
		}
	}

	// WRAP: class="foo" / className='foo'
	{
		const re = new RegExp(
			String.raw`\b${escapedAttributeName}\s*=\s*(["'])([^"'\\]*(?:\\.[^"'\\]*)*)\1`,
			"g"
		)

		let m: RegExpExecArray | null
		while ((m = re.exec(text))) {
			const start = m.index
			const end = start + m[0].length
			if (cursorOffset < start || cursorOffset > end) continue

			const value = unescapeMinimal(m[2])
			const escaped = escapeForDoubleQuotes(normalizeWhitespaceIfMultiline(value))
			const replacement = `${attributeName}={${functionName}("${escaped}", )}`
			const cursorPlacementOffset =
				`${attributeName}={${functionName}("`.length + escaped.length + `", `.length

			return {
				mode: "wrap",
				title: `Wrap ${attributeName} with ${functionName}(...)`,
				startCharacter: start,
				endCharacter: end,
				replacementText: replacement,
				newCursorCharacter: start + cursorPlacementOffset
			}
		}
	}

	// WRAP VARIABLE: class={fooClasses} / className={styles.root}
	{
		const re = new RegExp(String.raw`\b${escapedAttributeName}\s*=\s*\{\s*([^}]+?)\s*\}`, "g")

		let m: RegExpExecArray | null
		while ((m = re.exec(text))) {
			const start = m.index
			const end = start + m[0].length
			if (cursorOffset < start || cursorOffset > end) continue

			const expression = m[1].trim()
			if (!isSimpleVariableExpression(expression)) continue

			const replacement = `${attributeName}={${functionName}(${expression}, )}`
			const cursorPlacementOffset =
				`${attributeName}={${functionName}(`.length + expression.length + `, `.length

			return {
				mode: "wrap",
				title: `Wrap ${attributeName} with ${functionName}(...)`,
				startCharacter: start,
				endCharacter: end,
				replacementText: replacement,
				newCursorCharacter: start + cursorPlacementOffset
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

function escapeRegExp(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function isSimpleVariableExpression(value: string): boolean {
	return /^[A-Za-z_$][\w$]*(?:\s*(?:\.\s*[A-Za-z_$][\w$]*|\[\s*(?:"[^"]*"|'[^']*'|\d+)\s*\]))*$/.test(
		value
	)
}

function normalizeWhitespaceIfMultiline(value: string): string {
	if (!/[\r\n]/.test(value)) return value
	return value.replace(/\s+/g, " ").trim()
}
