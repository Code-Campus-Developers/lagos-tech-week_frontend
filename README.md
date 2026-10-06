# Lagos Tech Week frontend

A responsive black-and-white event announcement page built with React 19, Vite 8, and Tailwind CSS 4. Includes a sticky navbar, a layered bridge illustration with optional pointer tilt, and an email signup form.

This repository contains only the frontend. It builds and runs independently; a separate backend is required to save actual signups.

## Local development

Requires Node.js 22.13 or newer.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173. On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm`.

Vite forwards `/api` requests to http://127.0.0.1:3001 by default. Start your backend separately; it can be cloned anywhere. To use a different local API, copy `.env.example` to `.env` and set `API_PROXY_TARGET`.

## Deploy with a separate backend URL

1. Deploy the backend separately and obtain its HTTPS origin.
2. Set `VITE_API_BASE_URL` to that origin in the frontend hosting environment, for example `https://api.example.com`. Do not include `/api/subscribe`.
3. Configure the backend's `FRONTEND_ORIGINS` to allow the frontend's exact HTTPS origin.
4. Use `npm ci` to install dependencies, `npm run build` as the build command, and `dist` as the published directory.

Vite embeds `VITE_API_BASE_URL` at build time; rebuild after changing it. `VITE_` variables are public and must never contain secrets. GitHub repository URLs store code; hosting provides the website/API URLs.

`npm run preview` previews the production build locally. The frontend sends `POST /api/subscribe` with `{ "email": "you@example.com", "consent": true, "website": "" }`. The backend must return JSON and an error status when it cannot save a signup. No email delivery provider is connected yet.

## Checks

```sh
npm run build
npm run test:e2e
```

The default browser suite uses mocked API responses and needs no backend checkout. It checks responsive layout, navigation, the signup request and confirmation, and failure/retry behavior. On Windows it uses installed Google Chrome; on other systems first run `npx playwright install chromium`.

For an integration run against a separately running test backend, set `E2E_BACKEND_URL` to that backend's origin before running `npm run test:e2e`. This creates test signups, so use a disposable database rather than production. Example in PowerShell:

```powershell
$env:E2E_BACKEND_URL = 'http://127.0.0.1:3002'
npm.cmd run test:e2e
Remove-Item Env:E2E_BACKEND_URL
```

## Content

Edit `src/App.jsx` for page content and `src/styles.css` for presentation. Dates intentionally remain unannounced. Add confirmed organiser/contact details and review privacy copy before public launch.
