#!/usr/bin/env node
/**
 * smart-test.js — Smart Test Runner for Kencha House
 *
 * Inspects the list of changed files (from `git diff --name-only` against the
 * merge-base of the current branch or a specific commit range supplied via the
 * CHANGED_FILES environment variable) and selects the most relevant subset of
 * tests to execute:
 *
 *   • Only JavaScript / CSS changes  → unit tests only  (fast, ~1 s)
 *   • Only HTML template changes     → E2E tests only   (page/layout focused)
 *   • Both JS/CSS AND HTML changes   → unit + E2E tests (full suite)
 *   • No relevant files changed      → unit + E2E tests (safe default)
 *
 * Usage
 * ─────
 *   # Run against uncommitted working-tree changes:
 *   node scripts/smart-test.js
 *
 *   # Run against a specific commit range (e.g. in CI):
 *   CHANGED_FILES="kh-shared.js brevo.js" node scripts/smart-test.js
 *
 *   # Or let the script diff HEAD against a base ref:
 *   BASE_REF=origin/main node scripts/smart-test.js
 */

"use strict";

const { execSync, spawnSync } = require("child_process");
const path = require("path");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns an array of changed file paths.
 * Priority: CHANGED_FILES env var → git diff against BASE_REF → git status.
 */
function getChangedFiles() {
  if (process.env.CHANGED_FILES) {
    return process.env.CHANGED_FILES.trim().split(/\s+/).filter(Boolean);
  }

  const base = process.env.BASE_REF || "HEAD";
  try {
    let gitOutput;
    if (base === "HEAD") {
      // Uncommitted changes (staged + unstaged) relative to the last commit
      gitOutput = execSync("git diff --name-only HEAD", { encoding: "utf8" });
      // Also include staged-only changes
      const staged = execSync("git diff --name-only --cached", {
        encoding: "utf8",
      });
      gitOutput += "\n" + staged;
    } else {
      gitOutput = execSync(`git diff --name-only ${base}...HEAD`, {
        encoding: "utf8",
      });
    }
    return gitOutput.trim().split("\n").filter(Boolean);
  } catch {
    // Fallback: treat all tracked files as changed
    return [];
  }
}

/** Returns true when the file is a JavaScript or CSS source file. */
function isJsOrCss(file) {
  return /\.(js|mjs|cjs|css)$/i.test(file);
}

/** Returns true when the file is an HTML page. */
function isHtml(file) {
  return /\.html?$/i.test(file);
}

/**
 * Executes an npm script and exits with the same code on failure.
 * @param {string} script  The npm run script name (e.g. "test:unit")
 */
function runScript(script) {
  console.log(`\n▶  npm run ${script}\n${"─".repeat(50)}`);
  // Use `shell` only on Windows where npm is a .cmd file; on POSIX, resolve
  // npm via the PATH directly to avoid the DEP0190 deprecation warning.
  const useShell = process.platform === "win32";
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    cwd: path.resolve(__dirname, ".."),
    shell: useShell,
  });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

// ---------------------------------------------------------------------------
// Decision logic
// ---------------------------------------------------------------------------

const changedFiles = getChangedFiles();

console.log("\n🔍  Smart Test Runner — Kencha House");
console.log("─".repeat(50));

if (changedFiles.length === 0) {
  console.log("ℹ️   No changed files detected. Running full test suite.\n");
  runScript("test:unit");
  runScript("test:e2e");
  process.exit(0);
}

console.log(`📝  Changed files (${changedFiles.length}):`);
changedFiles.forEach((f) => console.log(`    • ${f}`));

const hasJsOrCss = changedFiles.some(isJsOrCss);
const hasHtml = changedFiles.some(isHtml);

console.log(
  `\n📊  Change profile: JS/CSS=${hasJsOrCss ? "yes" : "no"}  HTML=${hasHtml ? "yes" : "no"}`
);

if (hasJsOrCss && !hasHtml) {
  console.log("→  Running unit tests (JS/CSS changes only)\n");
  runScript("test:unit");
} else if (hasHtml && !hasJsOrCss) {
  console.log("→  Running E2E tests (HTML-only changes)\n");
  runScript("test:e2e");
} else {
  console.log("→  Running full test suite (mixed changes)\n");
  runScript("test:unit");
  runScript("test:e2e");
}

console.log("\n✅  All selected tests passed.");
