"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { type ChipmapAnalysis } from "~/lib/analysis";
import { toFileNameBase } from "~/lib/utils";
import { ChipmapLogo } from "~/components/chipmap/logo";
import { SiteFooter } from "~/components/chipmap/site-footer";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

type RecentAnalysis = {
  analyzedAt: string | Date;
  coverUrl: string | null;
  era: "NES" | "SNES" | "Genesis";
  playlistId: string;
  playlistName: string;
  trackCount: number;
};

type AnalysisViewProps = {
  playlistId: string;
  playlistName: string;
  coverUrl: string | null;
  analysis: ChipmapAnalysis;
  recentAnalyses: RecentAnalysis[];
};

export function AnalysisView({
  playlistId,
  playlistName,
  coverUrl,
  analysis,
  recentAnalyses,
}: AnalysisViewProps) {
  function handleExport() {
    const blob = new Blob([JSON.stringify(analysis, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${toFileNameBase(playlistName, playlistId)}-chipmap-analysis.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="chipmap-grid bg-background min-h-screen">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-390 flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6">
        <aside className="chipmap-panel border-border flex w-full flex-col rounded-[28px] border p-4 lg:max-w-[320px]">
          <div className="border-border/70 flex items-center gap-3 border-b px-2 pb-5">
            <ChipmapLogo className="h-12 w-12" />
            <div>
              <p className="font-semibold">Chipmap</p>
              <p className="text-muted-foreground text-sm">
                Public playlist analysis
              </p>
            </div>
          </div>

          <Button asChild className="mt-5" data-testid="button-analyse-another">
            <Link href="/">Analyse another →</Link>
          </Button>

          <div className="mt-6 flex-1">
            <div className="text-muted-foreground mb-3 px-2 text-xs font-semibold tracking-[0.18em] uppercase">
              Recent Analyses
            </div>

            <div className="space-y-3">
              {recentAnalyses.map((entry) => (
                <Link
                  key={entry.playlistId}
                  href={`/analysis/${entry.playlistId}`}
                  className="border-border/70 bg-card/85 hover:border-accent/60 hover:bg-card block rounded-2xl border p-3 transition"
                  data-testid={`sidebar-recent-${entry.playlistId}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-secondary relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                      {entry.coverUrl ? (
                        <Image
                          src={entry.coverUrl}
                          alt={entry.playlistName}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ChipmapLogo className="h-7 w-7 opacity-80" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {entry.playlistName}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {entry.trackCount} track
                        {entry.trackCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    <EraBadge era={entry.era} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <div className="chipmap-panel border-border rounded-[30px] border p-5 shadow-[0_24px_90px_rgba(0,0,0,0.26)] sm:p-7">
            <div className="border-border/80 mb-8 border-b pb-6">
              <Link
                href="/"
                className="text-accent text-sm font-medium"
                data-testid="link-analyse-another"
              >
                ← Analyse another playlist
              </Link>

              <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="bg-secondary relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
                    {coverUrl ? (
                      <Image
                        src={coverUrl}
                        alt={playlistName}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ChipmapLogo className="h-10 w-10" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h1
                        className="truncate text-3xl font-semibold tracking-tight sm:text-4xl"
                        data-testid="analysis-title"
                      >
                        {playlistName}
                      </h1>
                      <EraBadge era={analysis.era} />
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                      Chipmap translated this public playlist into a game-music
                      starter pack using Spotify audio features.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleExport}
                  data-testid="export-analysis-button"
                >
                  Export JSON
                </Button>
              </div>
            </div>

            <div className="space-y-8">
              <section data-testid="overview-section">
                <StickyHeading title="Overview Stats" />
                <div className="grid gap-4 lg:grid-cols-4">
                  <StatCard
                    label="Median BPM"
                    value={`${analysis.aggregates.tempo.median}`}
                    helper={`${analysis.trackCount} analysed tracks`}
                    testId="stat-median-bpm"
                  />
                  <MeterCard
                    label="Energy"
                    value={analysis.aggregates.energy.median}
                    testId="stat-energy"
                  />
                  <MeterCard
                    label="Valence"
                    value={analysis.aggregates.valence.median}
                    testId="stat-valence"
                  />
                  <StatCard
                    label="Top Key"
                    value={analysis.topKey.label}
                    helper={`Top 3 keys tracked across ${analysis.keyHistogram.length} buckets`}
                    testId="stat-top-key"
                  />
                </div>
              </section>

              <section data-testid="bpm-distribution-section">
                <StickyHeading title="BPM Distribution" />
                <Card>
                  <CardContent className="p-5 sm:p-6">
                    <div className="h-72" data-testid="chart-bpm-distribution">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analysis.bpmDistribution}>
                          <CartesianGrid
                            vertical={false}
                            stroke="hsl(var(--border))"
                          />
                          <XAxis
                            dataKey="label"
                            stroke="hsl(var(--muted-foreground))"
                          />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
                          <Tooltip
                            cursor={{ fill: "hsl(var(--secondary) / 0.45)" }}
                            contentStyle={{
                              background: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "16px",
                              color: "hsl(var(--foreground))",
                            }}
                          />
                          <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                            {analysis.bpmDistribution.map((bucket) => (
                              <Cell
                                key={bucket.label}
                                fill={
                                  bucket.isMedianBucket
                                    ? "hsl(var(--accent))"
                                    : "hsl(var(--secondary-foreground) / 0.32)"
                                }
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="border-border bg-secondary/45 mt-4 rounded-2xl border p-4">
                      <div className="mb-2 flex flex-wrap items-center gap-3">
                        <Badge variant="teal" data-testid="bpm-bucket-badge">
                          {capitalizeLabel(analysis.bpmBucket)}
                        </Badge>
                        <span
                          className="text-muted-foreground text-sm"
                          data-testid="bpm-bucket-description"
                        >
                          {analysis.bpmBucketDescription}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section data-testid="cluster-map-section">
                <StickyHeading title="Energy × Valence Cluster Map" />
                <div className="grid gap-4 lg:grid-cols-2">
                  {analysis.clusters.map((cluster) => (
                    <Card
                      key={cluster.id}
                      data-testid={`cluster-card-${cluster.id}`}
                    >
                      <CardHeader>
                        <CardTitle>{cluster.label}</CardTitle>
                        <CardDescription>
                          {cluster.count} track{cluster.count === 1 ? "" : "s"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-3 text-sm">
                        <ClusterMetric
                          label="Suggested cue"
                          value={cluster.suggestedGameCue}
                        />
                        <ClusterMetric
                          label="Target BPM"
                          value={`${cluster.targetBpm}`}
                        />
                        <ClusterMetric
                          label="Recommended key"
                          value={cluster.recommendedKey}
                        />
                        <ClusterMetric
                          label="Waveform"
                          value={cluster.waveformSuggestion}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              <section data-testid="chord-palette-section">
                <StickyHeading title="Chord Palette" />
                <div className="grid gap-4 lg:grid-cols-3">
                  {analysis.chordPalette.map((progression) => (
                    <Card
                      key={progression.roman}
                      data-testid={`chord-card-${progression.roman.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}
                    >
                      <CardHeader>
                        <CardTitle className="font-mono text-lg">
                          {progression.roman}
                        </CardTitle>
                        <CardDescription>{progression.chords}</CardDescription>
                      </CardHeader>
                      <CardContent className="text-muted-foreground text-sm">
                        {progression.description}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              <section data-testid="drum-pattern-section">
                <StickyHeading title="Drum Patterns" />
                <Card>
                  <CardHeader>
                    <CardTitle>{analysis.drumPattern.name}</CardTitle>
                    <CardDescription data-testid="drum-pattern-context">
                      {analysis.drumPattern.context}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3" data-testid="drum-pattern-grid">
                      <DrumPatternRow
                        label="K"
                        steps={analysis.drumPattern.kick}
                        activeClassName="bg-amber-500"
                        testId="drum-row-kick"
                      />
                      <DrumPatternRow
                        label="S"
                        steps={analysis.drumPattern.snare}
                        activeClassName="bg-accent"
                        testId="drum-row-snare"
                      />
                      <DrumPatternRow
                        label="HH"
                        steps={analysis.drumPattern.hiHat}
                        activeClassName="bg-muted-foreground"
                        testId="drum-row-hihat"
                      />
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section data-testid="sound-design-section">
                <StickyHeading title="Sound Design Reference" />
                <Card>
                  <CardContent className="overflow-x-auto p-0">
                    <table
                      className="min-w-full text-left text-sm"
                      data-testid="sound-design-table"
                    >
                      <thead className="bg-secondary/50 text-muted-foreground text-xs tracking-[0.18em] uppercase">
                        <tr>
                          <th className="px-5 py-4">Waveform</th>
                          <th className="px-5 py-4">Character</th>
                          <th className="px-5 py-4">Best Use</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysis.soundDesignReference.map((row) => (
                          <tr
                            key={row.waveform}
                            className="border-border border-t"
                          >
                            <td className="px-5 py-4 font-medium">
                              {row.waveform}
                            </td>
                            <td className="text-muted-foreground px-5 py-4">
                              {row.character}
                            </td>
                            <td className="text-muted-foreground px-5 py-4">
                              {row.bestUse}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </section>
            </div>
          </div>
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}

function StickyHeading({ title }: Readonly<{ title: string }>) {
  return (
    <div className="bg-background/95 sticky top-0 z-10 mb-4 py-2 backdrop-blur">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
    </div>
  );
}

function EraBadge({ era }: Readonly<{ era: "NES" | "SNES" | "Genesis" }>) {
  const variant = era === "NES" ? "amber" : era === "SNES" ? "purple" : "teal";

  return (
    <Badge variant={variant} data-testid="analysis-era-badge">
      {era}
    </Badge>
  );
}

function StatCard({
  label,
  value,
  helper,
  testId,
}: Readonly<{
  label: string;
  value: string;
  helper: string;
  testId: string;
}>) {
  return (
    <Card data-testid={testId}>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm">
        {helper}
      </CardContent>
    </Card>
  );
}

function MeterCard({
  label,
  value,
  testId,
}: Readonly<{
  label: string;
  value: number;
  testId: string;
}>) {
  return (
    <Card data-testid={testId}>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value.toFixed(3)}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-secondary h-2 rounded-full">
          <div
            className="bg-accent h-2 rounded-full"
            style={{ width: `${Math.max(6, value * 100)}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ClusterMetric({
  label,
  value,
}: Readonly<{
  label: string;
  value: string;
}>) {
  return (
    <div className="border-border bg-secondary/40 flex items-center justify-between rounded-2xl border px-4 py-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function DrumPatternRow({
  label,
  steps,
  activeClassName,
  testId,
}: Readonly<{
  label: string;
  steps: string;
  activeClassName: string;
  testId: string;
}>) {
  return (
    <div
      className="grid grid-cols-[40px_1fr] items-center gap-3"
      data-testid={testId}
    >
      <span className="text-muted-foreground font-mono text-sm">{label}</span>
      <div className="grid grid-cols-16 gap-1">
        {steps.split("").map((step, index) => (
          <div
            key={`${label}-${index}`}
            className={
              step === "*"
                ? `${activeClassName} aspect-square rounded-md`
                : "bg-secondary aspect-square rounded-md"
            }
          />
        ))}
      </div>
    </div>
  );
}

function capitalizeLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
