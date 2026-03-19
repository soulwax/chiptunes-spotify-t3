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
