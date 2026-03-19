# Chipmap

Chipmap is a full-stack Spotify playlist analyzer built on the T3 stack. It
turns playlist tempo, energy, valence, keys, and rhythmic patterns into a
game-music starter pack for NES, SNES, and Genesis-inspired composition.

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
3. Fetch Spotify audio features for every analyzable track.
4. Generate Chipmap analysis output:
   tempo ranges, dominant keys with Camelot codes, chord palettes, drum
   patterns, cluster cues, and era-matched sound design references.

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
- In Spotify development-mode constraints, analysis may only work for playlists you own or collaborate on.
- Followed playlists from other owners can still appear in the dashboard, but Chipmap marks them as view-only and does not send them into analysis.
