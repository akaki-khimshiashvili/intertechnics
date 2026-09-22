# Intertechnics

Three sibling apps: `frontend/` (public storefront, Create React App), `backend-php/` (PHP API), `admin/` (Vite/React admin panel for managing the machine catalog).

## Running everything locally

**1. Backend API** (PHP + MySQL + nginx via Docker):

```
cd backend-php
docker compose up -d --build
docker compose exec php php database/migrate.php
docker compose exec php php database/create_admin.php   # seeds admin / admin123
```

API is now at http://localhost:8080. See `backend-php/README.md` for the full endpoint list and non-Docker setup.

**2. Admin panel** (Georgian-language machine management UI):

```
cd admin
npm install
npm run dev
```

Open http://localhost:5173, log in with `admin` / `admin123`. Update `admin/.env` (`VITE_API_URL`) if the API isn't on `localhost:8080`.

**3. Storefront**:

```
cd frontend
npm install
npm start
```

Open http://localhost:3000. Set `REACT_APP_API_URL` in `frontend/.env` if the API isn't on `localhost:8080`. The `/machines` page and homepage teaser fetch live data from the API (with a static fallback to the one hardcoded demo machine in the locale files if the API is unreachable, so the site still renders something without a backend). `npm run build` outputs to `frontend/build/`; `netlify.toml` at the repo root points Netlify at `frontend/` as the build base and `build/` as the publish directory.

## What's here

- **Machine catalog**: managed entirely through the admin panel — name, brand, category, model, year, condition, price (or "price negotiable"), engine/power/weight/capacity specs, an open-ended extra-specs list for anything category-specific, a main image, and a gallery. Only `name` is required; every spec field is nullable.
- **Search & filtering**: the public `/machines` page has live search plus brand/category/condition filters and price sorting, backed by `GET /machines` query params.
- **Images**: every upload (admin panel) is converted to WebP — compressed client-side in the browser, then re-encoded server-side via GD (the authoritative step) — and stored under `backend-php/public/uploads/`, same as the reference project.
- **SEO**: per-route meta tags (title/description/canonical/OG/Twitter) via `frontend/src/hooks/useDocumentMeta.js`, JSON-LD (`Organization` sitewide, `Product` on each machine detail page at `/machines/:slug`), `robots.txt` + `sitemap.xml`, and a fixed Netlify `_redirects` file (the previous `__redirects` had a typo'd filename Netlify never picked up). Note: this is a client-rendered SPA with no server-side rendering, so meta tags set via JS are only visible to crawlers that execute JavaScript (Googlebot does; not all bots do) — full SSR/prerendering would be a further step beyond this pass if needed.

See `frontend/README.md` for the stock Create React App script docs (`npm test`, `npm run eject`, etc).
