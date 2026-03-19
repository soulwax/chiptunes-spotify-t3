# chipmap — Game Music Analyzer

## Stack

- Next.js 15, App Router, TypeScript
- tRPC v11 (server + client in `src/trpc/`)
- BetterAuth for Spotify OAuth
- Drizzle ORM + Postgres (prod)
- Tailwind CSS v3 + shadcn/ui

## Auth

- Spotify OAuth via BetterAuth, scopes: `playlist-read-private`, `user-read-private`
- Session token includes `accessToken` (Spotify) for API calls

## Key conventions

- All server logic goes through tRPC routers in `src/server/api/routers/`
- Spotify API calls use the session `accessToken` — never hardcode credentials
- Use Drizzle schema in `src/server/db/schema.ts`
- Tailwind utility classes only, no CSS modules
- Dark mode class strategy via `next-themes`

## What this app does

1. User logs in with Spotify
2. Picks a playlist from their library
3. App fetches audio features (BPM, key, energy, valence, danceability) for every track
4. Analysis engine clusters tracks and maps them to 8-bit/16-bit game music contexts
5. Outputs a "Game Music Starter Pack" — tempo targets, key palette, drum patterns, chord suggestions per game context
