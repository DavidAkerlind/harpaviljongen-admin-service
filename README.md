# Harpaviljongen Admin

Admin for [harpaviljongen.com](https://harpaviljongen.com), meant to run at **https://admin.harpaviljongen.com** (Cloudflare Pages).
It covers what the restaurant actually updates:

| Page | What it does |
| --- | --- |
| **Översikt** | Status of the website, API and database, plus what is live right now (menu, wine list, opening hours, visible pages). |
| **Menyer** | Upload the *Meny* and *Vinlista* as PDF, preview them, choose which one the website links to, stop showing, delete. All uploads are kept until deleted. Only one per list is active. |
| **Öppettider** | The whole week in one save. A switch per day for open/closed. |
| **Sidor** | Show or hide *Chambre séparée*, *Evenemang* and *Galleri*, separately in the navbar and as a button on the homepage. Hidden pages still open with a direct link. |

The admin talks to the [Harpaviljongen API](https://github.com/DavidAkerlind/harpaviljongen-DB-API) on Render. Every change needs a login token from that API; reading is public.
The API has more endpoints (menu items, events, wine lists) that this admin deliberately doesn't show.

## Tech

React 19, Vite, MUI 7, React Router, Axios. Swedish UI, light theme in the restaurant's green. Works on phones (bottom tab bar) and desktop (sidebar).

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

`public/_redirects` sends every path to `index.html` (normal URLs like `/menyer/vinlista` work on reload).
`public/_headers` and `robots.txt` keep the admin out of search engines.

Step-by-step, including the order to deploy API → admin → website, is in [docs/GO_LIVE.md](https://github.com/DavidAkerlind/harpaviljongen-DB-API/blob/main/docs/GO_LIVE.md) in the API repo.

## Structure

```
src/
  api/          client.js (axios + token), index.js (all API calls)
  auth/         AuthContext.jsx (login, logout, token check)
  components/   AppLayout, PageHeader, ConfirmDialog, Notifications, pdf/*
  pages/        OverviewPage, MenusPage, OpeningHoursPage, PagesPage, LoginPage
  utils/        format.js (dates, sizes, days), sitePages.js
  theme.js      colours and MUI theme
```

---

🧑‍💻 Byggt av [David Åkerlind](https://github.com/DavidAkerlind)
