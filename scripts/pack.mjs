// Pack the data-only theme plugin: structural checks + integrity over
// theme.files in declaration order, then the in-zip manifest + zip.
//
// The desktop install gate re-validates everything on install
// (MARKETPLACE_MANIFEST_SCHEMA, per-file validateThemeJson, integrity
// recompute) — this script mirrors those checks loosely so a broken theme
// fails here, not in the user's app.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";

const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const fail = (msg) => {
	console.error("pack failed:", msg);
	process.exit(1);
};

if (typeof manifest.id !== "string" || !manifest.id) fail("manifest.id missing");
if (!/^\d+\.\d+\.\d+$/.test(manifest.version ?? "")) fail("manifest.version must be X.Y.Z");
if (manifest.main) fail("theme plugin must not declare main");
const files = manifest.theme?.files;
if (!Array.isArray(files) || files.length === 0 || files.length > 8)
	fail("manifest.theme.files must list 1-8 files");

for (const f of files) {
	let raw;
	try {
		raw = JSON.parse(readFileSync(f, "utf8"));
	} catch {
		fail(`${f}: not valid JSON`);
	}
	if (raw.appearance !== "light" && raw.appearance !== "dark") fail(`${f}: appearance must be light|dark`);
	if (typeof raw.colors !== "object" || raw.colors === null) fail(`${f}: colors missing`);
}

// integrity = SHA-256 over [main?, nodeEntry?, ...theme.files?] in order
// (data-only theme: just the theme files).
const bufs = files.map((f) => readFileSync(f));
const integrity = createHash("sha256").update(Buffer.concat(bufs)).digest("hex");

mkdirSync("dist", { recursive: true });
const inZip = { ...manifest, integrity };
writeFileSync("dist/manifest.json", JSON.stringify(inZip, null, "\t") + "\n");

execSync(`cd dist && rm -f ${manifest.id}-*.zip ${manifest.id}.zip manifest-alias.json`, {
	stdio: "inherit",
});
execSync(`cp dist/manifest.json dist/manifest-alias.json`, { stdio: "inherit" });
execSync(
	`cd dist && zip -q -j ${manifest.id}-${manifest.version}.zip manifest.json ${files.map((f) => `../${f}`).join(" ")} && cp ${manifest.id}-${manifest.version}.zip ${manifest.id}.zip`,
	{ stdio: "inherit" },
);
console.log("packed:", `${manifest.id}-${manifest.version}.zip`, "integrity:", integrity);
