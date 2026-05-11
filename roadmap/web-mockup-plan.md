# Mobilix IdeasCaards — Web HTML Mockup Plan

> **Note (updated):** the original plan (Apr 2026) targeted a sidebar +
> mobile-bottom-nav layout with 15 reference screens. After several rounds of
> iteration the mockup grew to ~30 pages and the navigation was reworked
> several times. This file has been refreshed to reflect the current
> structure. The code under `web/` is the source of truth — sections marked
> *"see code"* are not duplicated here so the document doesn't drift.

## Context

Mobilix IdeasCaards is an existing mobile app for insurance agents. It lets them browse / personalise / share professionally designed insurance-themed **cards** and **videos** organised by life-stage and policy categories, plus an **Idea Bytes** news feed, a daily **Quiz** with leaderboard, and a **Profile / Subscriptions** module.

The team needs a **responsive web HTML mockup** of the entire app that mirrors the mobile app's modules, flows, content structure and behaviour. The mockup will later be ported to a React frontend, so the HTML must be component-driven and structured for a clean 1:1 conversion.

User-confirmed decisions:
- **CSS framework:** Tailwind CSS (loaded via CDN in mockups; React port will use the regular Tailwind build).
- **Componentisation:** Each reusable section lives in its own `components/*.html` partial; a tiny JS loader fetches and injects them into pages at runtime.
- **Scope:** All screens identified from `app_screenshots/` plus settings sub-pages (~30 pages total — see `web/pages/`).
- **Desktop layout (current):** thin icon-only left sidebar (3.5 rem wide, transparent) that **expands to 12 rem on hover** to reveal labels. The mobile bottom-nav was retired during iteration; `bottom-nav.html` is kept as a no-op placeholder for backwards-compat with existing pages, and `with-sidebar` now adds left padding instead of bottom padding.

## Folder structure (current)

```
mobilix/
├── app_screenshots/                  reference screenshots from the mobile app
├── roadmap/
│   └── web-mockup-plan.md            this file
└── web/
    ├── index.html                    redirects to pages/login.html
    ├── README.md                     how to run + partial → React component map
    ├── pages/                        ~30 HTML files — see directory listing
    ├── components/                   reusable partials — each = one React component
    └── assets/
        ├── css/overrides.css         classes Tailwind utilities can't express
        ├── js/
        │   ├── partials.js           fetches components/*.html, fills {{name}} from data-*
        │   ├── ui.js                 tabs, hearts, modals, share dialog, carousel,
        │   │                         personalise loader, sidebar, mobile menu, copy
        │   └── tailwind-config.js    brand colours / Inter font for the Play CDN
        └── img/                      logo.png, certificate-placeholder.jpg,
                                      quiz-banner-bg.png, quiz-banner-icon.png, …
```

Naming rule (still holds): every `components/*.html` filename = the future React component name in kebab-case. Each partial has a single root element with a stable selector hook so the React port is mechanical.

## Pages (live list)

The active page set lives under `web/pages/` — see the directory itself for the
authoritative list. Current count: **31** files including:

- **Auth:** `login`, `signup` (iframes the external `onlineregistration` URL), `forgot-password`. *No splash screen — `index.html` redirects straight to `login`.*
- **Home / browse:** `dashboard`, `my-videos`, `free-videos`, `category`, `subcategory`, `card-details`, `video-details`, `personalised-card`, `personalised-video`.
- **Favourites / Bytes:** `favourites`, `bytes`, `byte-details`, `byte-details1` (alt layout).
- **Quiz family:** `quiz`, `leaderboard`, `quiz-history`, `quiz-history-detail`, `quiz-answer-distribution`.
- **Profile family:** `profile`, `account`, `my-profile`, `change-password`, `card-subscriptions`, `card-subscriptions-explore`, `video-subscriptions`, `certificates`, `wallet`, `refer-and-earn`, `about`.

## Components (live list — partial → React component)

| Partial                       | React component       | Notes |
| ----------------------------- | --------------------- | ----- |
| `sidebar.html`                | `<Sidebar />`         | Icon-only, expands on hover. Reads `data-active`. |
| `bottom-nav.html`             | `<BottomNav />`       | **Stub** (renders nothing). Kept so pages with `data-component="bottom-nav"` still work. |
| `topbar.html`                 | `<Topbar />`          | Title + back button. Each page inlines its own variant; this partial is a reference template. |
| `auth-shell.html`             | `<AuthShell />`       | Brand-blue panel + form column. Inlined per page in current build. |
| `tab-switcher.html`           | `<TabSwitcher />`     | Underline tabs. Segmented variant uses `.segmented` class wrapper instead. |
| `section-header.html`         | `<SectionHeader />`   | Title + View All link. |
| `card-thumbnail.html`         | `<CardThumbnail />`   | Sizes from `.scroll-row > *` / `.tile-grid > *`. |
| `video-thumbnail.html`        | `<VideoThumbnail />`  | Same sizing rules. |
| `category-tile.html`          | `<CategoryTile />`    | Same sizing rules. |
| `byte-list-item.html`         | `<ByteListItem />`    | Share count is now a `data-share` button. |
| `stat-card.html`              | `<StatCard />`        | |
| `leaderboard-podium.html`     | `<LeaderboardPodium/>`| Now includes `data-*-points`. |
| `leaderboard-row.html`        | `<LeaderboardRow />`  | Column layout: rank · avatar · name · ROLE · location · points. |
| `leaderboard-rank-row.html`   | `<LeaderboardRankRow/>`| **New.** Gradient gold/silver/bronze top-3 row used on This-Month / This-Year tabs. |
| `quiz-history-item.html`      | `<QuizHistoryItem />` | **New.** Question card with date + status. |
| `settings-row.html`           | `<SettingsRow />`     | Subtitle line auto-hides when empty. |
| `modal-personalise.html`      | `<PersonaliseModal />`| No longer used — Personalise button now triggers the loader directly. Kept as a reference. |
| `button-primary.html`         | `<ButtonPrimary />`   | Reference snippet. |
| `footer.html`                 | `<Footer />`          | Pinned to viewport bottom on short pages via flex-column wrapper. |

Components added during iteration: `leaderboard-rank-row`, `quiz-history-item`.

## Component approach (unchanged)

Partial loader (`assets/js/partials.js`) replaces every `<div data-component="X" data-foo="bar"></div>` placeholder with the contents of `components/X.html`, with `{{foo}}` placeholders filled from `data-*` attributes (kebab-case → camelCase via `dataset`). It recurses so partials can include other partials.

Pages declare layout like:

```html
<div data-component="sidebar" data-active="home"></div>
<main>…</main>
<div data-component="footer"></div>
```

Why this still works for React conversion:
- 1 partial = 1 React component.
- `data-*` attributes → React props.
- Tailwind classes survive verbatim.
- All interactivity is owned by `ui.js` and binds via `data-*` hooks (e.g. `data-tab`, `data-heart`, `data-share`, `data-personalise-go`, `data-carousel`, `data-pill`, `data-month-picker`).

## Brand system (current tokens)

- **Primary blue:** `#1E9BFF → #0A7FE8` (`.bg-brand-gradient` / `.bg-brand-gradient-r`).
- **Accent green:** `#1F7A3A`.
- **Premium crown badge:** `#F6B93B`.
- **FREE badge:** white pill, brand-blue text.
- **Background:** white surfaces with subtle slate borders, generous rounding (`rounded-2xl`).
- **Typography:** Inter via Google Fonts.

Notable known issue: the Tailwind Play CDN sometimes injects its own utilities AFTER `overrides.css`, so `bg-brand-blue` config-extended utility loses to same-specificity rules. Solution applied throughout: brand colours that absolutely must render are written either with `!important` in `overrides.css` (e.g. segmented-tab active state, month-picker active month) or as inline `style="background-color: #1e9bff;"` (e.g. the byte-details Share button, answer-distribution bars). React port avoids this entirely with the proper Tailwind build.

## Responsive layout

- **Mobile (<lg):** single column. Sidebar collapses to its 3.5 rem rail; tile grids fall back to wrap. Carousel uses smaller slide widths.
- **Desktop (≥lg):** sidebar shows full labels on hover; pages fill the content area with the new `tile-grid` (10rem → 17rem cell size matching scroll-rows). Footer is pinned to viewport bottom on short pages.

## Per-screen content

*See the actual files in `web/pages/`.* The original plan included a 15-item per-screen breakdown which has since drifted significantly (carousel design changed from card-stack to coverflow, bottom-nav removed, Profile gained 5 sub-pages, Quiz gained 3 sub-pages, signup became an iframe to the live registration URL, etc.). Maintaining a parallel description here would just decay; the HTML is short and self-explanatory.

## Notable interactions wired in `ui.js`

- `data-tabs` / `data-tab` / `data-tab-panel` — generic tab switcher (used as both underline tabs and as `.segmented` pill control).
- `data-heart` — favourite toggle.
- `data-modal` / `data-open-modal` / `data-close-modal` — generic modal.
- `data-mobile-menu-toggle` — sidebar slide-in (legacy; current sidebar is hover-driven instead).
- `data-copy` — copy-to-clipboard with "Copied!" feedback.
- `data-password-toggle` — password eye.
- `data-lang-group` / `data-lang` — language pill row.
- `data-pill-group` / `data-pill` — generic filter pill row (leaderboard).
- `data-month-picker` / `data-year-btn` / `data-year-options` / `data-month` / `data-fy` — month / year / FY pickers.
- `data-personalise-go` (+ optional `data-kind`) — shows transparent loader, navigates to `personalised-card.html` or `personalised-video.html` after 1.5 s.
- `data-share` (+ optional `data-share-title`, `data-share-url`) — opens a share dialog (WhatsApp / Facebook / Twitter / LinkedIn / Copy link).
- `.cover-carousel` / `.cover-slide` / `.cover-prev` / `.cover-next` — coverflow-style featured carousel with circular looping.
- `pageshow` (persisted) — shows brief loader on back-navigation from BFCache.

## Verification

1. **Serve via XAMPP:** start Apache, open `http://localhost/git/mobilix/web/` — the loader needs HTTP (not `file://`) for `fetch()` to work.
2. **Visual parity check:** open each page side-by-side with its screenshot in `app_screenshots/`; layout, sections, badges and CTAs should match.
3. **Component reuse check:** edit a single partial (e.g. `card-thumbnail.html`) — confirm every page that uses it updates.
4. **Responsive check:** Chrome DevTools device toolbar through 375 / 768 / 1280 px; sidebar should expand on hover ≥`lg`, tile grids reflow at each breakpoint.
5. **Interactivity smoke test:** tab switch on Dashboard / Subcategory / Card Details, heart toggle, share dialog (byte list + details), Personalise → loader → personalised page → back, leaderboard month/year pickers, sidebar hover-expand, copy referral code on Profile.
6. **No inline styles audit:** grep `style="` across `web/` — should return only:
   - `background-image: url(…)` on tiles / hero bands.
   - The brand-blue inline workarounds noted above (Share button, answer-distribution bars, etc.).
