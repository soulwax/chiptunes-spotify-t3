# Changelog

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
