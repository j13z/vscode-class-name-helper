import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"))
const changelog = readFileSync(new URL("../CHANGELOG.md", import.meta.url), "utf8")

const version = String(pkg.version ?? "").trim()
if (!version) fail("package.json version is missing")

const changelogHeader = new RegExp(`^## \\[${escapeRegExp(version)}\\]\\s*$`, "m")
if (!changelogHeader.test(changelog)) {
	fail(`CHANGELOG.md is missing an entry heading for version ${version} (expected: ## [${version}])`)
}

console.log(`OK changelog entry found for ${version}`)

try {
	execFileSync("git", ["rev-parse", "--is-inside-work-tree"], { stdio: "ignore" })
	console.log("OK git repository detected")
} catch {
	// Non-fatal: this script can still validate changelog/version outside git context.
	console.log("Note: git repository not detected (skipping git-aware checks)")
}

function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function fail(message) {
	console.error(`Release validation failed: ${message}`)
	process.exit(1)
}
