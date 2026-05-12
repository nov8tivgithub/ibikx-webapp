# Mobilix IdeasCaards — React port

React + Vite version of the `web/` HTML mockup. The original `web/` folder is untouched.

## Stack
- Vite + React 18 (JS, no TypeScript)
- React Router v6 (BrowserRouter)
- Tailwind CSS (installed locally — no CDN)
- Custom CSS in `src/index.css` (ported from `web/assets/css/overrides.css`)
- Axios + crypto-js for the API layer, react-hot-toast for notifications

## Run
```bash
cp .env.example .env       # then fill in VITE_API_URL / VITE_API_KEY / VITE_API_SECRET
npm install
npm run dev                # → http://localhost:5173
npm run build
npm run preview
```

## API layer

The API layer mirrors the `MakeAxiosRequest` pattern from
`maxine-customer-app-react/src/utils/handler.js` — a single function used by
every service, with SHA-256 request signing, an `apiInfo` request envelope,
and auto-logout on `status==-1` / `status==-3` / HTTP `403`.

### Environment variables (Vite)
| Var | Purpose |
| --- | --- |
| `VITE_API_URL`    | Where axios actually sends requests. In dev: `/api` (routed through the Vite proxy). In prod: full backend URL. |
| `VITE_API_TARGET` | Dev-only — full backend URL. Vite proxies `/api/*` to it, and the SHA-256 `appsignature` is computed against it (so the server sees the URL it expects). |
| `VITE_API_KEY`    | `appid` header value |
| `VITE_API_SECRET` | Secret used to compute the SHA-256 `appsignature` |

Vars are read in `src/config/env.js`. Don't commit `.env` — copy from
`.env.example` and fill in real values locally.

### CORS / dev proxy
Backends that require custom headers (`appid`, `appsignature`, `accesstoken`)
often haven't whitelisted them in their `Access-Control-Allow-Headers` response,
so the browser blocks the cross-origin POST even after the OPTIONS preflight
passes. To sidestep this in development without server changes, leave
`VITE_API_URL=/api` and set `VITE_API_TARGET` to the real backend — the proxy
config in `vite.config.js` forwards `/api/*` from the dev server to the
backend, so the browser sees same-origin traffic and never sends a preflight.

The signature is still computed against `VITE_API_TARGET + url` (see
`src/config/env.js` → `signingBaseUrl`), so the backend still recognises it.

In production either:
- Set `VITE_API_URL` to the public backend URL directly (no proxy used), **and**
  make sure the server's `Access-Control-Allow-Headers` includes `appid,
  appsignature, accesstoken`, or
- Reverse-proxy `/api/*` to the backend from the same origin that serves the
  built app (e.g. nginx / Apache).

### Files
```
src/
  config/env.js            # reads import.meta.env.VITE_*
  api/
    client.js              # configured axios instance (baseURL)
    signature.js           # SHA-256 appsignature helper
    request.js             # MakeAxiosRequest — call this for JSON endpoints
    upload.js              # MakeFileUpload — multipart/form-data variant
  services/                # one file per module — auth/catalog/bytes/quiz/profile
  hooks/
    useApi.js              # { data, loading, error, run, reset } wrapper
    useApiOnMount.js       # useApi + auto-run on mount
  utils/
    token.js               # getToken / setAuth / getUser / clearAuth / isAuthed
    notify.js              # toast wrappers (success/error/info/warn)
```

### Adding a new endpoint
1. Add a function to the relevant `src/services/<module>.service.js`:
   ```js
   export const getThingService = (id, signal) =>
     MakeAxiosRequest('post', '/thing', { id }, signal);
   ```
2. Call it from a page via `useApi`:
   ```js
   const { data, loading, error, run } = useApi(getThingService);
   useEffect(() => { run(thingId); }, [thingId]);
   ```
3. The service resolves with `{ status, data, message }`. The hook automatically
   exposes `data` on `status===1` and `error` otherwise. No try/catch needed.

### Auth flow
- `loginService(email, password)` is wired in `src/pages/auth/Login.jsx`.
- On success the response is handed to `useAuth().login(payload)` which
  persists the token + user (via `utils/token.js`) and updates the
  `AuthContext` so the rest of the app re-renders with the new auth state.
- If any subsequent request returns `status===-1` / `status===-3` / HTTP `403`,
  `MakeAxiosRequest` clears the stored token and does
  `window.location.href = '/login'` automatically. Pass `skipAutoLogout = true`
  (5th positional arg) if a specific call should not trigger the redirect.

### Auth context & route guards
- `src/context/AuthContext.jsx` exposes `{ user, token, isAuthenticated,
  login, logout, refreshUser }` via the `useAuth()` hook. State is hydrated
  from `localStorage` on mount and stays in sync across tabs via the `storage`
  event.
- `src/components/common/ProtectedRoute.jsx` wraps the authed route group:
  bounces to `/login` and remembers the attempted path via `location.state.from`
  so the user lands back where they started after sign-in.
- `src/components/common/PublicRoute.jsx` wraps `/login`, `/signup`,
  `/forgot-password` — if already signed in, sends the user to `/dashboard`.
- The route table in `src/App.jsx` is organised into two layout routes:
  ```jsx
  <Route element={<PublicRoute />}>    {/* /login, /signup, /forgot-password */}
  <Route element={<ProtectedRoute />}> {/* everything else */}
  ```
- The Logout button on `/profile` calls `useAuth().logout()` then navigates
  to `/login`.

## Routes
| Path | Page |
| --- | --- |
| `/login` | Login |
| `/signup` | Signup (iframe) |
| `/forgot-password` | Forgot Password |
| `/dashboard` | Dashboard (Videos / Cards carousel + category scroll-rows) |
| `/favourites` | Favourites |
| `/category?cat=` | Category View-All grid |
| `/subcategory?cat=&sub=` | Subcategory (Videos / Cards tabs) |
| `/free-videos`, `/my-videos` | Free / My Videos grids |
| `/video-details`, `/card-details` | Detail pages with language picker + personalise CTA |
| `/personalised-video`, `/personalised-card` | Personalised preview pages |
| `/bytes`, `/byte-details` | Idea Bytes list + detail |
| `/quiz`, `/quiz-history`, `/quiz-history-detail`, `/quiz-answer-distribution` | Quiz flow |
| `/leaderboard` | Leaderboard (Latest / This Month / This Year tabs) |
| `/profile` | Profile |
| `/account`, `/my-profile`, `/change-password` | Account settings |
| `/about`, `/certificates`, `/refer-and-earn`, `/wallet` | Misc profile pages |
| `/card-subscriptions`, `/card-subscriptions-explore`, `/video-subscriptions` | Subscription plans |

`*` → redirects to `/dashboard`.

## Project layout

Pages and components are organised into modules. Each module is a feature
boundary (auth, home, bytes, quiz, profile); the `common` and `layout`
component buckets hold widgets that any module can use.

```
src/
  main.jsx            # ReactDOM render + BrowserRouter
  App.jsx             # route table (imports each module's pages)
  index.css           # Tailwind directives + custom CSS

  components/
    layout/           # app shell — used by every authed page
      Layout.jsx      # Sidebar + Topbar + main + Footer wrapper
      Sidebar.jsx
      Topbar.jsx
      Footer.jsx
    common/           # cross-module widgets
      CoverCarousel.jsx
      ScrollRow.jsx
      SettingsRow.jsx
      LanguagePills.jsx
      Loader.jsx
      StatCard.jsx
    catalog/          # used by home module
      CategoryTile.jsx
      VideoThumbnail.jsx
      CardThumbnail.jsx
    bytes/            # used by bytes module
      ByteListItem.jsx
    quiz/             # used by quiz module
      QuizHistoryItem.jsx
      LeaderboardPodium.jsx
      LeaderboardRow.jsx
      LeaderboardRankRow.jsx

  pages/
    auth/             Login, Signup, ForgotPassword
    home/             Dashboard, Favourites, Category, Subcategory,
                      FreeVideos, MyVideos, VideoDetails, CardDetails,
                      PersonalisedCard, PersonalisedVideo
    bytes/            Bytes, ByteDetails
    quiz/             Quiz, QuizHistory, QuizHistoryDetail,
                      QuizAnswerDistribution, Leaderboard
    profile/          Profile, Account, MyProfile, ChangePassword,
                      About, Certificates, ReferAndEarn, Wallet,
                      CardSubscriptions, CardSubscriptionsExplore,
                      VideoSubscriptions

  data/
    categories.js     # CATEGORIES table shared by home + Favourites

public/
  assets/img/         # copied from web/assets/img/
```

### Adding a new page
1. Drop the file under `src/pages/<module>/<Name>.jsx`.
2. Register the route in `src/App.jsx` with an import from `./pages/<module>/<Name>`.
3. If the page needs a shared widget, pull it from `components/common/` or `components/layout/`. If it's tightly coupled to one module, add it under `components/<module>/`.

## Notes
- The original `partials.js` runtime templating system is replaced by importing components directly.
- Vanilla `ui.js` bindings (tabs, hearts, carousels, modals, drag-to-scroll) are split into hooks/state inside the components that need them.
- Image `onError` handlers still hide broken Unsplash URLs the same way the HTML version did.
- The carousel and scroll rows preserve the original responsive behavior — extra side cards on `xl`/`2xl` viewports plus mouse drag.
- Hooks that simulate the old "show a loader, then navigate" flow (used for the personalise CTAs) are in `src/components/Loader.jsx` and triggered locally inside `CardDetails` / `VideoDetails`.

## Not ported
- `byte-details1.html` — alternative layout variant, content identical to `byte-details`.
- The original month / year picker modals on Leaderboard — buttons render but launching the modals isn't wired (the dropdowns are static labels in this pass).
- Floating share dialog from `ui.js`'s `openShareDialog`. Replace by hooking your own modal if needed.
