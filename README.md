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
3. Run audio-feature analysis through Spotify's Client Credentials flow.
4. Generate Chipmap analysis output:
   median BPM and mood stats, BPM distribution, cluster map, chord palette,
   drum pattern suggestions, sound-design references, and JSON export.

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

- Median tempo, energy, valence, danceability, and acousticness
- BPM bucket classification and distribution chart
- Key histogram with Camelot wheel labels
- Energy × valence cluster map with cue and waveform suggestions
- Chord palette recommendations
- Drum pattern suggestion with 16-step grid
- Era-specific sound design reference
- JSON export of the full `ChipmapAnalysis`
