import { type ChipmapAnalysis as LegacyChipmapAnalysis } from "~/lib/analysis";

export type ChipmapEra = "NES" | "SNES" | "Genesis";
export type ChipmapTrackRoleId =
  | "title-screen"
  | "overworld"
  | "town"
  | "dungeon"
  | "boss"
  | "victory"
  | "credits";

export interface ChipmapArtistInput {
  spotifyId: string | null;
  name: string;
}

export interface ChipmapTrackInput {
  spotifyId: string;
  name: string;
  artists: ChipmapArtistInput[];
  album: {
    spotifyId: string | null;
    imageUrl: string | null;
    name: string;
    releaseDate: string | null;
    releaseYear: number | null;
  };
  durationMs: number;
  explicit: boolean;
  isrc: string | null;
  popularity: number | null;
  spotifyUrl: string | null;
}

export interface ChipmapArtistGenreInput {
  genres: string[];
  name: string;
  spotifyId: string;
}

export interface ChipmapManifestTrack {
  spotifyId: string;
  title: string;
  artists: Array<{
    genres: string[];
    name: string;
    spotifyId: string | null;
  }>;
  albumName: string;
  albumSpotifyId: string | null;
  albumImageUrl: string | null;
  releaseDate: string | null;
  releaseYear: number | null;
  durationMs: number;
  explicit: boolean;
  isrc: string | null;
  popularity: number | null;
  spotifyUrl: string | null;
  genres: string[];
}

export interface ChipmapPlaylistManifest {
  importedAt: string;
  playlistId: string;
  playlistName: string;
  trackCount: number;
  tracks: ChipmapManifestTrack[];
}

export interface ChipmapSummaryMetric {
  median: number;
  p25: number;
  p75: number;
}

export interface ChipmapOverview {
  averageTrackDurationMs: number;
  explicitRatio: number;
  isrcCoverageRatio: number;
  totalRuntimeMs: number;
  uniqueAlbumCount: number;
  uniqueArtistCount: number;
}

export interface ChipmapGenreEntry {
  count: number;
  genre: string;
  share: number;
}

export interface ChipmapReleaseBucket {
  count: number;
  isMedianBucket: boolean;
  label: string;
}

export interface ChipmapReleaseProfile {
  distribution: ChipmapReleaseBucket[];
  earliestYear: number | null;
  latestYear: number | null;
  medianYear: number | null;
}

export interface ChipmapSoundtrackProfile {
  description: string;
  reasons: string[];
  title: string;
}

export interface ChipmapCueCard {
  description: string;
  id: ChipmapTrackRoleId;
  instrumentation: string;
  rationale: string;
  sourceTracks: string[];
  title: string;
}

export interface ChipmapTrackRoleAssignment {
  artists: string[];
  durationMs: number;
  explanation: string;
  genres: string[];
  isrc: string | null;
  popularity: number | null;
  releaseYear: number | null;
  spotifyId: string;
  spotifyUrl: string | null;
  title: string;
}

export interface ChipmapTrackRoleGroup {
  description: string;
  id: ChipmapTrackRoleId;
  title: string;
  trackCount: number;
  tracks: ChipmapTrackRoleAssignment[];
}

export interface ChipmapMetadataAnalysis {
  analysisMode: "metadata-first";
  cueMap: ChipmapCueCard[];
  era: ChipmapEra;
  genres: ChipmapGenreEntry[];
  manifest: ChipmapPlaylistManifest;
  nextSteps: string[];
  overview: ChipmapOverview;
  popularity: ChipmapSummaryMetric;
  releaseProfile: ChipmapReleaseProfile;
  soundtrackProfile: ChipmapSoundtrackProfile;
  trackCount: number;
  trackLength: ChipmapSummaryMetric;
  trackRoles: ChipmapTrackRoleGroup[];
}

export type ChipmapAnalysis = LegacyChipmapAnalysis | ChipmapMetadataAnalysis;

export interface ChipmapStarterPackBriefSection {
  body: string[];
  title: string;
}

export interface ChipmapStarterPackBrief {
  html: string;
  markdown: string;
  sections: ChipmapStarterPackBriefSection[];
}

type EraScore = {
  era: ChipmapEra;
  reasons: string[];
  score: number;
};

type CueDefinition = {
  boostExplicit?: boolean;
  description: string;
  durationTargetMs: number;
  id: ChipmapTrackRoleId;
  keywords: string[];
  popularityBias: "high" | "low" | "mid";
  title: string;
};

const ERA_DESCRIPTIONS: Record<
  ChipmapEra,
  { description: string; title: string }
> = {
  NES: {
    title: "Punchy Pixel Cart",
    description:
      "This playlist reads as concise, hook-forward, and direct, which points to a leaner 8-bit scoring style.",
  },
  SNES: {
    title: "Quest Cartridge",
    description:
      "The metadata leans cinematic, reflective, or spacious enough to feel at home in a richer 16-bit adventure score.",
  },
  Genesis: {
    title: "Arcade Voltage Pack",
    description:
      "The track mix skews more synthetic, modern, or high-impact, which translates well to a brighter FM-flavored score.",
  },
};

const ERA_SIGNAL_KEYWORDS: Record<ChipmapEra, string[]> = {
  NES: [
    "8-bit",
    "bitpop",
    "chiptune",
    "garage rock",
    "indie rock",
    "new wave",
    "power pop",
    "punk",
    "surf rock",
  ],
  SNES: [
    "ambient",
    "cinematic",
    "dream pop",
    "folk",
    "indie folk",
    "neo-classical",
    "orchestral",
    "post-rock",
    "shoegaze",
    "soundtrack",
  ],
  Genesis: [
    "dance",
    "drum and bass",
    "edm",
    "electronic",
    "electro",
    "house",
    "hyperpop",
    "industrial",
    "synthpop",
    "synthwave",
    "techno",
  ],
};

const CUE_DEFINITIONS: CueDefinition[] = [
  {
    id: "title-screen",
    title: "Title Screen",
    description: "Open with a concise hook that teaches the palette fast.",
    durationTargetMs: 200_000,
    keywords: ["chiptune", "indie pop", "new wave", "synthpop", "dream pop"],
    popularityBias: "high",
  },
  {
    id: "overworld",
    title: "Overworld",
    description: "Use the playlist's clearest travel energy for your main route cue.",
    durationTargetMs: 225_000,
    keywords: ["electronic", "folk", "indie rock", "pop", "synthwave"],
    popularityBias: "mid",
  },
  {
    id: "town",
    title: "Town",
    description: "Pull the gentler side of the playlist into a welcoming loop.",
    durationTargetMs: 210_000,
    keywords: ["acoustic", "bedroom pop", "folk", "indie folk", "lo-fi"],
    popularityBias: "low",
  },
  {
    id: "dungeon",
    title: "Dungeon",
    description: "Mine the darker metadata signals for tension and uncertainty.",
    durationTargetMs: 260_000,
    keywords: ["ambient", "darkwave", "industrial", "metal", "post-rock", "trip hop"],
    popularityBias: "low",
  },
  {
    id: "boss",
    title: "Boss",
    description: "Pick the sharpest and most forceful metadata signals for peak conflict.",
    durationTargetMs: 235_000,
    keywords: ["drum and bass", "electro", "hardcore", "metal", "punk", "techno"],
    popularityBias: "high",
    boostExplicit: true,
  },
  {
    id: "victory",
    title: "Victory",
    description: "Find the playlist's most triumphant, high-clarity metadata signals for the win fanfare.",
    durationTargetMs: 190_000,
    keywords: ["dance", "indie pop", "new wave", "power pop", "synthpop"],
    popularityBias: "high",
  },
  {
    id: "credits",
    title: "Credits",
    description: "Close on the broadest, most reflective slice of the playlist.",
    durationTargetMs: 275_000,
    keywords: ["ambient", "cinematic", "dream pop", "orchestral", "soundtrack"],
    popularityBias: "mid",
  },
];

const CUE_INSTRUMENTATION: Record<
  ChipmapEra,
  Record<string, string>
> = {
  NES: {
    "title-screen": "25% pulse lead, triangle bass, tight arpeggios",
    overworld: "50% pulse harmony, pulse lead, triangle bass walk",
    town: "50% pulse pad, triangle bass, sparse pulse countermelody",
    dungeon: "triangle drone, 12.5% pulse stabs, low-register ostinato",
    boss: "12.5% pulse bite, triangle bass drive, urgent noise bursts",
    victory: "Bright pulse fanfare, triangle bass lift, fast arpeggio flourish",
    credits: "25% pulse melody, soft triangle floor, wider arpeggio spacing",
  },
  SNES: {
    "title-screen": "BRR pluck lead, warm strings, rounded sampled bass",
    overworld: "BRR strings, flute accents, warm bass and light percussion",
    town: "BRR flute, soft keys, gentle brushed percussion",
    dungeon: "Warm pad, low strings, distant metallic hits",
    boss: "Layered strings, punchy toms, sharper sampled brass stabs",
    victory: "Bright brass hit, strings swell, bell-like sampled accent",
    credits: "Wide strings, bell-like plucks, slow moving sampled choir",
  },
  Genesis: {
    "title-screen": "FM brass lead, electric piano support, punchy bass",
    overworld: "FM brass hook, glass pad bed, syncopated FM bass",
    town: "FM electric piano, glass pad, soft FM bass pulses",
    dungeon: "FM growl bass, glass pad haze, metallic bell accents",
    boss: "FM brass stabs, growl bass, aggressive gated percussion",
    victory: "FM brass fanfare, electric piano lift, bright octave bass",
    credits: "Glass pad, electric piano, sustained FM lead resolution",
  },
};

export function analyzePlaylistMetadata(args: {
  artistGenres: Map<string, ChipmapArtistGenreInput>;
  playlistId: string;
  playlistName: string;
  tracks: ChipmapTrackInput[];
}): ChipmapMetadataAnalysis {
  const manifestTracks = args.tracks.map((track) =>
    createManifestTrack(track, args.artistGenres),
  );
  const trackCount = manifestTracks.length;

  if (trackCount === 0) {
    throw new Error("Playlist has no usable track metadata.");
  }

  const releaseYears = manifestTracks
    .map((track) => track.releaseYear)
    .filter((year): year is number => typeof year === "number");
  const popularityValues = manifestTracks
    .map((track) => track.popularity)
    .filter((value): value is number => typeof value === "number");
  const trackLengths = manifestTracks.map((track) => track.durationMs);
  const topGenres = buildGenreHistogram(manifestTracks);
  const eraSelection = classifyEra({
    explicitRatio: ratio(
      manifestTracks.filter((track) => track.explicit).length,
      trackCount,
    ),
    medianYear: releaseYears.length > 0 ? percentile(releaseYears, 0.5) : null,
    topGenres,
    trackLengths,
  });

  return {
    analysisMode: "metadata-first",
    cueMap: buildCueMap(manifestTracks, eraSelection.era),
    era: eraSelection.era,
    genres: topGenres,
    manifest: {
      importedAt: new Date().toISOString(),
      playlistId: args.playlistId,
      playlistName: args.playlistName,
      trackCount,
      tracks: manifestTracks,
    },
    nextSteps: buildNextSteps(args.playlistName),
    overview: {
      averageTrackDurationMs: Math.round(
        trackLengths.reduce((sum, value) => sum + value, 0) / trackCount,
      ),
      explicitRatio: ratio(
        manifestTracks.filter((track) => track.explicit).length,
        trackCount,
      ),
      isrcCoverageRatio: ratio(
        manifestTracks.filter((track) => Boolean(track.isrc)).length,
        trackCount,
      ),
      totalRuntimeMs: trackLengths.reduce((sum, value) => sum + value, 0),
      uniqueAlbumCount: new Set(
        manifestTracks.map((track) => track.albumSpotifyId ?? track.albumName),
      ).size,
      uniqueArtistCount: new Set(
        manifestTracks.flatMap((track) =>
          track.artists.map((artist) => artist.spotifyId ?? artist.name),
        ),
      ).size,
    },
    popularity: summarizeMetric(
      popularityValues.length > 0 ? popularityValues : [0],
      0,
    ),
    releaseProfile: buildReleaseProfile(releaseYears),
    soundtrackProfile: {
      title: ERA_DESCRIPTIONS[eraSelection.era].title,
      description: ERA_DESCRIPTIONS[eraSelection.era].description,
      reasons: eraSelection.reasons,
    },
    trackCount,
    trackLength: summarizeMetric(trackLengths, 0),
    trackRoles: buildTrackRoles(manifestTracks),
  };
}

export function isMetadataAnalysis(
  analysis: ChipmapAnalysis,
): analysis is ChipmapMetadataAnalysis {
  return (
    typeof analysis === "object" &&
    analysis !== null &&
    "analysisMode" in analysis &&
    analysis.analysisMode === "metadata-first"
  );
}

export function buildStarterPackBrief(args: {
  analysis: ChipmapMetadataAnalysis;
  playlistName: string;
}) {
  const { analysis, playlistName } = args;
  const sections: ChipmapStarterPackBriefSection[] = [
    {
      title: "Chipmap Summary",
      body: [
        `Playlist: ${playlistName}`,
        `Era lens: ${analysis.era}`,
        `Tracks: ${analysis.trackCount}`,
        `Runtime: ${formatDuration(analysis.overview.totalRuntimeMs)}`,
        `Artists / Albums: ${analysis.overview.uniqueArtistCount} artists across ${analysis.overview.uniqueAlbumCount} albums`,
      ],
    },
    {
      title: "Metadata Overview",
      body: [
        `Median track length: ${formatDuration(analysis.trackLength.median)}`,
        `Median popularity: ${analysis.popularity.median}`,
        `Median release year: ${analysis.releaseProfile.medianYear ?? "Unknown"}`,
        `Explicit ratio: ${formatPercent(analysis.overview.explicitRatio)}`,
        `ISRC coverage: ${formatPercent(analysis.overview.isrcCoverageRatio)}`,
      ],
    },
    {
      title: "Genre Fingerprint",
      body:
        analysis.genres.length > 0
          ? analysis.genres.map(
              (genre) =>
                `${genre.genre}: ${genre.count} tracks (${formatPercent(genre.share)})`,
            )
          : ["No artist genre data was available for this playlist."],
    },
    {
      title: "Soundtrack Lens",
      body: [
        analysis.soundtrackProfile.title,
        analysis.soundtrackProfile.description,
        ...analysis.soundtrackProfile.reasons,
      ],
    },
    {
      title: "Cue Map",
      body: analysis.cueMap.flatMap((cue) => [
        `${cue.title}: ${cue.description}`,
        `Instrumentation: ${cue.instrumentation}`,
        `Rationale: ${cue.rationale}`,
        `Source tracks: ${cue.sourceTracks.join(", ") || "None"}`,
      ]),
    },
    {
      title: "Track Roles",
      body: analysis.trackRoles.flatMap((role) => {
        if (role.tracks.length === 0) {
          return [`${role.title}: no assigned tracks`];
        }

        return [
          `${role.title}: ${role.trackCount} tracks`,
          ...role.tracks.map(
            (track) =>
              `${track.title} by ${track.artists.join(", ")} | ${track.explanation}`,
          ),
        ];
      }),
    },
    {
      title: "Next Steps",
      body: analysis.nextSteps,
    },
  ];

  return {
    html: buildBriefHtml(playlistName, sections),
    markdown: buildBriefMarkdown(playlistName, sections),
    sections,
  } satisfies ChipmapStarterPackBrief;
}

function createManifestTrack(
  track: ChipmapTrackInput,
  artistGenres: Map<string, ChipmapArtistGenreInput>,
): ChipmapManifestTrack {
  const artists = track.artists.map((artist) => ({
    genres:
      artist.spotifyId && artistGenres.has(artist.spotifyId)
        ? artistGenres.get(artist.spotifyId)?.genres ?? []
        : [],
    name: artist.name,
    spotifyId: artist.spotifyId,
  }));

  return {
    spotifyId: track.spotifyId,
    title: track.name,
    artists,
    albumName: track.album.name,
    albumSpotifyId: track.album.spotifyId,
    albumImageUrl: track.album.imageUrl,
    releaseDate: track.album.releaseDate,
    releaseYear: track.album.releaseYear,
    durationMs: track.durationMs,
    explicit: track.explicit,
    genres: [...new Set(artists.flatMap((artist) => artist.genres))],
    isrc: track.isrc,
    popularity: track.popularity,
    spotifyUrl: track.spotifyUrl,
  };
}

function buildGenreHistogram(tracks: ChipmapManifestTrack[]) {
  const genreCounts = new Map<string, number>();

  for (const track of tracks) {
    const uniqueGenres = [...new Set(track.genres.map(normalizeGenre))];

    for (const genre of uniqueGenres) {
      genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1);
    }
  }

  return [...genreCounts.entries()]
    .map(([genre, count]) => ({
      count,
      genre,
      share: roundTo(ratio(count, tracks.length), 3),
    }))
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }
      return left.genre.localeCompare(right.genre);
    })
    .slice(0, 8);
}

function classifyEra(args: {
  explicitRatio: number;
  medianYear: number | null;
  topGenres: ChipmapGenreEntry[];
  trackLengths: number[];
}) {
  const scores: Record<ChipmapEra, EraScore> = {
    NES: { era: "NES", reasons: [], score: 0 },
    SNES: { era: "SNES", reasons: [], score: 0 },
    Genesis: { era: "Genesis", reasons: [], score: 0 },
  };

  for (const [era, keywords] of Object.entries(ERA_SIGNAL_KEYWORDS) as Array<
    [ChipmapEra, string[]]
  >) {
    for (const genre of args.topGenres) {
      if (keywords.some((keyword) => genre.genre.includes(keyword))) {
        scores[era].score += genre.count * 2;
      }
    }
  }

  if (typeof args.medianYear === "number") {
    if (args.medianYear <= 2001) {
      scores.NES.score += 3;
      scores.NES.reasons.push(
        `Median release year leans older at ${Math.round(args.medianYear)}.`,
      );
    } else if (args.medianYear <= 2014) {
      scores.SNES.score += 3;
      scores.SNES.reasons.push(
        `Median release year lands in the mid-era sweet spot at ${Math.round(args.medianYear)}.`,
      );
    } else {
      scores.Genesis.score += 2;
      scores.Genesis.reasons.push(
        `Median release year is relatively modern at ${Math.round(args.medianYear)}.`,
      );
    }
  }

  const medianTrackLength = percentile(args.trackLengths, 0.5);
  if (medianTrackLength >= 245_000) {
    scores.SNES.score += 2;
    scores.SNES.reasons.push("Longer track runtimes suggest broader, more cinematic arrangements.");
  } else if (medianTrackLength <= 205_000) {
    scores.NES.score += 2;
    scores.NES.reasons.push("Shorter runtimes point toward punchier, more direct cue writing.");
  } else {
    scores.Genesis.score += 1;
  }

  if (args.explicitRatio >= 0.3) {
    scores.Genesis.score += 2;
    scores.Genesis.reasons.push("A higher explicit ratio points to a sharper, more aggressive soundtrack tone.");
  } else if (args.explicitRatio <= 0.08) {
    scores.SNES.score += 1;
    scores.SNES.reasons.push("A low explicit ratio suggests a softer, more world-building-friendly tone.");
  }

  const topGenreLabel = args.topGenres
    .slice(0, 3)
    .map((genre) => genre.genre)
    .join(", ");
  for (const score of Object.values(scores)) {
    if (topGenreLabel) {
      score.reasons.unshift(`Top genres: ${topGenreLabel}.`);
    }
  }

  return Object.values(scores).sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }
    return eraRank(left.era) - eraRank(right.era);
  })[0]!;
}

function buildReleaseProfile(releaseYears: number[]): ChipmapReleaseProfile {
  if (releaseYears.length === 0) {
    return {
      distribution: [],
      earliestYear: null,
      latestYear: null,
      medianYear: null,
    };
  }

  const sortedYears = [...releaseYears].sort((left, right) => left - right);
  const earliestYear = sortedYears[0]!;
  const latestYear = sortedYears[sortedYears.length - 1]!;
  const medianYear = Math.round(percentile(sortedYears, 0.5));
  const startDecade = Math.floor(earliestYear / 10) * 10;
  const endDecade = Math.floor(latestYear / 10) * 10;

  const distribution: ChipmapReleaseBucket[] = [];
  for (let decade = startDecade; decade <= endDecade; decade += 10) {
    const count = sortedYears.filter(
      (year) => year >= decade && year < decade + 10,
    ).length;

    distribution.push({
      count,
      isMedianBucket: medianYear >= decade && medianYear < decade + 10,
      label: `${decade}s`,
    });
  }

  return {
    distribution,
    earliestYear,
    latestYear,
    medianYear,
  };
}

function buildCueMap(tracks: ChipmapManifestTrack[], era: ChipmapEra) {
  return CUE_DEFINITIONS.map((cue) => {
    const rankedTracks = [...tracks]
      .map((track) => ({
        score: scoreTrackForCue(track, cue),
        title: track.title,
      }))
      .sort((left, right) => right.score - left.score)
      .slice(0, 3);

    const sourceTracks = [...new Set(rankedTracks.map((track) => track.title))];

    return {
      description: cue.description,
      id: cue.id,
      instrumentation:
        CUE_INSTRUMENTATION[era][cue.id] ?? "Palette mapping pending.",
      rationale: buildCueRationale(cue, tracks),
      sourceTracks,
      title: cue.title,
    };
  });
}

function buildTrackRoles(tracks: ChipmapManifestTrack[]): ChipmapTrackRoleGroup[] {
  const groupedTracks = new Map<
    ChipmapTrackRoleId,
    Array<ChipmapTrackRoleAssignment & { score: number }>
  >();

  for (const cue of CUE_DEFINITIONS) {
    groupedTracks.set(cue.id, []);
  }

  for (const track of tracks) {
    const rankedCues = CUE_DEFINITIONS.map((cue) => ({
      cue,
      score: scoreTrackForCue(track, cue),
    })).sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return cueRank(left.cue.id) - cueRank(right.cue.id);
    });

    const bestMatch = rankedCues[0];
    if (!bestMatch) {
      continue;
    }

    groupedTracks.get(bestMatch.cue.id)?.push({
      artists: track.artists.map((artist) => artist.name),
      durationMs: track.durationMs,
      explanation: buildTrackRoleExplanation(track, bestMatch.cue),
      genres: track.genres.slice(0, 3),
      isrc: track.isrc,
      popularity: track.popularity,
      releaseYear: track.releaseYear,
      score: bestMatch.score,
      spotifyId: track.spotifyId,
      spotifyUrl: track.spotifyUrl,
      title: track.title,
    });
  }

  return CUE_DEFINITIONS.map((cue) => {
    const roleTracks = [...(groupedTracks.get(cue.id) ?? [])]
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }
        return left.title.localeCompare(right.title);
      })
      .map(({ score: _score, ...track }) => track);

    return {
      description: cue.description,
      id: cue.id,
      title: cue.title,
      trackCount: roleTracks.length,
      tracks: roleTracks,
    };
  });
}

function buildTrackRoleExplanation(
  track: ChipmapManifestTrack,
  cue: CueDefinition,
) {
  const matchedGenres = track.genres
    .map(normalizeGenre)
    .filter((genre) =>
      cue.keywords.some((keyword) => genre.includes(keyword)),
    )
    .slice(0, 2);
  const genreSummary =
    matchedGenres.length > 0
      ? `Genres like ${matchedGenres.join(", ")} fit ${cue.title.toLowerCase()}.`
      : `Genre labels are sparse, so ${cue.title.toLowerCase()} is driven by the rest of the metadata mix.`;

  const popularity = track.popularity ?? 50;
  const popularitySummary =
    cue.popularityBias === "high"
      ? popularity >= 65
        ? "Higher popularity helps it read like a front-facing cue."
        : "Its lower popularity gives the cue a less obvious, more niche edge."
      : cue.popularityBias === "low"
        ? popularity <= 45
          ? "Lower popularity makes it feel like side-path or deep-world material."
          : "The popularity level still fits a supporting scene rather than a headline moment."
        : "The popularity range stays balanced enough for connective scenes.";

  const durationDelta = track.durationMs - cue.durationTargetMs;
  const durationSummary =
    Math.abs(durationDelta) <= 30_000
      ? "Runtime lands close to the target loop length."
      : durationDelta < 0
        ? "Shorter runtime keeps the cue compact and immediate."
        : "Longer runtime gives the cue more room to breathe.";
  const explicitSummary =
    cue.boostExplicit && track.explicit
      ? "Explicit language adds a sharper edge."
      : cue.boostExplicit
        ? "Even without explicit lyrics, the rest of the metadata still pushes it toward conflict."
        : track.explicit
          ? "Explicit language adds a little extra attitude."
          : "";

  return [genreSummary, popularitySummary, durationSummary, explicitSummary]
    .filter(Boolean)
    .join(" ");
}

function scoreTrackForCue(track: ChipmapManifestTrack, cue: CueDefinition) {
  const normalizedGenres = track.genres.map(normalizeGenre);
  const genreHits = cue.keywords.reduce(
    (count, keyword) =>
      count +
      normalizedGenres.filter((genre) => genre.includes(keyword)).length,
    0,
  );
  const popularity = track.popularity ?? 50;
  const popularityScore =
    cue.popularityBias === "high"
      ? popularity / 20
      : cue.popularityBias === "low"
        ? (100 - popularity) / 25
        : 5 - Math.abs(popularity - 55) / 20;
  const durationScore =
    5 -
    Math.min(5, Math.abs(track.durationMs - cue.durationTargetMs) / 45_000);
  const explicitScore = cue.boostExplicit
    ? track.explicit
      ? 2
      : 0
    : track.explicit
      ? -0.5
      : 0.5;

  return genreHits * 3 + popularityScore + durationScore + explicitScore;
}

function buildCueRationale(cue: CueDefinition, tracks: ChipmapManifestTrack[]) {
  const matchedGenres = new Set<string>();
  for (const track of tracks) {
    for (const genre of track.genres.map(normalizeGenre)) {
      if (cue.keywords.some((keyword) => genre.includes(keyword))) {
        matchedGenres.add(genre);
      }
    }
  }

  const genreSummary =
    matchedGenres.size > 0
      ? `Genre signals like ${[...matchedGenres].slice(0, 3).join(", ")} push this cue in the right direction.`
      : "This cue leans more on duration, popularity, and explicitness than on genre labels alone.";

  return `${genreSummary} The target runtime hovers around ${formatDuration(
    cue.durationTargetMs,
  )}, which helps keep the scene loop believable.`;
}

function buildNextSteps(playlistName: string) {
  return [
    `Export the ${playlistName} manifest and use ISRCs to match local files or fingerprints outside Spotify.`,
    "Run open audio analysis later with tools like Essentia once you have matched audio files.",
    "Use the cue map as a soundtrack brief even before you have tempo and key estimates.",
  ];
}

function buildBriefMarkdown(
  playlistName: string,
  sections: ChipmapStarterPackBriefSection[],
) {
  const lines: string[] = [`# ${playlistName} Starter Pack`, ""];

  for (const section of sections) {
    lines.push(`## ${section.title}`, "");

    for (const item of section.body) {
      lines.push(`- ${item}`);
    }

    lines.push("");
  }

  return lines.join("\n").trim();
}

function buildBriefHtml(
  playlistName: string,
  sections: ChipmapStarterPackBriefSection[],
) {
  const renderedSections = sections
    .map(
      (section) => `
        <section class="section">
          <h2>${escapeHtml(section.title)}</h2>
          <ul>
            ${section.body
              .map((item) => `<li>${escapeHtml(item)}</li>`)
              .join("")}
          </ul>
        </section>
      `,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(playlistName)} Starter Pack</title>
    <style>
      :root {
        color-scheme: dark;
      }

      body {
        background: #0e0d0b;
        color: #e8e6e1;
        font-family: Inter, Arial, sans-serif;
        line-height: 1.55;
        margin: 0;
        padding: 32px;
      }

      main {
        border: 1px solid #2e2c29;
        border-radius: 24px;
        margin: 0 auto;
        max-width: 860px;
        padding: 32px;
      }

      h1 {
        font-size: 32px;
        margin: 0 0 12px;
      }

      h2 {
        border-bottom: 1px solid #2e2c29;
        color: #4f98a3;
        font-size: 18px;
        margin: 0 0 12px;
        padding-bottom: 8px;
      }

      p {
        color: #8a8882;
        margin: 0 0 24px;
      }

      section {
        margin-top: 24px;
      }

      ul {
        margin: 0;
        padding-left: 20px;
      }

      li {
        margin: 0 0 8px;
      }

      @media print {
        body {
          padding: 0;
        }

        main {
          border: 0;
          border-radius: 0;
          max-width: none;
          padding: 0;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <h1>${escapeHtml(playlistName)} Starter Pack</h1>
      <p>Generated by Chipmap metadata-first mode.</p>
      ${renderedSections}
    </main>
  </body>
</html>`;
}

function summarizeMetric(values: number[], decimals: number): ChipmapSummaryMetric {
  const sortedValues = [...values].sort((left, right) => left - right);

  return {
    median: roundTo(percentile(sortedValues, 0.5), decimals),
    p25: roundTo(percentile(sortedValues, 0.25), decimals),
    p75: roundTo(percentile(sortedValues, 0.75), decimals),
  };
}

function percentile(values: number[], percentileValue: number) {
  const sortedValues = [...values].sort((left, right) => left - right);
  const index = (sortedValues.length - 1) * percentileValue;
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);
  const lowerValue = sortedValues[lowerIndex] ?? 0;
  const upperValue = sortedValues[upperIndex] ?? lowerValue;

  if (lowerIndex === upperIndex) {
    return lowerValue;
  }

  const weight = index - lowerIndex;
  return lowerValue + (upperValue - lowerValue) * weight;
}

function normalizeGenre(value: string) {
  return value.trim().toLowerCase();
}

function roundTo(value: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function ratio(part: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return part / total;
}

function eraRank(era: ChipmapEra) {
  if (era === "Genesis") {
    return 0;
  }
  if (era === "SNES") {
    return 1;
  }
  return 2;
}

function cueRank(id: ChipmapTrackRoleId) {
  const order: ChipmapTrackRoleId[] = [
    "title-screen",
    "overworld",
    "town",
    "dungeon",
    "boss",
    "victory",
    "credits",
  ];

  return order.indexOf(id);
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function escapeHtml(value: string) {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  return value.replace(/[&<>"']/g, (character) => entities[character] ?? character);
}

export function formatDuration(durationMs: number) {
  const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
