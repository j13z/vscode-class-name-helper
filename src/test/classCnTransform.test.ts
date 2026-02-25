import assert from "node:assert/strict"
import test from "node:test"
import {
	findClassCnEditInLine,
	getAttributeNameForLanguage,
	sanitizeFunctionName
} from "../classCnTransform"

function match(lineText: string, cursorText: string, attributeName: "class" | "className", functionName = "cn") {
	const cursor = lineText.indexOf(cursorText)
	assert.notEqual(cursor, -1, `cursor token not found: ${cursorText}`)
	return findClassCnEditInLine({
		lineText,
		cursorCharacter: cursor,
		attributeName,
		functionName
	})
}

test("wraps svelte class attribute", () => {
	const line = `<div class="px-2 py-1">`
	const cursor = line.indexOf("px-2")
	const result = findClassCnEditInLine({
		lineText: line,
		cursorCharacter: cursor,
		attributeName: "class",
		functionName: "cn"
	})

	assert.ok(result)
	assert.equal(result.mode, "wrap")
	assert.equal(result.replacementText, `class={cn("px-2 py-1", "")}`)
	assert.equal(
		result.newCursorCharacter - result.startCharacter,
		result.replacementText.indexOf(`", ""`) + 4
	)
})

test("unwraps svelte class attribute using configured function name", () => {
	const line = `<div class={cx("px-2 py-1")}>`
	const cursor = line.indexOf("px-2")
	const result = findClassCnEditInLine({
		lineText: line,
		cursorCharacter: cursor,
		attributeName: "class",
		functionName: "cx"
	})

	assert.ok(result)
	assert.equal(result.mode, "unwrap")
	assert.equal(result.replacementText, `class="px-2 py-1"`)
})

test("wraps react className attribute", () => {
	const line = `<div className='flex items-center'></div>`
	const cursor = line.indexOf("items-center")
	const result = findClassCnEditInLine({
		lineText: line,
		cursorCharacter: cursor,
		attributeName: "className",
		functionName: "cn"
	})

	assert.ok(result)
	assert.equal(result.replacementText, `className={cn("flex items-center", "")}`)
})

test("wraps svelte class variable", () => {
	const line = `<div class={fooClasses}>`
	const cursor = line.indexOf("fooClasses")
	const result = findClassCnEditInLine({
		lineText: line,
		cursorCharacter: cursor,
		attributeName: "class",
		functionName: "cn"
	})

	assert.ok(result)
	assert.equal(result.mode, "wrap")
	assert.equal(result.replacementText, `class={cn(fooClasses, "")}`)
	assert.equal(
		result.newCursorCharacter - result.startCharacter,
		result.replacementText.indexOf(`, ""`) + 3
	)
})

test("unwraps svelte class variable from cn()", () => {
	const line = `<div class={cn(fooClasses)}>`
	const cursor = line.indexOf("fooClasses")
	const result = findClassCnEditInLine({
		lineText: line,
		cursorCharacter: cursor,
		attributeName: "class",
		functionName: "cn"
	})

	assert.ok(result)
	assert.equal(result.mode, "unwrap")
	assert.equal(result.replacementText, `class={fooClasses}`)
})

test("does not unwrap cn call with multiple args", () => {
	const line = `<div class={cn("px-2", active && "font-bold")}>`
	const cursor = line.indexOf("px-2")
	const result = findClassCnEditInLine({
		lineText: line,
		cursorCharacter: cursor,
		attributeName: "class",
		functionName: "cn"
	})

	assert.equal(result, null)
})

test("does not wrap arbitrary expression in braces", () => {
	const line = `<div class={isActive ? "a" : "b"}>`
	const cursor = line.indexOf("isActive")
	const result = findClassCnEditInLine({
		lineText: line,
		cursorCharacter: cursor,
		attributeName: "class",
		functionName: "cn"
	})

	assert.equal(result, null)
})

test("requires cursor to be inside matching attribute", () => {
	const line = `<div class="one" data-x="two">`
	const cursor = line.indexOf("data-x")
	const result = findClassCnEditInLine({
		lineText: line,
		cursorCharacter: cursor,
		attributeName: "class",
		functionName: "cn"
	})

	assert.equal(result, null)
})

test("language mapping and function sanitizing", () => {
	assert.equal(getAttributeNameForLanguage("svelte"), "class")
	assert.equal(getAttributeNameForLanguage("typescriptreact"), "className")
	assert.equal(getAttributeNameForLanguage("typescript"), null)
	assert.equal(sanitizeFunctionName(" cx "), "cx")
	assert.equal(sanitizeFunctionName("cn.helper"), "cn")
	assert.equal(sanitizeFunctionName(""), "cn")
})

test("supports variable/member expression samples", () => {
	const samples = [
		{
			line: `<div class={styles.root}>`,
			attr: "class" as const,
			cursorText: "styles",
			wrap: `class={cn(styles.root, "")}`,
			unwrapInput: `<div class={cn(styles.root)}>` ,
			unwrap: `class={styles.root}`
		},
		{
			line: `<div className={styles["root"]}></div>`,
			attr: "className" as const,
			cursorText: "styles",
			wrap: `className={cn(styles["root"], "")}`,
			unwrapInput: `<div className={cn(styles["root"])}></div>`,
			unwrap: `className={styles["root"]}`
		},
		{
			line: `<div className={styles[0]}></div>`,
			attr: "className" as const,
			cursorText: "styles",
			wrap: `className={cn(styles[0], "")}`,
			unwrapInput: `<div className={cn(styles[0])}></div>`,
			unwrap: `className={styles[0]}`
		}
	]

	for (const sample of samples) {
		const wrapped = match(sample.line, sample.cursorText, sample.attr, "cn")
		assert.ok(wrapped)
		assert.equal(wrapped.replacementText, sample.wrap)

		const unwrapped = match(sample.unwrapInput, sample.cursorText, sample.attr, "cn")
		assert.ok(unwrapped)
		assert.equal(unwrapped.mode, "unwrap")
		assert.equal(unwrapped.replacementText, sample.unwrap)
	}
})

test("does not match invalid variable-like expressions", () => {
	const cases = [
		`<div class={getClasses()}>`,
		`<div class={foo + " bar"}>`,
		`<div class={foo?.bar}>`,
		`<div class={arr[index]}>`
	]

	for (const line of cases) {
		const result = match(line, "class", "class")
		assert.equal(result, null)
	}
})

test("handles escaped string content when wrapping and unwrapping", () => {
	const wrapInput = `<div class="a\\\"b \\\\ c">`
	const wrapped = match(wrapInput, `a`, "class")
	assert.ok(wrapped)
	assert.equal(wrapped.replacementText, `class={cn("a\\\"b \\\\ c", "")}`)

	const unwrapInput = `<div class={cn("a\\\"b \\\\ c")}>`
	const unwrapped = match(unwrapInput, `a`, "class")
	assert.ok(unwrapped)
	assert.equal(unwrapped.replacementText, `class="a\\\"b \\\\ c"`)
})

test("respects line length guard", () => {
	const longValue = "x".repeat(4001)
	const line = `<div class="${longValue}">`
	const result = findClassCnEditInLine({
		lineText: line,
		cursorCharacter: line.indexOf("x"),
		attributeName: "class",
		functionName: "cn"
	})
	assert.equal(result, null)
})

test("selects the matching attribute at cursor when multiple attributes exist", () => {
	const line = `<div class="one" className="two">`

	const classResult = match(line, "one", "class")
	assert.ok(classResult)
	assert.equal(classResult.replacementText, `class={cn("one", "")}`)

	const classNameResult = match(line, "two", "className")
	assert.ok(classNameResult)
	assert.equal(classNameResult.replacementText, `className={cn("two", "")}`)
})
