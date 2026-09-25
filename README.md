# Harpaviljongen Admin

Admin for [harpaviljongen.com](https://harpaviljongen.com), meant to run at **https://admin.harpaviljongen.com** (Cloudflare Pages).
It covers what the restaurant actually updates:

| Page | What it does |
| --- | --- |
| **Översikt** | Widgets you arrange yourself: *Besökare*, *Senaste ändringar*, *Menyer*, *Öppettider*, *Driftstatus*, *Sidor på hemsidan* and *Populära sidor*. **Anpassa** lets you add and remove widgets, make them small (¼), medium (½) or large (full width) and drag them around (or move them with the keyboard). The layout is saved on your account, so it follows you to other devices; **Återställ** goes back to the standard layout. On a 14" laptop four widgets fill the screen. |
| **Statistik** (`/statistik`) | Visits and page views for 7, 30 or 90 days: two numbers, visits/page views per day (chart or table), and the most visited pages, referrers and devices. Our own counting (no cookies) and Cloudflare Web Analytics side by side, when Cloudflare is connected in the API. |
| **Menyer** | *Meny*, *Vinlista* and your own menus as tabs. **Ny meny** (top right) creates one, e.g. *Lunchmeny*; **Inställningar** renames it, chooses whether the website shows its button in the menu and/or on the homepage, or deletes it (not Meny/Vinlista). Upload PDFs (the dashed card first in the grid: click it or drop a PDF on it), preview, rename (pencil), choose which one the website links to, stop showing, delete. Only one per menu is active. |
| **Öppettider** | The whole week in one save. A switch per day for open/closed. |
| **Sidor** | Show or hide *Chambre séparée*, *Evenemang* and *Galleri*, separately in the navbar and as a button on the homepage. Hidden pages still open with a direct link. |
| **Logg** (`/logg`) | Every change, grouped by day, with filters for date (today, yesterday, 7/30 days, one day or a period), category and person. The filters are in the address, so a filtered view can be reloaded or bookmarked. Changes are kept for 1 year; admins can delete older ones sooner with **Rensa logg** (older than 30 days, 3 months, 6 months, 1 year, or everything). |
| **Användare** | Admins only. Add logins as *Personal* or *Admin* (**Ny användare** top right, or the **Lägg till användare** row at the bottom of the list), change the role, set a new password for someone who forgot theirs, delete *Personal*. You can't change or delete yourself. |
| **Min profil** (`/profil`) | Everyone. Profile picture (cropped to a square in the browser before upload), display name, username, password. Opened from your name at the bottom of the sidebar (on phones: your picture top right). |
| **Byt lösenord** | Also directly in that menu. Your other devices are logged out. |

On phones the bottom bar has Översikt, Menyer, Öppettider and Sidor; **Mer** opens Statistik, Logg and (for admins) Användare.

**Roles:** *Personal* (`employee`) can do everything above except **Användare**. *Admin* can do everything. The API enforces this; the admin just hides what you can't use.

The admin talks to the [Harpaviljongen API](https://github.com/DavidAkerlind/harpaviljongen-DB-API) on Render. Every change needs a login token from that API; reading is public.
The API has more endpoints (menu items, events, wine lists) that this admin deliberately doesn't show.

## Tech

React 19, Vite, MUI 7, React Router, Axios, dnd-kit (dragging widgets). The charts are small SVG components (`components/charts`), no chart library. Swedish UI, light theme in the restaurant's green. Works on phones (bottom tab bar) and desktop (sidebar).

## Run locally

```bash
npm install
cp .env.example .env.local   # VITE_API_URL=http://localhost:7000/api
npm run dev                  # http://localhost:5174
```

Without `.env.local` the admin uses the **production** API, so changes affect the live website.

The full guide (local API with a test database, Postman, and the website side by side) is in the API repo: [docs/LOCAL_TESTING.md](https://github.com/DavidAkerlind/harpaviljongen-DB-API/blob/main/docs/LOCAL_TESTING.md).

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | `https://harpaviljongen-db-api.onrender.com/api` | API the admin uses |
| `VITE_SITE_URL` | `https://harpaviljongen.com` | Links to the website and the status check |

## Deploy (Cloudflare Pages)

| Setting | Value |
| --- | --- |
| Project name | `harpaviljongen-admin` |
| Production branch | `main` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Env variable | `NODE_VERSION=22` |
| Custom domain | `admin.harpaviljongen.com` |

`public/_redirects` sends every path to `index.html` (normal URLs like `/menyer/wine` work on reload; the old `/menyer/vinlista` and `/andringar` still redirect).
`public/_headers` and `robots.txt` keep the admin out of search engines.

Step-by-step, including the order to deploy API → admin → website, is in [docs/GO_LIVE.md](https://github.com/DavidAkerlind/harpaviljongen-DB-API/blob/main/docs/GO_LIVE.md) in the API repo.

## Structure

```
src/
  api/          client.js (axios + token), index.js (all API calls)
  auth/         AuthContext.jsx (login, logout, token check, isAdmin)
  menus/        MenuListsContext.jsx (the menus, shared by all pages)
  components/   AppLayout, PageHeader, ConfirmDialog, Notifications, UserAvatar, PasswordDialog,
                dashboard/* (widgets, registry.js = which widgets exist + layout), charts/*, menus/*,
                activity/*, pdf/*, users/*
  pages/        OverviewPage, StatisticsPage, ActivityPage, MenusPage, OpeningHoursPage, PagesPage,
                UsersPage, ProfilePage, LoginPage
  utils/        format.js (dates, sizes, days), activity.js (change log texts), analytics.js (statistics),
                image.js, user.js, sitePages.js
  theme.js      colours and MUI theme
```

---

🧑‍💻 Byggt av [David Åkerlind](https://github.com/DavidAkerlind)
