// @ts-check
const { test, expect } = require("@playwright/test");
const path = require("path");

/**
 * E2E tests: Navigation – desktop nav links and mobile menu behaviour.
 *
 * All pages are loaded directly from disk using the file:// protocol so no
 * HTTP server is required.
 *
 * A `tailwind` stub is injected before page load so that kh-shared.js can
 * execute in full (it sets tailwind.config at the top-level scope).
 */

const ROOT = "file://" + path.resolve(__dirname, "../../") + "/";
const HOME = ROOT + "index.html";

// Stub the global `tailwind` object so kh-shared.js can run without the CDN.
const tailwindStub = () => {
  window.tailwind = { config: {} };
};

// ---------------------------------------------------------------------------
// Desktop navigation links
// ---------------------------------------------------------------------------
test.describe("Desktop navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(tailwindStub);
    await page.goto(HOME);
  });

  test("logo links to index.html", async ({ page }) => {
    const logoLink = page.locator("nav a[href='index.html']").first();
    await expect(logoLink).toBeVisible();
  });

  test("Play nav link has correct href", async ({ page }) => {
    const link = page.locator("nav a[href='play.html']").first();
    await expect(link).toBeVisible();
  });

  test("Parties nav link has correct href", async ({ page }) => {
    const link = page.locator("nav a[href='parties.html']").first();
    await expect(link).toBeVisible();
  });

  test("Studio nav link has correct href", async ({ page }) => {
    const link = page.locator("nav a[href='studio.html']").first();
    await expect(link).toBeVisible();
  });

  test("About nav link has correct href", async ({ page }) => {
    const link = page.locator("nav a[href='about.html']").first();
    await expect(link).toBeVisible();
  });

  test("clicking Play navigates to play.html", async ({ page }) => {
    await page.locator("nav a[href='play.html']").first().click();
    await expect(page).toHaveURL(/play\.html/);
  });

  test("clicking Parties navigates to parties.html", async ({ page }) => {
    await page.locator("nav a[href='parties.html']").first().click();
    await expect(page).toHaveURL(/parties\.html/);
  });

  test("clicking Studio navigates to studio.html", async ({ page }) => {
    await page.locator("nav a[href='studio.html']").first().click();
    await expect(page).toHaveURL(/studio\.html/);
  });

  test("clicking About navigates to about.html", async ({ page }) => {
    await page.locator("nav a[href='about.html']").first().click();
    await expect(page).toHaveURL(/about\.html/);
  });
});

// ---------------------------------------------------------------------------
// Mobile navigation menu
// ---------------------------------------------------------------------------
test.describe("Mobile navigation menu", () => {
  test.use({ viewport: { width: 390, height: 844 } }); // iPhone 14 size

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(tailwindStub);
    await page.goto(HOME);
  });

  test("mobile menu is hidden by default", async ({ page }) => {
    const isHidden = await page
      .locator("#mobile-menu")
      .evaluate((el) => el.classList.contains("hidden"));
    expect(isHidden).toBe(true);
  });

  test("clicking the hamburger button reveals the mobile menu", async ({
    page,
  }) => {
    await page.locator("#mobile-menu-btn").click();
    const isHidden = await page
      .locator("#mobile-menu")
      .evaluate((el) => el.classList.contains("hidden"));
    expect(isHidden).toBe(false);
  });

  test("clicking the hamburger button twice hides the menu again", async ({
    page,
  }) => {
    await page.locator("#mobile-menu-btn").click();
    await page.locator("#mobile-menu-btn").click();
    const isHidden = await page
      .locator("#mobile-menu")
      .evaluate((el) => el.classList.contains("hidden"));
    expect(isHidden).toBe(true);
  });

  test("mobile menu contains Play link", async ({ page }) => {
    await page.locator("#mobile-menu-btn").click();
    const link = page.locator("#mobile-menu a[href='play.html']");
    await expect(link).toBeVisible();
  });

  test("mobile menu contains Parties link", async ({ page }) => {
    await page.locator("#mobile-menu-btn").click();
    const link = page.locator("#mobile-menu a[href='parties.html']");
    await expect(link).toBeVisible();
  });

  test("mobile menu contains Studio link", async ({ page }) => {
    await page.locator("#mobile-menu-btn").click();
    const link = page.locator("#mobile-menu a[href='studio.html']");
    await expect(link).toBeVisible();
  });

  test("mobile menu contains About link", async ({ page }) => {
    await page.locator("#mobile-menu-btn").click();
    const link = page.locator("#mobile-menu a[href='about.html']");
    await expect(link).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Footer links (shared across all pages)
// ---------------------------------------------------------------------------
test.describe("Footer links", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(tailwindStub);
    await page.goto(HOME);
  });

  test("footer links to play.html", async ({ page }) => {
    await expect(
      page.locator("footer a[href='play.html']").first()
    ).toBeVisible();
  });

  test("footer links to parties.html", async ({ page }) => {
    await expect(
      page.locator("footer a[href='parties.html']").first()
    ).toBeVisible();
  });

  test("footer links to studio.html", async ({ page }) => {
    await expect(
      page.locator("footer a[href='studio.html']").first()
    ).toBeVisible();
  });

  test("footer links to faq.html", async ({ page }) => {
    await expect(
      page.locator("footer a[href='faq.html']").first()
    ).toBeVisible();
  });

  test("footer has contact email link", async ({ page }) => {
    await expect(
      page
        .locator("footer a[href='mailto:kenchahouse@gmail.com']")
        .first()
    ).toBeVisible();
  });

  test("footer has Instagram link", async ({ page }) => {
    const ig = page
      .locator("footer a[href*='instagram.com/kenchahouse']")
      .first();
    await expect(ig).toBeVisible();
  });
});

