# Harpaviljongen Admin

Admin for [harpaviljongen.com](https://harpaviljongen.com), meant to run at **https://admin.harpaviljongen.com** (Cloudflare Pages).
It covers what the restaurant actually updates:

| Page | What it does |
| --- | --- |
| **Översikt** | Widgets you arrange yourself: *Besökare*, *Senaste ändringar*, *Menyer*, *Öppettider*, *Driftstatus*, *Sidor på hemsidan* and *Populära sidor*. **Anpassa** lets you add and remove widgets, make them small (¼), medium (½) or large (full width) and drag them around (or move them with the keyboard). The layout is saved on your account, so it follows you to other devices; **Återställ** goes back to the standard layout. On a 14" laptop four widgets fill the screen. |
| **Statistik** (`/statistik`) | Visits and page views for 7, 30 or 90 days: two numbers, visits/page views per day (chart or table), and the most visited pages, referrers, devices and countries. One number and one line: our own counting (no cookies) and Cloudflare's traffic data added together, when Cloudflare is connected in the API. Below that, **Nyhetsbrev**: subscribers now (with the change in green or red), the total day by day as one line like a stock chart (Totalt, the default) or new and cancelled subscriptions per day (Per dag), signups through the website's field and the latest newsletters sent with how many opened (from Get a Newsletter when `GETANEWSLETTER_API_TOKEN` is set in the API). |
| **Menyer** | *Meny*, *Vinlista* and your own menus in a switch at the top (click, drag the green thumb or use the arrow keys). **Ny meny** (top right) creates one, e.g. *Lunchmeny*; **Inställningar** renames it, chooses whether the website shows its button in the menu and/or on the homepage, or deletes it (not Meny/Vinlista). Upload PDFs (the dashed card first in the grid: click it or drop a PDF on it), preview, rename (pencil), choose which one the website links to, stop showing, delete. Only one per menu is active. |
| **Öppettider** | The whole week in one save. A switch per day for open/closed. |
| **Sidor** | Show or hide *Chambre séparée*, *Evenemang* and *Galleri*, separately in the navbar and as a button on the homepage. Hidden pages still open with a direct link. |
| **Startbild** (`/startbild`) | The photos at the top of the homepage. Upload several at once (button, the dashed card, or drop them anywhere on the page); photos over 3840 px are shrunk in the browser first. Each photo gets a quality score from 1 to 10 for how sharp it is on computers and phones (green *Bra*, yellow *Okej*, red *Dålig*). Switch *Visas* per photo, drag (mouse on the photo, finger or keyboard on the handle) to change the order; the first shown photo is marked *Visas först* (also *Visa först* in its menu). Click a photo to set the point that stays in view and see it on a computer and a phone with the dark filter and logo. **Visning**: slideshow on/off (off = only the first photo), time per photo 5–30 s, own or shuffled order (the first photo always first). Everything saves right away. Without shown photos the website uses its built-in photos. |
| **Logg** (`/logg`) | Every change, grouped by day, with filters for date (today, yesterday, 7/30 days, one day or a period), category and person. The filters are in the address, so a filtered view can be reloaded or bookmarked. Changes are kept for 1 year; admins can delete older ones sooner with **Rensa logg** (older than 30 days, 3 months, 6 months, 1 year, or everything). |
| **Användare** | Admins only. Add logins as *Personal* or *Admin* (**Ny användare** top right, or the **Lägg till användare** row at the bottom of the list), change the role, set a new password for someone who forgot theirs, delete *Personal*. You can't change or delete yourself. |
| **Min profil** (`/profil`) | Everyone. Profile picture (cropped to a square in the browser before upload), display name, username, password. Opened from your name at the bottom of the sidebar (on phones: your picture top right). |
| **Byt lösenord** | Also directly in that menu. Your other devices are logged out. |

On phones the bar at the bottom is liquid glass like iOS: Översikt (the house), Öppettider, Menyer, Startbild and **Mer**, which opens Statistik, Sidor, Logg and (for admins) Användare. The current page sits on a soft pill that slides to the next one. Slide a finger along the bar to move the pill and see the names; lift it to open that page. The glass bends the page at its edges in Chrome-based browsers and is frosted in Safari (so on every iPhone) and Firefox.

After every save a toast confirms it at the bottom (a red one if it failed). It closes by itself after a few seconds; swipe it down to close it sooner.

**Roles:** *Personal* (`employee`) can do everything above except **Användare**. *Admin* can do everything. The API enforces this; the admin just hides what you can't use.

The admin talks to the [Harpaviljongen API](https://github.com/DavidAkerlind/harpaviljongen-DB-API) on Render. Every change needs a login token from that API; reading is public.
The API has more endpoints (menu items, events, wine lists) that this admin deliberately doesn't show.

## Tech

React 19, Vite, MUI 7, React Router, Axios, dnd-kit (dragging widgets), Motion (animations). The charts are small SVG components (`components/charts`), no chart library. From [React Bits](https://reactbits.dev) (`components/reactbits`, JS-CSS variants, in the admin's colours): *SwipeToast* (the toasts, `Notifications.jsx`), *RubberSegment* (the switches on Menyer, Statistik and Startbild, via `Segment.jsx`) and *GlassSurface* (the liquid glass of the bar at the bottom on phones, `GlassTabBar.jsx`). Swedish UI, light theme in the restaurant's green. Works on phones (glass bar at the bottom) and desktop (sidebar).

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
  components/   AppLayout, GlassTabBar (phone bar), PageHeader, ConfirmDialog, Notifications (toasts), Segment,
                UserAvatar, PasswordDialog,
                reactbits/* (SwipeToast, RubberSegment, GlassSurface from React Bits),
                dashboard/* (widgets, registry.js = which widgets exist + layout), charts/*, menus/*,
                activity/*, pdf/*, users/*, hero/* (Startbild: photo cards, focus dialog, settings)
  pages/        OverviewPage, StatisticsPage, ActivityPage, MenusPage, OpeningHoursPage, PagesPage,
                HeroPage, UsersPage, ProfilePage, LoginPage
  utils/        format.js (dates, sizes, days), activity.js (change log texts), analytics.js (statistics),
                hero.js (Startbild: shrinking before upload, quality texts),
                image.js, user.js, sitePages.js
  theme.js      colours and MUI theme
```

---

🧑‍💻 Byggt av [David Åkerlind](https://github.com/DavidAkerlind)
