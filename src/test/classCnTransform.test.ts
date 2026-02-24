import assert from "node:assert/strict"
import test from "node:test"
import {
	findClassCnEditInLine,
	getAttributeNameForLanguage,
	sanitizeFunctionName
} from "../classCnTransform"

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
