# Mobilix IdeasCaards — Web HTML Mockup Plan

## Context

Mobilix IdeasCaards is an existing mobile app for insurance agents. It lets them browse / personalise / share professionally designed insurance-themed **cards** and **videos** organised by life-stage and policy categories, plus an **Idea Bytes** news feed, a daily **Quiz** with leaderboard, and a **Profile / Subscriptions** module.

The team needs a **responsive web HTML mockup** of the entire app that mirrors the mobile app's modules, flows, content structure and behaviour. The mockup will later be ported to a React frontend, so the HTML must be component-driven and structured for a clean 1:1 conversion.

User-confirmed decisions:
- **CSS framework:** Tailwind CSS (loaded via CDN in mockups; React port will use the regular Tailwind build).
- **Componentisation:** Each reusable section lives in its own `components/*.html` partial; a tiny JS loader fetches and injects them into pages at runtime.
- **Scope:** All 15 screens identified from `app_screenshots/`.
- **Desktop layout:** Sidebar + content area on desktop/tablet; bottom nav on mobile.

## Folder structure (new)

```
mobilix/
├── app_screenshots/                  (existing reference)
├── web/                              ← all mockup output lives here
│   ├── index.html                    redirects to login.html
│   ├── pages/
│   │   ├── splash.html
│   │   ├── login.html
│   │   ├── signup.html
│   │   ├── forgot-password.html
│   │   ├── dashboard.html            (Home — Videos / Cards tabs)
│   │   ├── my-videos.html
│   │   ├── free-videos.html
│   │   ├── category.html             (Plan Based / Policy Explainer / etc.)
│   │   ├── subcategory.html          (Videos / Cards tabs inside a category)
│   │   ├── card-details.html
│   │   ├── video-details.html
│   │   ├── favourites.html
│   │   ├── bytes.html                (Idea Bytes list)
│   │   ├── byte-details.html
│   │   ├── quiz.html
│   │   ├── leaderboard.html
│   │   ├── profile.html
│   │   ├── account.html
│   │   ├── card-subscriptions.html
│   │   ├── video-subscriptions.html
│   │   └── certificates.html
│   ├── components/                   ← each = future React component
│   │   ├── sidebar.html              desktop primary nav
│   │   ├── bottom-nav.html           mobile primary nav
│   │   ├── topbar.html               page title + back button + profile chip
│   │   ├── auth-shell.html           branded blue panel + form area (login/signup/forgot)
│   │   ├── tab-switcher.html         Videos / Cards tab pair (also reused for language tabs)
│   │   ├── section-header.html       title + "View All" right-link
│   │   ├── card-thumbnail.html       card preview with FREE / crown / heart
│   │   ├── video-thumbnail.html      video preview with play / FREE / crown / heart
│   │   ├── category-tile.html        large image tile with overlaid label (Plan Based grid)
│   │   ├── byte-list-item.html       hero image + title + meta + excerpt
│   │   ├── stat-card.html            "37 / Total Credits Purchased"
│   │   ├── leaderboard-podium.html   top 3 with crown / medals
│   │   ├── leaderboard-row.html      single rank row
│   │   ├── settings-row.html         icon + title + subtitle row
│   │   ├── modal-personalise.html    placeholder personalisation modal
│   │   ├── button-primary.html       reference snippet for the brand gradient CTA
│   │   └── footer.html
│   ├── assets/
│   │   ├── css/
│   │   │   ├── tailwind.config.js    brand colours, fonts (referenced by CDN config)
│   │   │   └── overrides.css         only what Tailwind utilities can't express
│   │   ├── js/
│   │   │   ├── partials.js           runs on DOMContentLoaded; replaces every
│   │   │   │                         <div data-component="X"></div> with components/X.html
│   │   │   └── ui.js                 minimal interactivity: tab switching, mobile menu
│   │   │                             toggle, favourite toggle, modal open/close
│   │   └── img/                      logo.png + any extracted card/video thumbnails
│   └── README.md                     how to run + how each partial maps to a React component
```

Naming rule: every `components/*.html` filename = the future React component name in kebab-case (`card-thumbnail.html` → `<CardThumbnail />`). Each partial has a single root element with a stable `data-component` attribute so the React port is mechanical.

## Component approach

**Partial loader (`assets/js/partials.js`):**

```js
// Pseudocode
document.querySelectorAll('[data-component]').forEach(async el => {
  const name = el.dataset.component;
  const html = await fetch(`/web/components/${name}.html`).then(r => r.text());
  el.outerHTML = html;
});
```

Each page declares its layout like:

```html
<div data-component="sidebar"></div>
<main>
  <div data-component="topbar" data-title="My Videos"></div>
  ...
</main>
<div data-component="bottom-nav"></div>
```

Data attributes (`data-title`, `data-active`, etc.) carry per-instance props — these become React `props` at port time. A short note in `README.md` documents this contract.

**Why this works for React conversion:**
- 1 partial = 1 React component.
- Page files become page-level components (`pages/Dashboard.tsx`).
- `data-*` attributes → React props.
- Tailwind classes survive verbatim.

## Brand system (extracted from screenshots)

- **Primary blue:** gradient ~`#1E9BFF → #0A7FE8` (login button, headers, active tab).
- **Brand accent green:** ~`#1F7A3A` (logo "ideas" text).
- **Premium crown badge:** golden yellow.
- **FREE badge:** white pill with light blue text.
- **Background:** white surfaces with subtle grey card borders, generous rounding (`rounded-2xl`).
- **Typography:** clean sans-serif (Inter or system-ui), bold large titles, regular body.

Configure these in `tailwind.config.js` under `theme.extend.colors.brand` so the React port reuses the same tokens.

## Responsive breakpoints

- **Mobile (< 768px):** single column, sticky bottom-nav visible, sidebar hidden.
- **Tablet (768–1023px):** 2-column card grids, collapsed icon-only sidebar, bottom-nav hidden.
- **Desktop (≥ 1024px):** 3–4-column grids on listing pages, full sidebar with labels, max content width ~1280px centred.

## Per-screen content (what each page must render)

Numbered to match screenshot filenames in `app_screenshots/`:

1. **splash.html** — full-bleed blue gradient, centred MOBILIX + ideas Caards logo. Auto-redirects in JS after 1.2s.
2. **login.html** — `auth-shell` partial; email + password (with eye-toggle), Forgot Password link, Sign In gradient button, "New to Ideascaards? Join now" footer link.
3. **signup.html / forgot-password.html** — same `auth-shell`, different form fields.
4. **dashboard.html** — sidebar + topbar `Hi, David John 👋` greeting, sub-text "Explore our templates", `tab-switcher` (Videos active / Cards), featured-content carousel (large card stack with peeking neighbours), inline section "Videos" with two large tiles **My Videos** + **Free Videos**, then horizontal scroll rows: **Policy Explainer**, **Plan Based**, **Insurance Concepts**, **Seasonal Greetings**, **Festival Greetings**, **Event Greetings**, each with `section-header` + `View All`.
5. **my-videos.html** — back arrow + "My Videos", three `stat-card`s (Total Credits Purchased / Credits Used / Remaining Credits), 2-col grid of `video-thumbnail`s (premium = crown, otherwise FREE).
6. **free-videos.html** — back + title, 2-col grid of `video-thumbnail` (all FREE).
7. **category.html** — back + e.g. "Plan Based", 2-col grid of `category-tile`s (Retirement, Child Education, Children Marriage, Health, Endowment, Money Back, Joint Life, Women Insurance, Term Insurance). Reused for Insurance Concepts, Seasonal Greetings, Festival Greetings, Event Greetings, Policy Explainer.
8. **subcategory.html** — breadcrumb-style title "Plan Based > Retirement", `tab-switcher` Videos / Cards, 2-col grid of the matching thumbnail component.
9. **card-details.html** — breadcrumb title, language pill row (English / Hindi / Malayalam / Tamil / Gujarati …), full-bleed card preview, gradient **Personalise This Card** CTA pinned to bottom on mobile / inline on desktop.
10. **video-details.html** — same as card-details but with video player (poster image + play button), crown badge if premium, **Personalise This Video** CTA.
11. **favourites.html** — bottom-nav active = Favourites; sections Plan Based / Insurance Concepts / Seasonal Greetings / Festival Greetings / Event Greetings, each a horizontal row of saved tiles + View All.
12. **bytes.html** — title "Idea Bytes", vertical list of `byte-list-item` (hero image, brand avatar, title, "3 days ago", views/shares, excerpt).
13. **byte-details.html** — back + "Idea Bytes", hero image, title, meta row, full body, Read More / share actions.
14. **quiz.html** — title "Quiz" + Prizes & Rules link, blue countdown banner ("Quiz will begin at 06:00 PM, Starting in 2h 28m 54s"), Badges row (`Badges` title + View History link, 7 placeholder badge icons), Latest Winners date, podium of top 3 (crown on #1), then "Leaderboard" link → ranks 4–10 list.
15. **leaderboard.html** — full leaderboard list (reusing `leaderboard-row`).
16. **profile.html** — bottom-nav active = Profile; circular avatar, name, email, agent code, **Referral Code** with copy icon, **Expiry** with days-remaining, Certificates row (`You have 0 certificates` + View Certificates), then **General Settings**: My Account / Card Subscription Plans / Video Subscription Plans / (logout) — each a `settings-row` linking to the relevant sub-page.
17. **account.html / card-subscriptions.html / video-subscriptions.html / certificates.html** — straight-forward sub-pages reachable from Profile; standard form / list layouts using existing components.

## Critical files to create

- `web/index.html`
- `web/assets/js/partials.js` — partial loader.
- `web/assets/js/ui.js` — tab switch, mobile menu toggle, heart toggle, modal open/close, copy-to-clipboard for referral code.
- `web/assets/css/overrides.css` — small set of custom rules (e.g. card stack peek effect, gradient backgrounds Tailwind doesn't ship out of the box).
- `web/components/sidebar.html`, `bottom-nav.html`, `topbar.html`, `auth-shell.html`, `tab-switcher.html`, `section-header.html`, `card-thumbnail.html`, `video-thumbnail.html`, `category-tile.html`, `byte-list-item.html`, `stat-card.html`, `leaderboard-podium.html`, `leaderboard-row.html`, `settings-row.html`, `modal-personalise.html`, `footer.html`.
- 21 page files under `web/pages/`.
- `web/README.md` — how to run, partial-loader contract, brand tokens, mapping table from partial → React component.

## Verification

1. **Serve via XAMPP:** start Apache, open `http://localhost/git/mobilix/web/` — the loader needs HTTP (not `file://`) for `fetch()` to work.
2. **Visual parity check:** open each of the 15 screens side-by-side with its screenshot in `app_screenshots/`; layout, sections, badges, CTAs and bottom-nav active state should match.
3. **Component reuse check:** edit a single partial (e.g. `card-thumbnail.html`) — confirm every page that uses it updates.
4. **Responsive check:** in Chrome DevTools toggle device toolbar through 375px (mobile), 768px (tablet) and 1280px (desktop); confirm sidebar appears ≥1024px and bottom-nav appears <768px, grids reflow to 2 / 3 / 4 columns.
5. **Interactivity smoke test:** tab switching on Dashboard / Subcategory / Card Details, heart toggle on a thumbnail, mobile menu open/close, "Personalise" modal open/close, copy referral code on Profile.
6. **No inline styles audit:** grep `style="` across `web/` — should return zero results outside necessary background-image inline assignments on tiles.
