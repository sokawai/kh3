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

  test("party inquiry form is present", async ({ page }) => {
    const form = page.locator("form[data-brevo-form='partyInquiry']");
    await expect(form).toBeVisible();
  });

  test("inquiry form has an email input", async ({ page }) => {
    const input = page.locator(
      "form[data-brevo-form='partyInquiry'] input[type='email']"
    );
    await expect(input).toBeVisible();
  });

  test("inquiry form has a phone input", async ({ page }) => {
    const input = page.locator(
      "form[data-brevo-form='partyInquiry'] input[name='phone']"
    );
    await expect(input).toBeVisible();
  });

  test("inquiry form has a message textarea", async ({ page }) => {
    const textarea = page.locator(
      "form[data-brevo-form='partyInquiry'] textarea[name='message']"
    );
    await expect(textarea).toBeVisible();
  });

  test("inquiry form has a submit button", async ({ page }) => {
    const btn = page.locator(
      "form[data-brevo-form='partyInquiry'] button[type='submit']"
    );
    await expect(btn).toBeVisible();
  });

  test("submitting the form with an invalid email shows a validation error", async ({
    page,
  }) => {
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
