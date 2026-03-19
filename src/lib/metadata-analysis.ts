import { type ChipmapAnalysis as LegacyChipmapAnalysis } from "~/lib/analysis";

export type ChipmapEra = "NES" | "SNES" | "Genesis";

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
  id: string;
  instrumentation: string;
  rationale: string;
  sourceTracks: string[];
  title: string;
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
}

export type ChipmapAnalysis = LegacyChipmapAnalysis | ChipmapMetadataAnalysis;

type EraScore = {
  era: ChipmapEra;
  reasons: string[];
  score: number;
};

type CueDefinition = {
  boostExplicit?: boolean;
  description: string;
  durationTargetMs: number;
  id: string;
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
    credits: "25% pulse melody, soft triangle floor, wider arpeggio spacing",
  },
  SNES: {
    "title-screen": "BRR pluck lead, warm strings, rounded sampled bass",
    overworld: "BRR strings, flute accents, warm bass and light percussion",
    town: "BRR flute, soft keys, gentle brushed percussion",
    dungeon: "Warm pad, low strings, distant metallic hits",
    boss: "Layered strings, punchy toms, sharper sampled brass stabs",
    credits: "Wide strings, bell-like plucks, slow moving sampled choir",
  },
  Genesis: {
    "title-screen": "FM brass lead, electric piano support, punchy bass",
    overworld: "FM brass hook, glass pad bed, syncopated FM bass",
    town: "FM electric piano, glass pad, soft FM bass pulses",
    dungeon: "FM growl bass, glass pad haze, metallic bell accents",
    boss: "FM brass stabs, growl bass, aggressive gated percussion",
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
  const medianYear = Math.round(percentile(sortedYears, 0.5));
  const startDecade = Math.floor((sortedYears[0] ?? medianYear) / 10) * 10;
  const endDecade =
    Math.floor((sortedYears[sortedYears.length - 1] ?? medianYear) / 10) * 10;

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
    earliestYear: sortedYears[0] ?? null,
    latestYear: sortedYears[sortedYears.length - 1] ?? null,
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

    const sourceTracks = rankedTracks
      .map((track) => track.title)
      .filter((value, index, list) => list.indexOf(value) === index);

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

export function formatDuration(durationMs: number) {
  const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
