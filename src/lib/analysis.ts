const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "Eb",
  "E",
  "F",
  "F#",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
] as const;
const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11] as const;
const MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10] as const;

const CAMELOT_MAJOR: Record<number, string> = {
  0: "8B",
  1: "3B",
  2: "10B",
  3: "5B",
  4: "12B",
  5: "7B",
  6: "2B",
  7: "9B",
  8: "4B",
  9: "11B",
  10: "6B",
  11: "1B",
};

const CAMELOT_MINOR: Record<number, string> = {
  0: "5A",
  1: "12A",
  2: "7A",
  3: "2A",
  4: "9A",
  5: "4A",
  6: "11A",
  7: "6A",
  8: "1A",
  9: "8A",
  10: "3A",
  11: "10A",
};

const BPM_BUCKET_DESCRIPTIONS = {
  ambient: "Slow-moving cues for menus, ruins, and dreamlike areas.",
  exploration: "Measured grooves that fit traversal, puzzles, and discovery.",
  adventure: "Balanced momentum for overworld travel and hero themes.",
  action: "Punchy pacing for platforming, combat, and high-alert scenes.",
  chase: "Urgent movement for escape sequences and escalating threats.",
  boss: "Max-intensity tempo built for climactic encounters and finales.",
} as const;

const CLUSTER_CONFIG = [
  {
    id: "high-energy-bright",
    label: "High Energy / Bright",
    cue: "Overworld Sprint",
  },
  {
    id: "high-energy-dark",
    label: "High Energy / Dark",
    cue: "Boss Encounter",
  },
  {
    id: "low-energy-bright",
    label: "Low Energy / Bright",
    cue: "Town Theme",
  },
  {
    id: "low-energy-dark",
    label: "Low Energy / Dark",
    cue: "Dungeon Crawl",
  },
] as const;

const WAVEFORMS = {
  NES: {
    "high-energy-bright": "25% pulse lead",
    "high-energy-dark": "12.5% pulse bite",
    "low-energy-bright": "50% pulse pad",
    "low-energy-dark": "triangle bass",
  },
  SNES: {
    "high-energy-bright": "BRR pluck",
    "high-energy-dark": "BRR strings",
    "low-energy-bright": "BRR flute",
    "low-energy-dark": "BRR warm pad",
  },
  Genesis: {
    "high-energy-bright": "FM brass",
    "high-energy-dark": "FM growl bass",
    "low-energy-bright": "FM electric piano",
    "low-energy-dark": "FM glass pad",
  },
} as const;

const SOUND_DESIGN_REFERENCE = {
  NES: [
    {
      waveform: "12.5% Pulse",
      character: "Thin, nasal bite with fast-cut focus.",
      bestUse: "Boss hooks, counter-melodies, and urgent leads.",
    },
    {
      waveform: "25% Pulse",
      character: "Classic chiptune lead with clear edge and body.",
      bestUse: "Main melodies, arpeggiated riffs, and heroic motifs.",
    },
    {
      waveform: "50% Pulse",
      character: "Rounder square tone with steadier harmonic weight.",
      bestUse: "Pads, countermelodies, and supportive harmony lines.",
    },
    {
      waveform: "Triangle",
      character: "Soft low-end with an instantly retro foundation.",
      bestUse: "Basslines, dungeon ostinatos, and moody undercurrents.",
    },
  ],
  SNES: [
    {
      waveform: "BRR Pluck",
      character: "Warm sampled attack with a friendly, melodic edge.",
      bestUse: "Town themes, melodic hooks, and gentle exploration cues.",
    },
    {
      waveform: "BRR Strings",
      character: "Lush, layered sustain with cinematic depth.",
      bestUse: "Adventure scoring, broad harmony beds, and emotional lifts.",
    },
    {
      waveform: "BRR Flute",
      character: "Airy lead with nostalgic softness and breath.",
      bestUse: "Ambient melodies, scenic travel, and reflective moments.",
    },
    {
      waveform: "BRR Warm Pad",
      character: "Rounded sampled haze that fills space without crowding.",
      bestUse: "Menus, caves, dream states, and low-energy support.",
    },
  ],
  Genesis: [
    {
      waveform: "FM Brass",
      character: "Bright, metallic attack with instant arcade swagger.",
      bestUse: "Action leads, fanfares, and fast overworld themes.",
    },
    {
      waveform: "FM Growl Bass",
      character: "Aggressive low-end with crunchy harmonic movement.",
      bestUse: "Boss fights, chase cues, and dark rhythmic anchors.",
    },
    {
      waveform: "FM Electric Piano",
      character: "Glassier body with melodic clarity and bounce.",
      bestUse: "Adventure grooves, city stages, and lighter bridge sections.",
    },
    {
      waveform: "FM Glass Pad",
      character: "Shimmering sustain with synthetic, high-tech atmosphere.",
      bestUse: "Ambient intros, alien zones, and cool-down transitions.",
    },
  ],
} as const;

const DRUM_PATTERNS = {
  ambient: {
    name: "Shuffle",
    kick: "*···*··*·····*·",
    snare: "····*·······*···",
    hiHat: "*·*·*·*·*·*·*·*·",
  },
  exploration: {
    name: "Shuffle",
    kick: "*···*··*·····*·",
    snare: "····*·······*···",
    hiHat: "*·*·*·*·*·*·*·*·",
  },
  adventure: {
    name: "Basic 4/4",
    kick: "*···*···*···*···",
    snare: "···*···*···*···*",
    hiHat: "****************",
  },
  action: {
    name: "Driving",
    kick: "*·*··*·*·*··*···",
    snare: "···*···*···*···*",
    hiHat: "****************",
  },
  chase: {
    name: "Boss Battle",
    kick: "*·*·*·*·*·*·***",
    snare: "··*···*···*···*·",
    hiHat: "****************",
  },
  boss: {
    name: "Boss Battle",
    kick: "*·*·*·*·*·*·***",
    snare: "··*···*···*···*·",
    hiHat: "****************",
  },
} as const;

const CHORD_LOOKUPS = {
  minor: {
    boss: ["i–bVII–bVI–V", "i–iv–V–i", "i–bII–bVII–i"],
    chase: ["i–bVII–bVI–V", "i–iv–V–i", "i–bII–bVII–i"],
    action: ["i–bVII–IV–i", "i–iv–bVII–bVI", "i–V–bVI–bVII"],
    adventure: ["i–bVII–IV–i", "i–iv–bVII–bVI", "i–V–bVI–bVII"],
    exploration: ["i–bVI–bIII–bVII", "i–iv–i–V", "i–bVII–i–bVI"],
    ambient: ["i–bVI–bIII–bVII", "i–iv–i–V", "i–bVII–i–bVI"],
  },
  major: {
    boss: ["I–V–bVI–bVII", "I–bVII–IV–I", "i–bII–bVII–i"],
    chase: ["I–V–bVI–bVII", "I–bVII–IV–I", "i–bII–bVII–i"],
    action: ["I–IV–V–I", "I–V–vi–IV", "I–bVII–IV–V"],
    adventure: ["I–IV–V–I", "I–V–vi–IV", "I–bVII–IV–V"],
    exploration: ["I–ii–IV–I", "I–IV–ii–V", "iii–IV–I–V"],
    ambient: ["I–ii–IV–I", "I–IV–ii–V", "iii–IV–I–V"],
  },
} as const;

const CHORD_DESCRIPTIONS: Record<string, string> = {
  "i–bVII–bVI–V": "Classic rising tension that lands with a dramatic final push.",
  "i–iv–V–i": "Compact minor cadence for direct conflict and looping pressure.",
  "i–bII–bVII–i": "Dark, exotic pull that feels unstable and villain-coded.",
  "i–bVII–IV–i": "Retro heroic minor motion with bright lift before returning home.",
  "i–iv–bVII–bVI": "Descending minor sequence that keeps the energy restless.",
  "i–V–bVI–bVII": "Punchy harmonic climb for battle themes with forward motion.",
  "i–bVI–bIII–bVII": "Wide open minor palette that suits wandering and mystery.",
  "i–iv–i–V": "Sparse loop with a clear turnaround for quieter exploration.",
  "i–bVII–i–bVI": "Moody back-and-forth that works well for caves and menus.",
  "I–V–bVI–bVII": "Triumphant start that twists into arcade-era danger.",
  "I–bVII–IV–I": "Anthemic modal lift with bright resolution at the loop point.",
  "I–IV–V–I": "Foundational adventure cadence with immediate readability.",
  "I–V–vi–IV": "Big melodic pop arc for memorable overworld or town themes.",
  "I–bVII–IV–V": "Mixolydian drive with swagger and motion.",
  "I–ii–IV–I": "Gentle major loop for scenic routes and calm traversal.",
  "I–IV–ii–V": "Open-air progression that keeps light movement in the harmony.",
  "iii–IV–I–V": "Dreamier major color for reflective exploration and credits energy.",
};

export type ChipmapBpmBucket =
  | "ambient"
  | "exploration"
  | "adventure"
  | "action"
  | "chase"
  | "boss";
export type ChipmapEra = "NES" | "SNES" | "Genesis";

export interface ChipmapTrackInput {
  id: string;
  name: string;
}

export interface ChipmapAudioFeature {
  id: string;
  tempo: number;
  energy: number;
  valence: number;
  danceability: number;
  acousticness: number;
  key: number;
  mode: 0 | 1;
}

export interface ChipmapAggregate {
  median: number;
  p25: number;
  p75: number;
}

export interface ChipmapMetricAggregates {
  tempo: ChipmapAggregate;
  energy: ChipmapAggregate;
  valence: ChipmapAggregate;
  danceability: ChipmapAggregate;
  acousticness: ChipmapAggregate;
}

export interface ChipmapKeyHistogramEntry {
  key: number;
  mode: 0 | 1;
  noteName: (typeof NOTE_NAMES)[number];
  modeLabel: "Major" | "Minor";
  camelot: string;
  count: number;
  label: string;
}

export interface ChipmapBpmDistributionBucket {
  label: string;
  min: number;
  max: number;
  count: number;
  isMedianBucket: boolean;
}

export interface ChipmapCluster {
  id: string;
  label: string;
  count: number;
  suggestedGameCue: string;
  targetBpm: number;
  recommendedKey: string;
  waveformSuggestion: string;
}

export interface ChipmapChordProgression {
  roman: string;
  chords: string;
  description: string;
}

export interface ChipmapDrumPattern {
  name: string;
  bpmBucket: ChipmapBpmBucket;
  context: string;
  kick: string;
  snare: string;
  hiHat: string;
}

export interface ChipmapSoundDesignRow {
  waveform: string;
  character: string;
  bestUse: string;
}

export interface ChipmapAnalysis {
  trackCount: number;
  aggregates: ChipmapMetricAggregates;
  bpmBucket: ChipmapBpmBucket;
  bpmBucketDescription: string;
  bpmDistribution: ChipmapBpmDistributionBucket[];
  era: ChipmapEra;
  keyHistogram: ChipmapKeyHistogramEntry[];
  topKeys: ChipmapKeyHistogramEntry[];
  topKey: ChipmapKeyHistogramEntry;
  clusters: ChipmapCluster[];
  chordPalette: ChipmapChordProgression[];
  drumPattern: ChipmapDrumPattern;
  soundDesignReference: ChipmapSoundDesignRow[];
}

export function analyzeFeatures(
  tracks: ChipmapTrackInput[],
  features: ChipmapAudioFeature[],
): ChipmapAnalysis {
  const pairs = tracks
    .map((track, index) => ({ track, feature: features[index] }))
    .filter(
      (
        value,
      ): value is { track: ChipmapTrackInput; feature: ChipmapAudioFeature } =>
        Boolean(value.feature),
    );

  if (pairs.length === 0) {
    throw new Error("No analyzable audio features were provided.");
  }

  const tempos = pairs.map(({ feature }) => feature.tempo);
  const energies = pairs.map(({ feature }) => feature.energy);
  const valences = pairs.map(({ feature }) => feature.valence);
  const danceabilities = pairs.map(({ feature }) => feature.danceability);
  const acousticness = pairs.map(({ feature }) => feature.acousticness);

  const aggregates: ChipmapMetricAggregates = {
    tempo: summarizeMetric(tempos, 1),
    energy: summarizeMetric(energies, 3),
    valence: summarizeMetric(valences, 3),
    danceability: summarizeMetric(danceabilities, 3),
    acousticness: summarizeMetric(acousticness, 3),
  };

  const bpmBucket = classifyBpmBucket(aggregates.tempo.median);
  const era = classifyEra(aggregates.acousticness.median, aggregates.energy.median);
  const keyHistogram = buildKeyHistogram(pairs.map(({ feature }) => feature));
  const topKeys = keyHistogram.slice(0, 3);
  const topKey = topKeys[0] ?? createKeyEntry(0, 1, 0);

  return {
    trackCount: pairs.length,
    aggregates,
    bpmBucket,
    bpmBucketDescription: BPM_BUCKET_DESCRIPTIONS[bpmBucket],
    bpmDistribution: buildBpmDistribution(tempos, aggregates.tempo.median),
    era,
    keyHistogram,
    topKeys,
    topKey,
    clusters: buildClusters(pairs, aggregates.tempo.median, topKey.label, era),
    chordPalette: buildChordPalette(topKey, bpmBucket),
    drumPattern: buildDrumPattern(bpmBucket),
    soundDesignReference: [...SOUND_DESIGN_REFERENCE[era]],
  };
}

function summarizeMetric(values: number[], decimals: number): ChipmapAggregate {
  const sorted = [...values].sort((left, right) => left - right);

  return {
    median: roundNumber(percentile(sorted, 0.5), decimals),
    p25: roundNumber(percentile(sorted, 0.25), decimals),
    p75: roundNumber(percentile(sorted, 0.75), decimals),
  };
}

function percentile(sortedValues: number[], percentileValue: number) {
  const index = (sortedValues.length - 1) * percentileValue;
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);
  const lower = sortedValues[lowerIndex] ?? 0;
  const upper = sortedValues[upperIndex] ?? lower;

  if (lowerIndex === upperIndex) {
    return lower;
  }

  const weight = index - lowerIndex;
  return lower + (upper - lower) * weight;
}

function roundNumber(value: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function classifyBpmBucket(medianTempo: number): ChipmapBpmBucket {
  if (medianTempo < 80) {
    return "ambient";
  }
  if (medianTempo < 100) {
    return "exploration";
  }
  if (medianTempo < 120) {
    return "adventure";
  }
  if (medianTempo < 140) {
    return "action";
  }
  if (medianTempo < 160) {
    return "chase";
  }
  return "boss";
}

function classifyEra(
  medianAcousticness: number,
  medianEnergy: number,
): ChipmapEra {
  if (medianAcousticness > 0.5) {
    return "SNES";
  }
  if (medianEnergy > 0.65) {
    return "Genesis";
  }
  return "NES";
}

function buildKeyHistogram(features: ChipmapAudioFeature[]) {
  const counter = new Map<string, number>();

  for (const feature of features) {
    const bucketKey = `${feature.key}:${feature.mode}`;
    counter.set(bucketKey, (counter.get(bucketKey) ?? 0) + 1);
  }

  return [...counter.entries()]
    .map(([bucketKey, count]) => {
      const [key, mode] = bucketKey.split(":").map(Number);
      const normalizedMode: 0 | 1 = mode === 0 ? 0 : 1;
      return createKeyEntry(key ?? 0, normalizedMode, count);
    })
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }
      return left.label.localeCompare(right.label);
    });
}

function createKeyEntry(
  key: number,
  mode: 0 | 1,
  count: number,
): ChipmapKeyHistogramEntry {
  const noteName = NOTE_NAMES[key] ?? NOTE_NAMES[0];
  const modeLabel = mode === 1 ? "Major" : "Minor";
  const camelot =
    (mode === 1 ? CAMELOT_MAJOR[key] : CAMELOT_MINOR[key]) ??
    (mode === 1 ? "8B" : "5A");

  return {
    key,
    mode,
    noteName,
    modeLabel,
    camelot,
    count,
    label: `${noteName} ${modeLabel} · ${camelot}`,
  };
}

function buildBpmDistribution(
  tempos: number[],
  medianTempo: number,
): ChipmapBpmDistributionBucket[] {
  const minValue = Math.floor(Math.min(...tempos) / 20) * 20;
  const maxValue = Math.ceil(Math.max(...tempos) / 20) * 20;
  const medianBucketStart = Math.floor(medianTempo / 20) * 20;
  const buckets: ChipmapBpmDistributionBucket[] = [];

  for (let current = minValue; current <= maxValue; current += 20) {
    const upperBound = current + 20;
    const count = tempos.filter(
      (tempo) =>
        tempo >= current &&
        (current === maxValue ? tempo <= upperBound : tempo < upperBound),
    ).length;

    buckets.push({
      label: `${current}-${current + 19}`,
      min: current,
      max: current + 19,
      count,
      isMedianBucket: current === medianBucketStart,
    });
  }

  return buckets;
}

function buildClusters(
  pairs: Array<{ track: ChipmapTrackInput; feature: ChipmapAudioFeature }>,
  fallbackTempo: number,
  recommendedKey: string,
  era: ChipmapEra,
) {
  return CLUSTER_CONFIG.map((cluster) => {
    const clusterPairs = pairs.filter(({ feature }) =>
      matchesCluster(cluster.id, feature),
    );
    const clusterTempos =
      clusterPairs.length > 0
        ? clusterPairs.map(({ feature }) => feature.tempo)
        : [fallbackTempo];

    return {
      id: cluster.id,
      label: cluster.label,
      count: clusterPairs.length,
      suggestedGameCue: cluster.cue,
      targetBpm: Math.round(
        percentile([...clusterTempos].sort((a, b) => a - b), 0.5),
      ),
      recommendedKey,
      waveformSuggestion: WAVEFORMS[era][cluster.id],
    };
  });
}

function matchesCluster(
  clusterId: (typeof CLUSTER_CONFIG)[number]["id"],
  feature: ChipmapAudioFeature,
) {
  const highEnergy = feature.energy >= 0.5;
  const bright = feature.valence >= 0.5;

  return (
    (clusterId === "high-energy-bright" && highEnergy && bright) ||
    (clusterId === "high-energy-dark" && highEnergy && !bright) ||
    (clusterId === "low-energy-bright" && !highEnergy && bright) ||
    (clusterId === "low-energy-dark" && !highEnergy && !bright)
  );
}

function buildChordPalette(
  topKey: ChipmapKeyHistogramEntry,
  bpmBucket: ChipmapBpmBucket,
) {
  const family = topKey.mode === 1 ? "major" : "minor";
  const progressions = CHORD_LOOKUPS[family][bpmBucket];

  return progressions.map((roman) => ({
    roman,
    chords: roman
      .split("–")
      .map((token) => buildChordName(token, topKey.key, topKey.mode))
      .join(" - "),
    description: CHORD_DESCRIPTIONS[roman] ?? "Flexible retro loop with strong scene identity.",
  }));
}

function buildChordName(token: string, tonic: number, mode: 0 | 1) {
  const accidentalMatch = /^b+/.exec(token)?.[0] ?? "";
  const romanPart = token.slice(accidentalMatch.length);
  const accidentalOffset = accidentalMatch.length * -1;
  const degree = romanToDegree(romanPart);
  const scale = mode === 1 ? MAJOR_SCALE : MINOR_SCALE;
  const interval = scale[degree - 1] ?? 0;
  const semitone = (tonic + interval + accidentalOffset + 12) % 12;
  const noteName = NOTE_NAMES[semitone] ?? NOTE_NAMES[0];
  const quality = romanPart === romanPart.toLowerCase() ? "m" : "";

  return `${noteName}${quality}`;
}

function romanToDegree(token: string) {
  const normalized = token.replace(/[^ivIV]/g, "").toUpperCase();
  const map: Record<string, number> = {
    I: 1,
    II: 2,
    III: 3,
    IV: 4,
    V: 5,
    VI: 6,
    VII: 7,
  };

  return map[normalized] ?? 1;
}

function buildDrumPattern(bpmBucket: ChipmapBpmBucket): ChipmapDrumPattern {
  const pattern = DRUM_PATTERNS[bpmBucket];

  return {
    name: pattern.name,
    bpmBucket,
    context: BPM_BUCKET_DESCRIPTIONS[bpmBucket],
    kick: pattern.kick,
    snare: pattern.snare,
    hiHat: pattern.hiHat,
  };
}
