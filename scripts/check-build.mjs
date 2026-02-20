#!/usr/bin/env node
/**
 * Build artifact integrity check.
 * Run after `npm run build`. Exits 1 on any failure.
 *
 * Checks:
 *   1. assets/main-*.js exists (widget bundle)
 *   2. No assets/client-*.js exists (Vite chunk splitting regression guard)
 *   3. main-*.js has no external import statements (self-contained bundle)
 *   4. assets/admin.html exists
 *   5. assets/admin-*.js exists
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, "../assets");

let failed = false;

function pass(msg) {
  console.log(`  ✓ ${msg}`);
}

function fail(msg) {
  console.error(`  ✗ FAIL: ${msg}`);
  failed = true;
}

console.log("Checking build artifacts...\n");

let files;
try {
  files = readdirSync(assetsDir);
} catch {
  console.error(`ERROR: assets/ directory not found at ${assetsDir}`);
  console.error("Run `npm run build` first.");
  process.exit(1);
}

// 1. Widget bundle exists
const mainJs = files.filter((f) => f.startsWith("main-") && f.endsWith(".js"));
if (mainJs.length === 0) {
  fail("No main-*.js found in assets/ — widget bundle is missing");
} else if (mainJs.length > 1) {
  fail(`Multiple main-*.js files: ${mainJs.join(", ")} — unexpected`);
} else {
  pass(`Widget bundle present: ${mainJs[0]}`);
}

// 2. No chunk splitting
const clientJs = files.filter((f) => f.startsWith("client-") && f.endsWith(".js"));
if (clientJs.length > 0) {
  fail(
    `Vite chunk splitting detected: ${clientJs.join(", ")}\n` +
    `    The widget bundle is not self-contained. ChatGPT's sandboxed iframe\n` +
    `    cannot resolve external chunk imports. Fix: ensure web/vite.config.ts\n` +
    `    does not share chunks between widget and admin builds.`
  );
} else {
  pass("No client-*.js chunks (bundle is not split)");
}

// 3. Bundle is self-contained (no external import statements)
if (mainJs.length === 1) {
  const content = readFileSync(join(assetsDir, mainJs[0]), "utf-8");
  // Match bare `import "..."` or `import '...'` at the start of a statement
  if (/(?:^|;|\})\s*import\s*["']/.test(content)) {
    fail(
      `main-*.js contains external import statements — bundle has unresolved dependencies.\n` +
      `    This means the widget will fail to load in ChatGPT's sandboxed iframe.`
    );
  } else {
    pass("main-*.js contains no external import statements (self-contained)");
  }
}

// 4. Admin HTML exists
if (!files.includes("admin.html")) {
  fail("admin.html not found in assets/ — admin build is missing");
} else {
  pass("admin.html present");
}

// 5. Admin JS bundle exists
const adminJs = files.filter((f) => f.startsWith("admin-") && f.endsWith(".js"));
if (adminJs.length === 0) {
  fail("No admin-*.js found in assets/ — admin bundle is missing");
} else {
  pass(`Admin bundle present: ${adminJs[0]}`);
}

console.log();
if (failed) {
  console.error("Build artifact checks FAILED. See above for details.");
  process.exit(1);
}
console.log("All build artifact checks passed.");
