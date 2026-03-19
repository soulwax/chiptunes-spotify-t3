# Chipmap

Chipmap is a full-stack Spotify playlist analyzer built on the T3 stack. It
lets anyone paste a public Spotify playlist URL, URI, or raw ID and turn that
playlist into a retro soundtrack starter pack for NES, SNES, and
Genesis-inspired composition.

## Stack

- Next.js 16 App Router
- tRPC v11
- Spotify Client Credentials API
- Drizzle ORM with PostgreSQL
- Tailwind CSS v4
- Recharts and shadcn-style UI primitives

## App Flow

1. Paste a public Spotify playlist URL, URI, or raw playlist ID.
2. Preview the playlist instantly with artwork, owner, and track count.
3. Import public playlist metadata and enrich the artist roster with public Spotify genre data.
4. Generate Chipmap analysis output:
   release timelines, genre fingerprints, soundtrack lenses, cue maps,
   track-role assignments, and starter-pack exports.

## Development

- `pnpm install`
- `pnpm db:push`
- `pnpm dev`
- `pnpm typecheck`
- `pnpm lint`

## Environment

- Production app URL: `https://chipmap.darkfloor.org`
- Required environment variables:
  - `SPOTIFY_CLIENT_ID`
  - `SPOTIFY_CLIENT_SECRET`
  - `DATABASE_URL`

## Public Playlist Limits

- Chipmap only supports public playlists.
- Chipmap fetches up to the first 500 tracks from a playlist.
- Local files and podcast episodes are filtered out before analysis.
- Cached analyses expire after 24 hours and are then rebuilt on demand.

## Analysis Outputs

- Canonical manifest with track, artist, album, release year, runtime, popularity, Spotify URL, and ISRC where available
- Release timeline and playlist overview metrics
- Genre fingerprint and soundtrack-era recommendations
- Cue map and track-role assignment for scenes like title screen, town, dungeon, boss, and credits
- Starter-pack exports as analysis JSON, manifest JSON, Markdown brief, and print-ready PDF brief
