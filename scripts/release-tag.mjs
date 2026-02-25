import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"))
const version = String(pkg.version ?? "").trim()
if (!version) fail("package.json version is missing")

const tag = `v${version}`

ensureGitClean()
ensureTagDoesNotExist(tag)

execFileSync("git", ["tag", "-a", tag, "-m", tag], { stdio: "inherit" })
console.log(`Created tag ${tag}`)
console.log("Next step: git push origin <branch> --follow-tags")

function ensureGitClean() {
	const status = execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" }).trim()
	if (status) {
		fail("working tree is not clean (commit/stash changes before tagging)")
	}
}

function ensureTagDoesNotExist(tagName) {
	try {
		execFileSync("git", ["rev-parse", "-q", "--verify", `refs/tags/${tagName}`], { stdio: "ignore" })
	} catch (error) {
		// rev-parse exits non-zero when tag does not exist, which is what we want.
		return
	}

	fail(`tag already exists: ${tagName}`)
}

function fail(message) {
	console.error(`Release tagging failed: ${message}`)
	process.exit(1)
}
