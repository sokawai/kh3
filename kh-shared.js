/* ========================================
   Kencha House — Shared Components
   Tailwind design tokens, nav & footer injection,
   and shared utilities used on every page.

   Load order in each HTML <head>:
     1. Google Fonts <link> tags
     2. <link rel="stylesheet" href="design-system.css">
     3. <script src="https://cdn.tailwindcss.com?plugins=forms,typography,container-queries">
     4. <script src="kh-shared.js">   ← this file
   ======================================== */

/* global tailwind */

// --------------------------------------------------
// Tailwind Design Tokens
// Mirrors the CSS custom properties in design-system.css
// --------------------------------------------------
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary:            "#8C7A6B", // Sophisticated taupe/brown
        "background-light": "#F9F7F2", // Warm creamy beige
        "background-dark":  "#1A1918", // Deep charcoal/earth
        accent:             "#E5DACE",
        sand:               "#F5F2ED",
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "serif"],
        sans:    ["'Inter'", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "4px",
        lg:      "12px",
      },
    },
  },
};

// --------------------------------------------------
// Shared Navigation
// --------------------------------------------------
const KH_NAV = '\
<nav class="sticky top-0 z-50 bg-background-light dark:bg-background-dark border-b border-stone-200 dark:border-stone-800 shadow-sm">\
  <div class="max-w-screen-xl mx-auto px-4 py-4 flex justify-between items-center">\
    <a href="index.html" class="flex-shrink-0">\
      <img src="https://raw.githubusercontent.com/sokawai/kh3/main/logo3.png" alt="Kencha House Logo" class="h-16 md:h-28 w-auto">\
    </a>\
    <button id="mobile-menu-btn" class="md:hidden p-2 text-stone-600 hover:text-primary transition-colors" onclick="toggleMobileMenu()">\
      <span class="material-symbols-outlined text-2xl">menu</span>\
    </button>\
    <div class="hidden md:flex items-center gap-4 md:gap-8 mx-auto px-4">\
      <a class="text-[12px] uppercase tracking-[0.2em] text-stone-600 hover:text-primary transition-colors" href="play.html">Play</a>\
      <a class="text-[12px] uppercase tracking-[0.2em] text-stone-600 hover:text-primary transition-colors" href="parties.html">Parties</a>\
      <a class="text-[12px] uppercase tracking-[0.2em] text-stone-600 hover:text-primary transition-colors" href="studio.html">Studio</a>\
      <a class="text-[12px] uppercase tracking-[0.2em] text-stone-600 hover:text-primary transition-colors" href="about.html">About</a>\
    </div>\
    <div class="hidden md:flex items-center gap-4 md:gap-6">\
      <button class="bg-primary text-white px-5 py-2 text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-opacity" onclick="window.location.href=\'https://kenchahouse.youcanbook.me/\'">\
        Visit Us\
      </button>\
    </div>\
  </div>\
  <div id="mobile-menu" class="hidden md:hidden bg-background-light dark:bg-background-dark border-t border-stone-200 dark:border-stone-800">\
    <div class="px-4 py-4 space-y-4">\
      <a class="block text-[11px] uppercase tracking-[0.15em] text-stone-600 hover:text-primary transition-colors" href="play.html">Play</a>\
      <a class="block text-[11px] uppercase tracking-[0.15em] text-stone-600 hover:text-primary transition-colors" href="parties.html">Parties</a>\
      <a class="block text-[11px] uppercase tracking-[0.15em] text-stone-600 hover:text-primary transition-colors" href="studio.html">Studio</a>\
      <a class="block text-[11px] uppercase tracking-[0.15em] text-stone-600 hover:text-primary transition-colors" href="about.html">About</a>\
      <button class="w-full bg-primary text-white px-3 py-2 text-[10px] uppercase tracking-[0.2em] hover:opacity-90 transition-opacity" onclick="window.location.href=\'https://kenchahouse.youcanbook.me/\'">\
        Visit Us\
      </button>\
    </div>\
  </div>\
</nav>';

// --------------------------------------------------
// Shared Footer
// --------------------------------------------------
const KH_FOOTER = '\
<footer class="bg-white dark:bg-background-dark pt-16 pb-8 px-6">\
  <div class="max-w-screen-xl mx-auto space-y-12">\
    <div class="grid grid-cols-1 md:grid-cols-4 gap-12">\
      <div>\
        <h3 class="text-2xl font-display uppercase tracking-widest mb-4">Kencha House</h3>\
        <p class="text-stone-500 dark:text-stone-400 text-sm leading-relaxed max-w-xs">A boutique play cafe for babies and toddlers.</p>\
      </div>\
      <div>\
        <h4 class="text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-6">Explore</h4>\
        <ul class="space-y-4 text-sm text-stone-600 dark:text-stone-300">\
          <li><a class="hover:text-primary transition-colors" href="play.html">Our Play Space</a></li>\
          <li><a class="hover:text-primary transition-colors" href="parties.html">Private Events</a></li>\
          <li><a class="hover:text-primary transition-colors" href="studio.html">Studio Rental</a></li>\
        </ul>\
      </div>\
      <div>\
        <h4 class="text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-6">Support</h4>\
        <ul class="space-y-4 text-sm text-stone-600 dark:text-stone-300">\
          <li><a class="hover:text-primary transition-colors" href="mailto:kenchahouse@gmail.com">Contact Us</a></li>\
          <li><a class="hover:text-primary transition-colors" href="faq.html">FAQ</a></li>\
          <li><a class="hover:text-primary transition-colors" href="https://form.jotform.com/260586396097270">Waivers</a></li>\
          <li><a class="hover:text-primary transition-colors" href="https://www.instagram.com/kenchahouse/" target="_blank">Instagram</a></li>\
        </ul>\
      </div>\
      <div>\
        <h4 class="text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-6">Visit</h4>\
        <p class="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">\
          222 Finch Ave W Suite 105,\
          North York, ON M2R 1M6<br/>\
          <a href="https://www.instagram.com/kenchahouse/" class="inline-block mt-4 text-stone-600 dark:text-stone-300 hover:text-primary transition-colors" target="_blank">@kenchahouse</a><br/>\
          <a href="mailto:kenchahouse@gmail.com" class="inline-block mt-2 text-sm text-stone-600 dark:text-stone-300">kenchahouse@gmail.com</a>\
        </p>\
      </div>\
    </div>\
    <div class="border-t border-stone-100 dark:border-stone-800 pt-12 text-center space-y-6">\
      <p class="text-[10px] text-stone-400 tracking-wider">&copy; 2026 Kencha House. All rights reserved.</p>\
      <div class="flex justify-center gap-8">\
        <a class="text-stone-400 hover:text-primary" href="https://www.instagram.com/kenchahouse/" target="_blank"><span class="material-symbols-outlined text-2xl">camera_alt</span></a>\
        <a class="text-stone-400 hover:text-primary" href="mailto:kenchahouse@gmail.com"><span class="material-symbols-outlined text-2xl">mail</span></a>\
      </div>\
    </div>\
  </div>\
</footer>';

// --------------------------------------------------
// Toggle mobile navigation menu
// --------------------------------------------------
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  menu.classList.toggle('hidden');
}

// --------------------------------------------------
// Inject nav (first) and footer (last) into <body>
// --------------------------------------------------
(function () {
  function injectSharedComponents() {
    const hasNav = Boolean(document.querySelector('nav.sticky.top-0.z-50'));
    const hasFooter = Boolean(document.querySelector('footer'));

    if (!hasNav) {
      document.body.insertAdjacentHTML('afterbegin', KH_NAV);
    }

    if (!hasFooter) {
      document.body.insertAdjacentHTML('beforeend', KH_FOOTER);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectSharedComponents);
  } else {
    injectSharedComponents();
  }
}());
