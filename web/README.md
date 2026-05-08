# Mobilix IdeasCaards — Web Mockup

Responsive HTML mockup of the Mobilix IdeasCaards mobile app, built so it can be ported to React with minimal mechanical work.

## Run it

The partial loader uses `fetch()`, so the mockup must be served over HTTP, not opened from the file system.

XAMPP is already in place — start Apache, then visit:

```
http://localhost/git/mobilix/web/
```

(For a quick check without XAMPP: `npx serve web` or `python -m http.server` from this folder also work.)

## How it's wired

- **Tailwind via Play CDN.** Brand tokens live in `assets/js/tailwind-config.js`. Every page loads the config first, then the CDN script.
- **`assets/js/partials.js`** turns `<div data-component="card-thumbnail" data-title="…"></div>` placeholders into the contents of `components/card-thumbnail.html`. `data-*` attributes substitute into `{{name}}` placeholders inside the partial. Recurses, so partials can include other partials.
- **`assets/js/ui.js`** runs after `partials:loaded` and wires up tabs, hearts, modals, the mobile menu, password-eye, language pills and copy-to-clipboard.
- **`assets/css/overrides.css`** holds the gradient, scroll-row, card-stack, and active-state styling that Tailwind utilities can't express cleanly.

## React port

The HTML is structured so each `components/*.html` file maps to one React component:

| Partial                    | React component   | Props (data-* attrs) |
| -------------------------- | ----------------- | -------------------- |
| `sidebar.html`             | `<Sidebar />`     | `active`             |
| `bottom-nav.html`          | `<BottomNav />`   | `active`             |
| `topbar.html`              | `<Topbar />`      | `title`, `back`      |
| `auth-shell.html`          | `<AuthShell />`   | `title`, `subtitle`  |
| `tab-switcher.html`        | `<TabSwitcher />` | `group`, `tabs`      |
| `section-header.html`      | `<SectionHeader/>`| `title`, `href`      |
| `card-thumbnail.html`      | `<CardThumbnail/>`| `title`, `image`, `premium`, `free` |
| `video-thumbnail.html`     | `<VideoThumbnail/>`| `title`, `image`, `premium`, `free` |
| `category-tile.html`       | `<CategoryTile/>` | `title`, `image`, `href` |
| `byte-list-item.html`      | `<ByteListItem/>` | `title`, `image`, `excerpt`, `time`, `views`, `shares` |
| `stat-card.html`           | `<StatCard />`    | `value`, `label`     |
| `leaderboard-podium.html`  | `<LeaderboardPodium/>`| `first`, `second`, `third` |
| `leaderboard-row.html`     | `<LeaderboardRow/>`| `rank`, `name`, `role`, `location`, `avatar` |
| `settings-row.html`        | `<SettingsRow/>`  | `title`, `subtitle`, `icon`, `href` |
| `modal-personalise.html`   | `<PersonaliseModal/>`| `id`, `kind` |
| `footer.html`              | `<Footer />`      | —                    |

Each page becomes a page-level React component (e.g. `pages/Dashboard.tsx`) and the page's body becomes its JSX. Tailwind classes carry over verbatim.

## Folder map

```
web/
├── index.html              redirects to pages/login.html
├── pages/                  one HTML file per screen
├── components/             one HTML file per reusable partial
└── assets/
    ├── css/overrides.css
    ├── js/{partials,ui,tailwind-config}.js
    └── img/logo.png
```
