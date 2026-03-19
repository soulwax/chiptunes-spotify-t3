# Chipmap

Chipmap is a full-stack Spotify playlist analyzer built on the T3 stack. It
imports playlist metadata from Spotify and turns it into a canonical manifest
plus a retro soundtrack brief for NES, SNES, and Genesis-inspired composition.

## Stack

- Next.js 15 App Router
- tRPC v11
- BetterAuth with Spotify OAuth
- Drizzle ORM with PostgreSQL
- Tailwind CSS v4
- Recharts and shadcn-style UI primitives

## App Flow

1. Sign in with Spotify.
2. Pick a playlist from your library.
3. Import track, artist, album, release-year, popularity, duration, and ISRC metadata.
4. Generate Chipmap analysis output:
   canonical manifests, release timelines, genre fingerprints, cue maps, and
   era-matched soundtrack recommendations.

## Development

- `pnpm install`
- `pnpm db:push`
- `pnpm dev`
- `pnpm typecheck`
- `pnpm lint`

## Production Auth

- Production base URL: `https://chiptunes.darkfloor.org`
- Spotify redirect URI: `https://chiptunes.darkfloor.org/api/auth/callback/spotify`
- Set `BETTER_AUTH_URL=https://chiptunes.darkfloor.org` in Vercel production envs

## Local Spotify Auth

- Spotify callback URLs must match BetterAuth exactly, including path order.
- If you open the app at `http://localhost:3000`, register `http://localhost:3000/api/auth/callback/spotify`.
- If you open the app at `http://10.2.0.2:3000`, register `http://10.2.0.2:3000/api/auth/callback/spotify`.
- `http://.../api/auth/spotify/callback` is not a valid BetterAuth callback path.

## Spotify Playlist Limits

- Chipmap uses Spotify's current playlist items endpoint: `GET /playlists/{id}/items`.
- Chipmap now runs in metadata-first mode because Spotify blocks audio features for this app.
- In Spotify development-mode constraints, metadata import may only work for playlists you own or collaborate on.
- Followed playlists from other owners can still appear in the dashboard, but Chipmap marks them as view-only and does not send them into analysis.

## Metadata-First Outputs

- Canonical playlist manifest with track title, artists, album, release year, duration, popularity, Spotify URL, and ISRC where available
- Genre fingerprint from artist enrichment
- Release timeline and runtime profile
- Retro soundtrack lens and cue map for title screen, overworld, town, dungeon, boss, and credits
- Manifest and analysis JSON exports for later non-Spotify audio analysis
