// @ts-check
const { test, expect } = require("@playwright/test");
const path = require("path");

/**
 * E2E tests: Individual page content and user flows.
 *
 * Covers the six public HTML pages:
 *   index.html  – home / hero section, CTA buttons, newsletter form
 *   about.html  – about page title
 *   faq.html    – FAQ page content
 *   play.html   – Play Space page
 *   parties.html – Parties page and inquiry form
 *   studio.html  – Studio page and booking form
 *
 * A `tailwind` stub is injected before each page load so that kh-shared.js
 * can execute without the Tailwind CDN being available.
 */

const ROOT = "file://" + path.resolve(__dirname, "../../") + "/";

// Stub the global `tailwind` object so kh-shared.js runs without the CDN.
const tailwindStub = () => {
  window.tailwind = { config: {} };
};

function url(page) {
  return ROOT + page;
}

// ---------------------------------------------------------------------------
// Home page (index.html)
// ---------------------------------------------------------------------------
test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(tailwindStub);
    await page.goto(url("index.html"));
  });

  test("has the correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Kencha House/i);
  });

  test("hero section heading is visible", async ({ page }) => {
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible();
  });

  test("'Book Private Play' CTA links to youcanbook.me", async ({ page }) => {
    const cta = page.locator("a[href*='youcanbook.me']").first();
    await expect(cta).toBeVisible();
  });

  test("'Our Philosophy' link points to about.html", async ({ page }) => {
    const link = page.locator("a[href='about.html']").first();
    await expect(link).toBeVisible();
  });

  test("newsletter subscription form is present", async ({ page }) => {
    const form = page.locator("form[data-brevo-form='newsletter']");
    await expect(form).toBeVisible();
  });

  test("newsletter email input is present", async ({ page }) => {
    const input = page.locator(
      "form[data-brevo-form='newsletter'] input[type='email']"
    );
    await expect(input).toBeVisible();
  });

  test("newsletter subscribe button is present", async ({ page }) => {
    const btn = page.locator(
      "form[data-brevo-form='newsletter'] button[type='submit']"
    );
    await expect(btn).toBeVisible();
  });

  test("'Full FAQ Guide' link navigates to faq.html", async ({ page }) => {
    const link = page.locator("a[href='faq.html']").first();
    await link.click();
    await expect(page).toHaveURL(/faq\.html/);
  });
});

// ---------------------------------------------------------------------------
// About page (about.html)
// ---------------------------------------------------------------------------
test.describe("About page", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(tailwindStub);
    await page.goto(url("about.html"));
  });

  test("has the correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/About/i);
  });

  test("has a visible h1 or h2 heading", async ({ page }) => {
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible();
  });

  test("nav is present and shows the site logo link", async ({ page }) => {
    await expect(page.locator("nav a[href='index.html']").first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// FAQ page (faq.html)
// ---------------------------------------------------------------------------
test.describe("FAQ page", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(tailwindStub);
    await page.goto(url("faq.html"));
  });

  test("has the correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/FAQ/i);
  });

  test("has a visible heading", async ({ page }) => {
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible();
  });

  test("contains 'Parties' FAQ section", async ({ page }) => {
    const section = page.getByText("Parties", { exact: false }).first();
    await expect(section).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Play page (play.html)
// ---------------------------------------------------------------------------
test.describe("Play page", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(tailwindStub);
    await page.goto(url("play.html"));
  });

  test("has the correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Play/i);
  });

  test("has a visible heading", async ({ page }) => {
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible();
  });

  test("'Book Private Play' CTA is present", async ({ page }) => {
    const cta = page.locator("a[href*='youcanbook.me']").first();
    await expect(cta).toBeVisible();
  });

  test("footer is present on the page", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Parties page (parties.html)
// ---------------------------------------------------------------------------
// Parties page (parties.html) — multi-step booking wizard
// ---------------------------------------------------------------------------

/**
 * Helper: navigate through the wizard to step 4 (Guest Details).
 * Clicks a package card, waits for the calendar, clicks an available
 * date, waits for time slots, clicks a time slot, and waits for step 4.
 *
 * Assumes: at least one package card, one available calendar date, and
 * one time slot are present (i.e. KH_PARTY_CONFIG has not blocked all dates).
 */
async function navigateToStep4(page) {
  // Step 1 → pick first package card
  await page.locator(".kh-pkg-card").first().click();
  // Step 2 → pick first available calendar date
  await page.waitForSelector("#kh-step-2:not([hidden])");
  await page.locator(".kh-cal-cell.available").first().click();
  // Step 3 → pick first time slot
  await page.waitForSelector("#kh-step-3:not([hidden])");
  await page.locator(".kh-time-btn").first().click();
  // Step 4 → guest details
  await page.waitForSelector("#kh-step-4:not([hidden])");
}

test.describe("Parties page", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(tailwindStub);
    await page.goto(url("parties.html"));
  });

  test("has the correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Part/i);
  });

  test("has a visible heading", async ({ page }) => {
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible();
  });

  // ── Wizard structure ──────────────────────────────────────────────────────

  test("booking wizard container is present on the page", async ({ page }) => {
    const wizard = page.locator("#kh-booking-wizard");
    await expect(wizard).toBeAttached();
  });

  test("step 1 package cards are rendered on load", async ({ page }) => {
    // At least one package card should be visible in step 1
    const card = page.locator(".kh-pkg-card").first();
    await expect(card).toBeVisible();
  });

  test("step indicator is visible", async ({ page }) => {
    const indicator = page.locator("#kh-step-indicator");
    await expect(indicator).toBeVisible();
  });

  test("party inquiry form is present in the wizard", async ({ page }) => {
    const form = page.locator("form[data-brevo-form='partyInquiry']");
    await expect(form).toBeAttached();
  });

  // ── Wizard navigation ──────────────────────────────────────────────────────

  test("selecting a package advances to step 2 (date selection)", async ({
    page,
  }) => {
    await page.locator(".kh-pkg-card").first().click();
    await expect(page.locator("#kh-step-2")).not.toHaveAttribute("hidden");
    await expect(page.locator("#kh-calendar")).toBeVisible();
  });

  test("calendar renders day-name headers", async ({ page }) => {
    await page.locator(".kh-pkg-card").first().click();
    await page.waitForSelector("#kh-step-2:not([hidden])");
    const sunLabel = page.locator(".kh-cal-label").first();
    await expect(sunLabel).toBeVisible();
  });

  test("selecting a date advances to step 3 (time selection)", async ({
    page,
  }) => {
    await page.locator(".kh-pkg-card").first().click();
    await page.waitForSelector("#kh-step-2:not([hidden])");
    await page.locator(".kh-cal-cell.available").first().click();
    await expect(page.locator("#kh-step-3")).not.toHaveAttribute("hidden");
    await expect(page.locator(".kh-time-btn").first()).toBeVisible();
  });

  test("selecting a time slot advances to step 4 (guest details)", async ({
    page,
  }) => {
    await navigateToStep4(page);
    await expect(page.locator("#kh-step-4")).not.toHaveAttribute("hidden");
  });

  // ── Step 4: form fields ────────────────────────────────────────────────────

  test("step 4 shows an email input", async ({ page }) => {
    await navigateToStep4(page);
    const input = page.locator(
      "form[data-brevo-form='partyInquiry'] input[type='email']"
    );
    await expect(input).toBeVisible();
  });

  test("step 4 shows a phone input", async ({ page }) => {
    await navigateToStep4(page);
    const input = page.locator(
      "form[data-brevo-form='partyInquiry'] input[name='phone']"
    );
    await expect(input).toBeVisible();
  });

  test("step 4 shows a message textarea", async ({ page }) => {
    await navigateToStep4(page);
    const textarea = page.locator(
      "form[data-brevo-form='partyInquiry'] textarea[name='message']"
    );
    await expect(textarea).toBeVisible();
  });

  test("step 4 shows the submit button", async ({ page }) => {
    await navigateToStep4(page);
    const btn = page.locator(
      "form[data-brevo-form='partyInquiry'] button[type='submit']"
    );
    await expect(btn).toBeVisible();
  });

  test("message textarea is pre-filled with booking summary after wizard", async ({
    page,
  }) => {
    await navigateToStep4(page);
    const textarea = page.locator(
      "form[data-brevo-form='partyInquiry'] textarea[name='message']"
    );
    const value = await textarea.inputValue();
    // Pre-fill injects "[Booking Request]" header
    expect(value).toContain("[Booking Request]");
  });

  test("submitting step 4 with an invalid email shows a validation error", async ({
    page,
  }) => {
    await navigateToStep4(page);
    const form = page.locator("form[data-brevo-form='partyInquiry']");
    await form.locator("input[type='email']").fill("not-an-email");
    await form.locator("button[type='submit']").click();
    // Brevo's client-side validation sets a status message via [data-brevo-status]
    const status = form.locator("[data-brevo-status]");
    await expect(status).not.toBeEmpty();
  });
});

// ---------------------------------------------------------------------------
// Studio page (studio.html)
// ---------------------------------------------------------------------------
test.describe("Studio page", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(tailwindStub);
    await page.goto(url("studio.html"));
  });

  test("has the correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Studio/i);
  });

  test("has a visible heading", async ({ page }) => {
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible();
  });

  test("studio inquiry form is present", async ({ page }) => {
    const form = page.locator("form[data-brevo-form='studioInquiry']");
    await expect(form).toBeVisible();
  });

  test("studio form has an email input", async ({ page }) => {
    const input = page.locator(
      "form[data-brevo-form='studioInquiry'] input[type='email']"
    );
    await expect(input).toBeVisible();
  });

  test("studio form has a phone input", async ({ page }) => {
    const input = page.locator(
      "form[data-brevo-form='studioInquiry'] input[name='phone']"
    );
    await expect(input).toBeVisible();
  });

  test("studio form has a message textarea", async ({ page }) => {
    const textarea = page.locator(
      "form[data-brevo-form='studioInquiry'] textarea[name='message']"
    );
    await expect(textarea).toBeVisible();
  });

  test("studio form has a submit button", async ({ page }) => {
    const btn = page.locator(
      "form[data-brevo-form='studioInquiry'] button[type='submit']"
    );
    await expect(btn).toBeVisible();
  });

  test("submitting with an invalid email shows a validation error", async ({
    page,
  }) => {
    const form = page.locator("form[data-brevo-form='studioInquiry']");
    await form.locator("input[type='email']").fill("bad-email");
    await form.locator("button[type='submit']").click();
    const status = form.locator("[data-brevo-status]");
    await expect(status).not.toBeEmpty();
  });
});
