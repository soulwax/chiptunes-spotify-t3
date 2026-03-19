# Changelog

## 0.2.2 - 2026-03-19

### Fixed

- Switched playlist analysis to Spotify's current `/playlists/{id}/items` endpoint instead of the deprecated tracks path.
- Added explicit Spotify limitation handling so playlists the user cannot analyze now surface clear app errors instead of opaque upstream failures.
- Updated the dashboard to mark followed playlists from other owners as view-only when Spotify will not allow analysis for this app.

## 0.2.1 - 2026-03-19

### Fixed

- Switched Spotify sign-in initiation to BetterAuth's client-side OAuth flow so the provider state cookie is set correctly before redirecting to Spotify.
- Clarified Spotify callback URL requirements for Vercel production and local development origins.

## 0.2.0 - 2026-03-19

### Added

- Built Chipmap as a Spotify-authenticated game-music analysis app with landing, dashboard, and analysis routes.
- Added Spotify playlist fetching, playlist analysis, cached analysis storage, and JSON export.
- Added a Chipmap analysis engine for BPM, keys, chord palettes, clusters, drums, and era-based sound-design guidance.

### Changed

- Switched auth from the starter GitHub demo flow to Spotify OAuth with server-only Spotify access token handling.
- Replaced the starter demo UI with a dark-first Chipmap design system, theme support, and chart-driven analysis views.
- Added `BETTER_AUTH_URL` configuration so BetterAuth can generate stable callback URLs in development and production.
- Pinned production deployment metadata and auth docs to `https://chiptunes.darkfloor.org` for Vercel rollout.

### Removed

- Removed the starter post demo data model, router, and UI.
