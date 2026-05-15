# TrustLayer Frontend — Architecture & Developer Guide

## Overview
This document explains the frontend architecture for the TrustLayer web client. It covers tech choices, project structure, core patterns, development and build commands, and deployment notes to help contributors get productive quickly.

## Tech Stack
- **Framework:** React (JSX, modern hooks)
- **Bundler:** Vite
- **Styling:** Tailwind CSS utility classes
- **Routing:** react-router-dom
- **Auth pattern:** ProtectedRoute wrapper + AuthContext
- **Package manager:** npm

## High-level Structure
- `src/` — main application source
  - `assets/` — static images and logos
  - `components/` — reusable UI components grouped by area
    - `common/` — Buttons, Inputs, Icons, small primitives
    - `Landing/` — landing page components and sections
    - `Dashboard/` — dashboard-specific layout and widgets
    - `Auth/` — `ProtectedRoute` and auth helpers
  - `context/` — React contexts (AuthContext)
  - `pages/` — top-level route views (Dashboard, Docs, Profile, Settings, etc.)
  - `api.js` — small client wrapper for backend calls
  - `main.jsx`, `App.jsx` — app entry and router registration
- `public/` — static assets served unchanged
- `index.html` — app HTML template

## Key Patterns & Conventions
- Components are small and composable; prefer prop-driven composition over heavy global state.
- Use `AuthContext` for authentication state and token management; `ProtectedRoute` redirects to `/login` when unauthenticated.
- API calls: centralized in `src/api.js` to keep auth header handling and base URL in one place.
- Styling: use Tailwind classes directly in JSX; prefer utility classes for responsiveness.
- File names: components use PascalCase; hooks and utilities use camelCase.

## Routing & Pages
- `App.jsx` defines public and protected routes. The `/docs` route is protected and uses the same layout as other dashboard pages.
- Landing pages (public) and dashboard pages (protected) use separate layouts; shared components (TopBar, Sidebar) are provided under `components/Dashboard/`.

## Authentication & Secrets
- The app uses a token-based auth flow held in `AuthContext`. Tokens are stored in memory and optionally localStorage depending on the AuthContext implementation.
- API key for server calls (for example `POST /v1/evaluate`) is a server-side secret and must never be embedded in client-side code. The dashboard provides UI to copy/regenerate keys for server-side integration.
- Squad secret entry is stored via the dashboard Profile page and used only server-side. The frontend only exposes the UI for entering/copying values (masked) — no secret should ever be present in client bundles.

## API Integration Notes
- The primary backend integration for platforms is `POST /v1/evaluate`. The frontend documentation page (`pages/DocsPage.jsx`) describes request/response shapes and how to use the `Authorization: Bearer <API_KEY>` header.
- For any webhook or callback flows, implement server-side endpoints; the frontend should only provide configuration UI to set callback URLs.

## Development
Install dependencies and run the dev server:

```bash
cd frontend
npm install
npm run dev
```

The dev server runs on Vite's default port (usually `5173`).

## Production Build
Create a production build:

```bash
cd frontend
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Linting & Formatting
- ESLint config is present at the repo root (see `eslint.config.js`).
- Follow project lint rules and run the editor's autoformat on save when available.

## Tests
- This frontend does not currently include a dedicated unit test harness in the repo snapshot. When adding tests, prefer React Testing Library and Vitest/Jest for components and behavior testing.

## Deployment
- The `dist/` output from Vite can be deployed to any static host or CDN (Netlify, Vercel, S3 + CloudFront, GitHub Pages). For server-driven hosting, serve the `index.html` fallback for client-side routing.

## Contributing
- Follow existing component patterns and naming conventions.
- Keep components small and add story-like examples where helpful.
- Open a PR with a clear description and a screenshot for UI changes.

## Files of Interest
- `src/App.jsx` — route definitions and layout selection
- `src/main.jsx` — app bootstrap
- `src/api.js` — API wrapper (auth header + base URL)
- `src/pages/DocsPage.jsx` — product integration docs for `/v1/evaluate`

---

If you want, I can also:
- Run a local `npm run build` and report the output.
- Add a brief `CONTRIBUTING.md` or a changelog/roadmap section.
