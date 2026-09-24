# Intertechnics storefront

Public site, built with [Vite](https://vite.dev) and React.

## Scripts

- `npm run dev` — dev server at http://localhost:3000
- `npm run build` — production build into `build/` (what Netlify publishes)
- `npm run preview` — serve the production build locally
- `npm run lint` — lint with [oxlint](https://oxc.rs) (config in `.oxlintrc.json`)

## Configuration

Copy `.env.example` to `.env` and set `VITE_API_URL` if the API isn't on `http://localhost:8080`. Only variables prefixed with `VITE_` reach the browser code, via `import.meta.env`.

## Imports

Folders under `src/` can be imported without relative paths, e.g. `import Footer from "components/Footer"`. The aliases are defined in `vite.config.js` (for the build) and mirrored in `jsconfig.json` (for the editor); add a new top-level `src/` folder to both.
