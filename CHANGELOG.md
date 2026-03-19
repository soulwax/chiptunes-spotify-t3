# Changelog

## 0.5.0 - 2026-03-19

### Added

- Added Starter Pack export actions for Analysis JSON, Manifest JSON, Markdown Brief, and PDF-style print export.
- Added a protected `spotify.exportAnalysis` procedure that returns a normalized export payload for metadata-first analyses.
- Added shared starter-pack brief generation so exports stay aligned across Markdown and print-ready HTML output.

### Changed

- Replaced the old two-button export header with a dedicated Export Starter Pack section on the analysis page.
- Updated the roadmap status to reflect that Export Starter Pack v1 is now shipped in metadata-first mode, with MIDI export still pending.

## 0.4.0 - 2026-03-19

### Added

- Added deterministic track-role assignment so every imported track is grouped into soundtrack scenes like Title Screen, Overworld, Town, Dungeon, Boss, Victory, or Credits.
- Added explanation strings, per-track metadata badges, and direct Spotify links in the new Track Roles section.
- Extended the metadata-first soundtrack map with a dedicated Victory cue.

### Changed

- Reworked the analysis view from cue examples only into a full grouped scene map for the whole playlist.
- Updated the roadmap status to reflect that Track-to-Cue Assignment is now shipped in metadata-first mode.

## 0.3.0 - 2026-03-19

### Changed

- Pivoted Chipmap from blocked Spotify audio-feature analysis to a metadata-first soundtrack brief mode.
- Reworked playlist analysis to import canonical manifests with track, artist, album, release-year, popularity, runtime, Spotify URL, and ISRC data.
- Replaced the old BPM/key-centric analysis page with release timelines, genre fingerprints, cue maps, soundtrack-lens recommendations, and manifest export.

### Fixed

- Kept the existing playlist picker and cache flow working while routing new analyses through Spotify-supported metadata endpoints.
- Added artist-genre enrichment fallback handling so manifest imports still succeed even if Spotify omits some artist metadata.

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
