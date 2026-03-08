"use strict";

/**
 * Unit tests for kh-shared.js
 *
 * kh-shared.js is designed to run in a browser.  These tests load it into a
 * jsdom environment (provided by jest-environment-jsdom) and verify:
 *   1. toggleMobileMenu() toggles the 'hidden' class on the mobile menu.
 *   2. injectSharedComponents() inserts a <nav> and a <footer> into an empty body.
 *   3. injectSharedComponents() does NOT duplicate nav / footer if they are
 *      already present.
 *   4. The injected nav contains the four primary page links.
 *   5. The injected footer contains the expected contact / navigate links.
 */

const fs = require("fs");
const path = require("path");

// kh-shared.js references `tailwind.config`, so stub tailwind before loading.
global.tailwind = { config: {} };

const khSharedSrc = fs.readFileSync(
  path.resolve(__dirname, "../../kh-shared.js"),
  "utf-8"
);

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
function resetDOM() {
  // Reset document to a minimal body before each test so injections don't
  // accumulate across tests.
  document.documentElement.innerHTML = "<head></head><body></body>";
}

function loadKhShared() {
  // eslint-disable-next-line no-eval
  // global.eval runs in the jsdom global scope, so function declarations
  // (like toggleMobileMenu) become available as window properties.
  global.eval(khSharedSrc);
}

// ---------------------------------------------------------------------------
// toggleMobileMenu
// ---------------------------------------------------------------------------
describe("toggleMobileMenu", () => {
  beforeEach(resetDOM);

  test("removes 'hidden' class when mobile menu starts hidden", () => {
    document.body.innerHTML =
      '<div id="mobile-menu" class="hidden"></div>';
    loadKhShared();
    window.toggleMobileMenu();
    expect(
      document.getElementById("mobile-menu").classList.contains("hidden")
    ).toBe(false);
  });

  test("adds 'hidden' class when mobile menu starts visible", () => {
    document.body.innerHTML = '<div id="mobile-menu"></div>';
    loadKhShared();
    window.toggleMobileMenu();
    expect(
      document.getElementById("mobile-menu").classList.contains("hidden")
    ).toBe(true);
  });

  test("toggles back to visible on a second call", () => {
    document.body.innerHTML =
      '<div id="mobile-menu" class="hidden"></div>';
    loadKhShared();
    window.toggleMobileMenu();
    window.toggleMobileMenu();
    expect(
      document.getElementById("mobile-menu").classList.contains("hidden")
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// injectSharedComponents – nav injection
// ---------------------------------------------------------------------------
describe("injectSharedComponents – nav", () => {
  beforeEach(resetDOM);

  test("inserts a sticky nav element when none is present", () => {
    loadKhShared();
    expect(document.querySelector("nav.sticky.top-0.z-50")).not.toBeNull();
  });

  test("does not insert a second nav when one already exists", () => {
    document.body.innerHTML =
      '<nav class="sticky top-0 z-50"></nav>';
    loadKhShared();
    expect(document.querySelectorAll("nav.sticky.top-0.z-50")).toHaveLength(1);
  });

  test("nav contains a link to play.html", () => {
    loadKhShared();
    const links = Array.from(document.querySelectorAll("nav a"));
    expect(links.some((a) => a.getAttribute("href") === "play.html")).toBe(true);
  });

  test("nav contains a link to parties.html", () => {
    loadKhShared();
    const links = Array.from(document.querySelectorAll("nav a"));
    expect(links.some((a) => a.getAttribute("href") === "parties.html")).toBe(
      true
    );
  });

  test("nav contains a link to studio.html", () => {
    loadKhShared();
    const links = Array.from(document.querySelectorAll("nav a"));
    expect(links.some((a) => a.getAttribute("href") === "studio.html")).toBe(
      true
    );
  });

  test("nav contains a link to about.html", () => {
    loadKhShared();
    const links = Array.from(document.querySelectorAll("nav a"));
    expect(links.some((a) => a.getAttribute("href") === "about.html")).toBe(
      true
    );
  });

  test("nav contains a link back to index.html (logo)", () => {
    loadKhShared();
    const links = Array.from(document.querySelectorAll("nav a"));
    expect(links.some((a) => a.getAttribute("href") === "index.html")).toBe(
      true
    );
  });
});

// ---------------------------------------------------------------------------
// injectSharedComponents – footer injection
// ---------------------------------------------------------------------------
describe("injectSharedComponents – footer", () => {
  beforeEach(resetDOM);

  test("inserts a footer element when none is present", () => {
    loadKhShared();
    expect(document.querySelector("footer")).not.toBeNull();
  });

  test("does not insert a second footer when one already exists", () => {
    document.body.innerHTML = "<footer></footer>";
    loadKhShared();
    expect(document.querySelectorAll("footer")).toHaveLength(1);
  });

  test("footer contains a link to play.html", () => {
    loadKhShared();
    const links = Array.from(document.querySelectorAll("footer a"));
    expect(links.some((a) => a.getAttribute("href") === "play.html")).toBe(true);
  });

  test("footer contains a link to parties.html", () => {
    loadKhShared();
    const links = Array.from(document.querySelectorAll("footer a"));
    expect(links.some((a) => a.getAttribute("href") === "parties.html")).toBe(
      true
    );
  });

  test("footer contains a link to faq.html", () => {
    loadKhShared();
    const links = Array.from(document.querySelectorAll("footer a"));
    expect(links.some((a) => a.getAttribute("href") === "faq.html")).toBe(true);
  });

  test("footer contains a mailto link for kenchahouse@gmail.com", () => {
    loadKhShared();
    const links = Array.from(document.querySelectorAll("footer a"));
    expect(
      links.some((a) =>
        a.getAttribute("href") === "mailto:kenchahouse@gmail.com"
      )
    ).toBe(true);
  });

  test("footer contains the Instagram link", () => {
    loadKhShared();
    const links = Array.from(document.querySelectorAll("footer a"));
    expect(
      links.some((a) =>
        (a.getAttribute("href") || "").includes("instagram.com/kenchahouse")
      )
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Component order – nav before footer in the DOM
// ---------------------------------------------------------------------------
describe("DOM component order", () => {
  beforeEach(resetDOM);

  test("nav appears before footer in the document", () => {
    loadKhShared();
    const nav = document.querySelector("nav.sticky.top-0.z-50");
    const footer = document.querySelector("footer");
    expect(nav).not.toBeNull();
    expect(footer).not.toBeNull();
    // nav.compareDocumentPosition(footer): if DOCUMENT_POSITION_FOLLOWING is set,
    // footer comes after nav in the document — i.e. nav is first.
    const footerFollowsNav = !!(
      nav.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(footerFollowsNav).toBe(true);
  });
});
