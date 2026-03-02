# Kencha House — Design System

A guide to the visual language, tokens, and components used across the Kencha House website.

---

## Architecture

The design system is built on two shared files that are included in the `<head>` of every page:

| File | Purpose |
|---|---|
| `design-system.css` | CSS custom properties (design tokens) and base styles |
| `kh-shared.js` | Tailwind config, shared nav & footer injection, `toggleMobileMenu()` |

### Load order in each page `<head>`

```html
<!-- 1. Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet"/>

<!-- 2. Design System CSS (tokens + base styles) -->
<link rel="stylesheet" href="design-system.css"/>

<!-- 3. Tailwind CDN -->
<script src="https://cdn.tailwindcss.com?plugins=forms,typography,container-queries"></script>

<!-- 4. Shared components (Tailwind config, nav, footer) -->
<script src="kh-shared.js"></script>
```

---

## Design Tokens

Tokens are defined as CSS custom properties in `design-system.css` **and** mirrored in the Tailwind config inside `kh-shared.js` so they are available both in plain CSS (`var(--color-primary)`) and as Tailwind utility classes (`text-primary`, `bg-background-light`, etc.).

### Colors

| Token | CSS variable | Tailwind class suffix | Hex value | Usage |
|---|---|---|---|---|
| Primary | `--color-primary` | `primary` | `#8C7A6B` | Buttons, accents, hover states |
| Background Light | `--color-background-light` | `background-light` | `#F9F7F2` | Page background (light mode) |
| Background Dark | `--color-background-dark` | `background-dark` | `#1A1918` | Page background (dark mode) |
| Accent | `--color-accent` | `accent` | `#E5DACE` | Section backgrounds, subtle highlights |
| Sand | `--color-sand` | `sand` | `#F5F2ED` | Hero / header background tint |

**Usage examples:**

```html
<!-- Tailwind utility class -->
<button class="bg-primary text-white hover:opacity-90">Book Now</button>
<div class="bg-background-light dark:bg-background-dark">...</div>

<!-- Plain CSS -->
<style>
  .custom-element { color: var(--color-primary); }
</style>
```

### Typography

| Token | CSS variable | Tailwind `font-` key | Value |
|---|---|---|---|
| Display / Serif | `--font-display` | `display` | `'Cormorant Garamond', serif` |
| Body / Sans | `--font-sans` | `sans` | `'Inter', sans-serif` |

Headings (`h1`–`h4`) and elements with the `.serif-quote` class automatically use the display font via the base styles in `design-system.css`.

**Usage examples:**

```html
<h1 class="text-5xl">A Calm Space</h1>           <!-- automatically serif -->
<p class="font-display italic text-2xl">Quote</p> <!-- explicit serif -->
<p class="font-sans text-sm">Body copy</p>        <!-- explicit sans -->
```

### Border Radius

| Token | CSS variable | Tailwind key | Value |
|---|---|---|---|
| Default | `--radius` | `DEFAULT` (e.g. `rounded`) | `4px` |
| Large | `--radius-lg` | `lg` (e.g. `rounded-lg`) | `12px` |

### Spacing

Standard Tailwind spacing scale is used throughout (no overrides). Key conventions:

- Section vertical padding: `py-16` to `py-24`
- Max content width: `max-w-screen-xl mx-auto`
- Horizontal page padding: `px-4` or `px-6`

---

## Components

### Button — Primary

```html
<button class="bg-primary text-white px-8 py-4 uppercase text-[10px] tracking-[0.2em] hover:opacity-90 transition-opacity">
  Book a Session
</button>
```

### Button — Ghost / Outline

```html
<button class="border border-stone-300 dark:border-stone-700 py-4 uppercase text-[10px] tracking-[0.2em] hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors">
  Learn More
</button>
```

### Button — Inline Text Link

```html
<a class="inline-block border-b border-stone-400 text-stone-600 pb-1 text-[10px] tracking-[0.2em] uppercase hover:text-stone-900 transition-colors" href="#">
  Read More
</a>
```

### Card (Feature Icon)

```html
<div class="text-center">
  <div class="mb-6 inline-flex items-center justify-center w-20 h-20 bg-[#E8E1D9] dark:bg-stone-800 rounded-full">
    <span class="material-symbols-outlined text-3xl text-stone-600">child_care</span>
  </div>
  <h3 class="text-3xl mb-4">Drop-In Play</h3>
  <p class="text-stone-500 dark:text-stone-400 text-sm leading-relaxed max-w-md mx-auto">Description text.</p>
</div>
```

### Form Input

```html
<input
  class="w-full bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 px-6 py-4 text-sm focus:ring-primary focus:border-primary placeholder:text-stone-400"
  type="email"
  placeholder="Email Address"
  required
/>
```

### Component: Feature Label (small h4)

For small inline labels used alongside body text (e.g. feature item titles at `text-sm`), override the default `h4` serif rule with `font-sans`:

```html
<h4 class="font-sans font-medium text-sm mb-1">Feature Title</h4>
```

> **Why**: The design system sets all `h4` elements to `Cormorant Garamond` by default for display headings. At `text-sm` (14 px), the serif display font is too subtle and looks inconsistent with surrounding body text. `font-sans` explicitly restores `Inter` for label-style sub-headings.

---



```html
<div class="h-px w-24 bg-stone-300 mx-auto"></div>
```

### Eyebrow Label

```html
<p class="uppercase tracking-[0.3em] text-[10px] text-stone-500">Our Story</p>
```

---

## Shared Layout Components

The navigation and footer are defined once in `kh-shared.js` and injected automatically as the first and last children of `<body>` on every page. **Do not add nav or footer HTML directly to individual pages.**

To update the nav or footer, edit the `KH_NAV` or `KH_FOOTER` string in `kh-shared.js`.

---

## Dark Mode

Dark mode is controlled by the `dark` class on `<html>`. All components use Tailwind's `dark:` variant. The page `<body>` tag includes:

```html
<body class="bg-background-light dark:bg-background-dark text-stone-800 dark:text-stone-200 transition-colors duration-300">
```

---

## Adding a New Page

1. Copy the `<head>` block from an existing page (e.g. `about.html`).
2. Update `<title>` and any page-specific meta tags.
3. Add `<link rel="stylesheet" href="design-system.css"/>` and `<script src="kh-shared.js"></script>` after the Tailwind CDN script.
4. Write only the page's unique content inside `<body>` — nav and footer are injected automatically.
5. For page-specific styles, add a `<style>` block after `kh-shared.js`.

---

## Adding or Changing a Token

1. Update the CSS custom property in `design-system.css` under `:root { }`.
2. Update the corresponding value in the `tailwind.config` object inside `kh-shared.js`.
3. Update this documentation.
