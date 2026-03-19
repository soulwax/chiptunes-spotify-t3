# TODO

## Product roadmap

### 2-week MVP

1. Export Starter Pack v1
2. Track-to-Cue Assignment
3. Analysis polish

Success signal:
Users finish an analysis and keep or share the exported pack.

### 6-week beta

1. Game Scene Mapper
2. Constraint-Based Remix Mode
3. Shareable Analysis Pages
4. Light library features

Success signal:
People analyze multiple playlists, revisit old analyses, and share links.

### Stretch / wow features

1. Playable Preview
2. Tracker / DAW Export
3. Compare Two Playlists
4. Composer Copilot

## Backlog

### Frontend

- `FE-01 [P0]` Add an Export menu on `/analysis/[playlistId]` with actions for `JSON`, `Markdown Brief`, `PDF Brief`, and `MIDI Chords`.
- `FE-02 [P0]` Add a `Track Roles` section on the analysis page showing every track grouped by scene: `Title`, `Overworld`, `Town`, `Dungeon`, `Boss`, `Victory`, `Credits`.
- `FE-03 [P0]` Show a one-line reason per track assignment, for example `148 BPM, low valence, high energy -> Boss`.
- `FE-04 [P0]` Improve error states so Spotify limitations read clearly: `View-only playlist`, `Audio features unavailable`, `Token expired`.
- `FE-05 [P1]` Add a `Soundtrack Blueprint` section that summarizes the playlist as a full game soundtrack plan.
- `FE-06 [P1]` Add `Remix Mode` controls with presets like `More SNES`, `More Boss`, `More Exploration`, `Darker`.
- `FE-07 [P1]` Add a public share page for a cached analysis with a strong retro presentation.
- `FE-08 [P2]` Add a lightweight browser preview player for generated chip-style cue sketches.

### tRPC / backend

- `BE-01 [P0]` Add `spotify.exportAnalysis` procedure that returns a normalized export payload for JSON, Markdown, and PDF rendering.
- `BE-02 [P0]` Add `spotify.getTrackRoleAssignments` procedure that returns per-track scene labels plus explanation metadata.
- `BE-03 [P0]` Extend cached analysis payloads so role assignments and soundtrack blueprint data can be stored alongside the base analysis.
- `BE-04 [P0]` Add `spotify.exportMidiChords` procedure or server action that builds a simple MIDI file from the chosen chord palette.
- `BE-05 [P1]` Add `spotify.generateSoundtrackBlueprint` procedure returning named cues with BPM, key, progression, drum pattern, waveform, and source tracks.
- `BE-06 [P1]` Add `spotify.remixAnalysis` procedure that applies user constraints without refetching Spotify data when cached features already exist.
- `BE-07 [P1]` Add share-link support with a public cached-analysis lookup route and an allow-public flag.
- `BE-08 [P2]` Add preview rendering endpoints for short audio or note-sequence playback assets.

### Analysis engine

- `AN-01 [P0]` Implement `assignTrackRoles(tracks, features)` in `~/lib/analysis.ts`.
- `AN-02 [P0]` Define deterministic heuristics for scene mapping:
  - `Boss`: high energy, low valence, high BPM
  - `Dungeon`: low valence, lower energy, darker key bias
  - `Town`: low energy, high valence
  - `Overworld`: mid/high energy, bright valence
  - `Victory`: high valence, major bias
  - `Credits`: balanced mood, moderate tempo
- `AN-03 [P0]` Return explanation metadata per role assignment: matched rules, percentile placement, BPM bucket, key/mode.
- `AN-04 [P0]` Add `buildStarterPackBrief(analysis)` to create export-ready Markdown/PDF sections.
- `AN-05 [P1]` Implement `generateSoundtrackBlueprint(analysis, assignments)` to turn one playlist into a full cue list.
- `AN-06 [P1]` Implement `applyRemixConstraint(analysis, constraint)` so outputs can shift toward `SNES`, `Boss`, `Dark`, `Exploration`, and similar modes.
- `AN-07 [P2]` Add note-sequence generation for short previews from cue definitions.

## Recommended build order

1. `AN-01` to `AN-04`
2. `BE-01` to `BE-04`
3. `FE-01` to `FE-04`
4. `AN-05`, `BE-05`, `FE-05`
5. `AN-06`, `BE-06`, `FE-06`
6. `BE-07`, `FE-07`
7. `AN-07`, `BE-08`, `FE-08`

## Best first sprint

1. Ship `Track Roles`
2. Ship `Export Starter Pack v1`
3. Ship clearer Spotify limitation states

Goal:
Move Chipmap from analysis tool to a useful composition companion with a clear `analyze -> interpret -> export` loop.
