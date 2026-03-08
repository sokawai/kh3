# Testing Guide — Kencha House

This document explains how to run, extend, and maintain the automated test suite for the Kencha House static site.

---

## Overview

The project uses two complementary testing layers:

| Layer | Tool | What it tests | Typical run time |
|---|---|---|---|
| **Unit** | [Jest](https://jestjs.io/) + [jsdom](https://github.com/jsdom/jsdom) | Pure JavaScript utility functions, DOM injection logic | ~1 s |
| **E2E** | [Playwright](https://playwright.dev/) (Chromium) | All pages, navigation links, forms, mobile menu | ~10 s |

A **smart test runner** (`npm run test:smart`) analyses the files changed in a commit or PR and selects the most relevant subset automatically, reducing feedback time during active development.

---

## Quick Start

```bash
# Install dependencies (first time only)
npm install

# Install Playwright's browser binaries (first time only)
npx playwright install chromium

# Run unit tests only
npm run test:unit

# Run E2E tests only
npm run test:e2e

# Run the full suite (unit + E2E)
npm test

# Run smart selection based on uncommitted changes
npm run test:smart
```

---

## Unit Tests

**Location:** `tests/unit/`

| File | What it covers |
|---|---|
| `brevo.test.js` | `isValidEmail`, `isValidNanpPhone`, `normalizeSms`, `compactText`, `toObject`, `formatPhoneForDisplay`, `getMaxMessageChars`, `buildPayload` (3-arg: form, fieldMap, formConfig), `getFieldErrorMessage` |
| `kh-shared.test.js` | `toggleMobileMenu`, nav and footer injection (`injectSharedComponents`), duplicate injection prevention |

### How to run

```bash
npm run test:unit
# or with coverage:
npx jest --coverage
```

### How it works

`brevo.js` exposes its pure utility functions via a conditional `module.exports` block at the bottom of the IIFE so they can be `require()`-d in Node.js without a browser. The jsdom environment provided by `jest-environment-jsdom` simulates a browser DOM for tests that manipulate elements.

`kh-shared.js` is loaded with `global.eval()` so that its top-level `function` declarations (e.g. `toggleMobileMenu`) become available on the jsdom `window` object.

### Adding a new unit test

1. Create or edit a file in `tests/unit/`.
2. Use standard Jest APIs (`describe`, `test`, `expect`).
3. The jsdom environment is pre-configured in `jest.config.js`; you have access to `document`, `window`, etc.

---

## E2E Tests

**Location:** `tests/e2e/`

| File | What it covers |
|---|---|
| `navigation.spec.js` | Desktop nav links, mobile hamburger menu, footer links |
| `pages.spec.js` | Page titles, headings, CTAs, newsletter & inquiry forms, client-side validation |

### How to run

```bash
npm run test:e2e
# or with the Playwright UI:
npx playwright test --ui
# or for a specific file:
npx playwright test navigation.spec.js
```

### How it works

Tests load HTML pages directly from disk (`file://` protocol) via `page.goto()`. A `tailwindStub` init script (`window.tailwind = { config: {} }`) is injected before each page load so that `kh-shared.js` can execute without the Tailwind CDN being available.

### Adding a new E2E test

1. Create or edit a file in `tests/e2e/` with a `.spec.js` extension.
2. Import `{ test, expect }` from `@playwright/test`.
3. Use the `ROOT` constant (or the existing `url()` helper in `pages.spec.js`) to build file paths.
4. Add `await page.addInitScript(() => { window.tailwind = { config: {} }; })` in your `beforeEach` if the page loads `kh-shared.js`.

**Example:**

```js
const { test, expect } = require("@playwright/test");
const path = require("path");
const ROOT = "file://" + path.resolve(__dirname, "../../") + "/";

test("my new page has the right title", async ({ page }) => {
  await page.addInitScript(() => { window.tailwind = { config: {} }; });
  await page.goto(ROOT + "my-page.html");
  await expect(page).toHaveTitle(/My Page/i);
});
```

---

## Smart Test Runner

**Script:** `scripts/smart-test.js`

The smart runner reads the list of changed files and picks which tests to run:

| Changed files | Tests executed |
|---|---|
| Only `.js` / `.css` | Unit tests |
| Only `.html` | E2E tests |
| Mix of JS/CSS and HTML | Unit + E2E (full suite) |
| Nothing detected | Full suite (safe default) |

### Environment variables

| Variable | Description |
|---|---|
| `CHANGED_FILES` | Space-separated list of changed file paths (overrides git detection) |
| `BASE_REF` | Base git ref to diff against (default: `HEAD`) |

```bash
# Example: simulate a CI environment with explicit changed files
CHANGED_FILES="brevo.js brevo-config.js" npm run test:smart
```

---

## CI Integration

The workflow lives in `.github/workflows/test.yml` and defines three jobs:

| Job | Trigger | Description |
|---|---|---|
| `unit` | Every push and PR | Runs `npm run test:unit` |
| `e2e` | Every push and PR | Runs `npm run test:e2e`, uploads Playwright HTML report as an artifact |
| `smart` | PR only | Runs `npm run test:smart` with the diff of the PR branch vs. its base |

Playwright HTML reports are retained for 14 days as workflow artifacts under the name **playwright-report**.

---

## Troubleshooting

### `tailwind is not defined` in E2E tests
Make sure you call `await page.addInitScript(() => { window.tailwind = { config: {} }; })` before `page.goto()` in your test. The site loads Tailwind from a CDN which is not available in the `file://` test environment.

### Unit tests fail with `document is not defined`
Ensure `testEnvironment: "jsdom"` is set in `jest.config.js` (it is by default in this project).

### Playwright can't find the browser
Run `npx playwright install chromium` to download the browser binaries.
