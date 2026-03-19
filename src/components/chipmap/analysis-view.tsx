"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
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

import { type ChipmapAnalysis as AudioChipmapAnalysis } from "~/lib/analysis";
import {
  formatDuration,
  isMetadataAnalysis,
  type ChipmapAnalysis,
  type ChipmapMetadataAnalysis,
} from "~/lib/metadata-analysis";
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
import { api } from "~/trpc/react";

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

export function AnalysisView(props: AnalysisViewProps) {
  if (isMetadataAnalysis(props.analysis)) {
    return <MetadataAnalysisPage {...props} analysis={props.analysis} />;
  }

  return <AudioFeatureAnalysisPage {...props} analysis={props.analysis} />;
}

function MetadataAnalysisPage({
  playlistId,
  playlistName,
  coverUrl,
  analysis,
  recentAnalyses,
}: AnalysisViewProps & { analysis: ChipmapMetadataAnalysis }) {
  const exportAnalysis = api.spotify.exportAnalysis.useQuery(
    { playlistId },
    { enabled: false, retry: false },
  );
  const fallbackFilenameBase = useMemo(
    () => toFileNameBase(playlistName, playlistId),
    [playlistId, playlistName],
  );

  async function getExportPayload() {
    if (exportAnalysis.data?.playlistId === playlistId) {
      return exportAnalysis.data;
    }

    const result = await exportAnalysis.refetch();

    if (result.data) {
      return result.data;
    }

    throw result.error instanceof Error
      ? result.error
      : new Error("Chipmap could not prepare the export.");
  }

  async function handleExport(
    format: "analysis-json" | "manifest-json" | "markdown" | "pdf",
  ) {
    const payload = await getExportPayload();

    if (format === "analysis-json") {
      downloadFile(
        `${payload.filenameBase}-chipmap-metadata-analysis.json`,
        JSON.stringify(payload.analysis, null, 2),
        "application/json",
      );
      return;
    }

    if (format === "manifest-json") {
      downloadFile(
        `${payload.filenameBase}-chipmap-manifest.json`,
        JSON.stringify(payload.manifest, null, 2),
        "application/json",
      );
      return;
    }

    if (format === "markdown") {
      downloadFile(
        `${payload.filenameBase}-chipmap-starter-pack.md`,
        payload.starterPackMarkdown,
        "text/markdown",
      );
      return;
    }

    openPrintWindow(
      payload.pdfHtml,
      `${payload.filenameBase}-chipmap-starter-pack`,
    );
  }

  return (
    <AnalysisShell
      playlistName={playlistName}
      coverUrl={coverUrl}
      recentAnalyses={recentAnalyses}
      sidebarModeLabel="Metadata-first soundtrack brief"
      titleExtras={
        <>
          <EraBadge era={analysis.era} />
          <Badge variant="green" data-testid="analysis-mode-badge">
            Metadata First
          </Badge>
        </>
      }
      subtitle="Spotify no longer exposes audio features to this app, so Chipmap builds a soundtrack brief from genres, release eras, runtimes, and track metadata."
    >
      <section data-testid="export-section">
        <StickyHeading title="Export Starter Pack" />
        <Card>
          <CardHeader>
            <CardTitle>Export Formats</CardTitle>
            <CardDescription>
              Download the starter pack as JSON or Markdown, or open a
              print-ready brief you can save as PDF.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => void handleExport("analysis-json")}
                disabled={exportAnalysis.isFetching}
                data-testid="export-analysis-button"
              >
                Analysis JSON
              </Button>
              <Button
                variant="outline"
                onClick={() => void handleExport("manifest-json")}
                disabled={exportAnalysis.isFetching}
                data-testid="export-manifest-button"
              >
                Manifest JSON
              </Button>
              <Button
                variant="outline"
                onClick={() => void handleExport("markdown")}
                disabled={exportAnalysis.isFetching}
                data-testid="export-markdown-button"
              >
                Markdown Brief
              </Button>
              <Button
                onClick={() => void handleExport("pdf")}
                disabled={exportAnalysis.isFetching}
                data-testid="export-pdf-button"
              >
                PDF Brief
              </Button>
            </div>
            <div
              className="text-muted-foreground text-sm"
              data-testid="export-filename-hint"
            >
              {exportAnalysis.isFetching
                ? "Preparing export payload..."
                : `Starter pack base filename: ${fallbackFilenameBase}`}
            </div>
          </CardContent>
        </Card>
      </section>

      <section data-testid="overview-section">
        <StickyHeading title="Overview" />
        <div className="grid gap-4 lg:grid-cols-4">
          <StatCard
            label="Tracks"
            value={`${analysis.trackCount}`}
            helper={`${analysis.overview.uniqueArtistCount} artists across ${analysis.overview.uniqueAlbumCount} albums`}
            testId="stat-track-count"
          />
          <StatCard
            label="Runtime"
            value={formatDuration(analysis.overview.totalRuntimeMs)}
            helper={`Avg track ${formatDuration(analysis.overview.averageTrackDurationMs)}`}
            testId="stat-runtime"
          />
          <MeterCard
            label="Explicit Ratio"
            value={analysis.overview.explicitRatio}
            formatter={formatPercent}
            testId="stat-explicit-ratio"
          />
          <MeterCard
            label="ISRC Coverage"
            value={analysis.overview.isrcCoverageRatio}
            formatter={formatPercent}
            testId="stat-isrc-coverage"
          />
        </div>
      </section>

      <section data-testid="release-profile-section">
        <StickyHeading title="Release Timeline" />
        <Card>
          <CardContent className="p-5 sm:p-6">
            {analysis.releaseProfile.distribution.length > 0 ? (
              <div className="h-72" data-testid="release-timeline-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysis.releaseProfile.distribution}>
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
                      {analysis.releaseProfile.distribution.map((bucket) => (
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
            ) : (
              <div className="text-muted-foreground border-border rounded-2xl border border-dashed p-8 text-sm">
                Release years were missing from the imported track metadata.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section data-testid="genre-section">
        <StickyHeading title="Genre Fingerprint" />
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {analysis.genres.map((genre) => (
            <Card key={genre.genre}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{genre.genre}</CardTitle>
                <CardDescription>{genre.count} tracks tagged</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-secondary h-2 rounded-full">
                  <div
                    className="bg-accent h-2 rounded-full"
                    style={{ width: `${Math.max(8, genre.share * 100)}%` }}
                  />
                </div>
                <p className="text-muted-foreground mt-3 text-sm">
                  {Math.round(genre.share * 100)}% of imported tracks carry this
                  signal.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section data-testid="soundtrack-profile-section">
        <StickyHeading title="Soundtrack Lens" />
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle>{analysis.soundtrackProfile.title}</CardTitle>
              <EraBadge era={analysis.era} />
            </div>
            <CardDescription>
              {analysis.soundtrackProfile.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {analysis.soundtrackProfile.reasons.map((reason) => (
              <div
                key={reason}
                className="border-border bg-secondary/40 text-muted-foreground rounded-2xl border p-4 text-sm"
              >
                {reason}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section data-testid="cue-map-section">
        <StickyHeading title="Cue Map" />
        <div className="grid gap-4 xl:grid-cols-2">
          {analysis.cueMap.map((cue) => (
            <Card key={cue.id} data-testid={`cue-${cue.id}`}>
              <CardHeader>
                <CardTitle>{cue.title}</CardTitle>
                <CardDescription>{cue.description}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 text-sm">
                <div>
                  <p className="text-foreground mb-1 font-medium">
                    Instrumentation
                  </p>
                  <p className="text-muted-foreground">{cue.instrumentation}</p>
                </div>
                <div>
                  <p className="text-foreground mb-2 font-medium">
                    Source tracks
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cue.sourceTracks.map((trackName) => (
                      <Badge key={trackName} variant="default">
                        {trackName}
                      </Badge>
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground">{cue.rationale}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section data-testid="track-roles-section">
        <StickyHeading title="Track Roles" />
        <div className="grid gap-4">
          {analysis.trackRoles.map((role) => (
            <Card key={role.id} data-testid={`track-role-group-${role.id}`}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-3">
                  <CardTitle>{role.title}</CardTitle>
                  <Badge variant="teal">{role.trackCount} tracks</Badge>
                </div>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {role.tracks.slice(0, 6).map((track) => (
                  <div
                    key={track.spotifyId}
                    className="border-border bg-secondary/35 rounded-2xl border p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{track.title}</p>
                        <p className="text-muted-foreground mt-1 text-sm">
                          {track.artists.join(", ")}
                        </p>
                      </div>
                      <Badge variant="default">
                        {formatDuration(track.durationMs)}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-3 text-sm">
                      {track.explanation}
                    </p>
                  </div>
                ))}
                {role.tracks.length === 0 ? (
                  <div className="border-border text-muted-foreground rounded-2xl border border-dashed p-4 text-sm">
                    No tracks leaned most strongly toward this slot.
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section data-testid="next-steps-section">
        <StickyHeading title="Next Steps" />
        <div className="grid gap-3">
          {analysis.nextSteps.map((step) => (
            <Card key={step}>
              <CardContent className="text-muted-foreground p-5 text-sm">
                {step}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </AnalysisShell>
  );
}

function AudioFeatureAnalysisPage({
  playlistId,
  playlistName,
  coverUrl,
  analysis,
  recentAnalyses,
}: AnalysisViewProps & { analysis: AudioChipmapAnalysis }) {
  function handleExport() {
    downloadFile(
      `${toFileNameBase(playlistName, playlistId)}-chipmap-analysis.json`,
      JSON.stringify(analysis, null, 2),
      "application/json",
    );
  }

  return (
    <AnalysisShell
      playlistName={playlistName}
      coverUrl={coverUrl}
      recentAnalyses={recentAnalyses}
      sidebarModeLabel="Audio-feature analysis"
      titleExtras={<EraBadge era={analysis.era} />}
      subtitle="This cached analysis uses the older Spotify audio-feature format."
      action={
        <Button onClick={handleExport} data-testid="export-analysis-button">
          Export JSON
        </Button>
      }
    >
      <section data-testid="overview-section">
        <StickyHeading title="Overview Stats" />
        <div className="grid gap-4 lg:grid-cols-4">
          <StatCard
            label="Median BPM"
            value={`${analysis.aggregates.tempo.median}`}
            helper={`${analysis.trackCount} analyzed tracks`}
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

      <section data-testid="cluster-map-section">
        <StickyHeading title="Energy × Valence Cluster Map" />
        <div className="grid gap-4 lg:grid-cols-2">
          {analysis.clusters.map((cluster) => (
            <Card key={cluster.id} data-testid={`cluster-card-${cluster.id}`}>
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
            <Card key={progression.roman}>
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
            <CardDescription>{analysis.drumPattern.context}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
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
          </CardContent>
        </Card>
      </section>
    </AnalysisShell>
  );
}

function AnalysisShell({
  playlistName,
  coverUrl,
  recentAnalyses,
  sidebarModeLabel,
  titleExtras,
  subtitle,
  action,
  children,
}: Readonly<{
  playlistName: string;
  coverUrl: string | null;
  recentAnalyses: RecentAnalysis[];
  sidebarModeLabel: string;
  titleExtras: React.ReactNode;
  subtitle: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}>) {
  return (
    <div className="chipmap-grid bg-background min-h-screen">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-390 flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6">
        <aside className="chipmap-panel border-border flex w-full flex-col rounded-[28px] border p-4 lg:max-w-[320px]">
          <div className="border-border/70 flex items-center gap-3 border-b px-2 pb-5">
            <ChipmapLogo className="h-12 w-12" />
            <div>
              <p className="font-semibold">Chipmap</p>
              <p className="text-muted-foreground text-sm">
                {sidebarModeLabel}
              </p>
            </div>
          </div>

          <Button asChild className="mt-5" data-testid="button-analyse-another">
            <Link href="/">Analyse another →</Link>
          </Button>

          <div className="mt-6 flex-1 space-y-3">
            <div className="text-muted-foreground px-2 text-xs font-semibold tracking-[0.18em] uppercase">
              Recent Analyses
            </div>
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
                    <p className="truncate font-medium">{entry.playlistName}</p>
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
                      {titleExtras}
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                      {subtitle}
                    </p>
                  </div>
                </div>

                {action ?? null}
              </div>
            </div>

            <div className="space-y-8">{children}</div>
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
  formatter = (input: number) => input.toFixed(3),
  testId,
}: Readonly<{
  label: string;
  value: number;
  formatter?: (value: number) => string;
  testId: string;
}>) {
  return (
    <Card data-testid={testId}>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{formatter(value)}</CardTitle>
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
}: Readonly<{ label: string; value: string }>) {
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
  const stepValues = steps.split("");

  return (
    <div
      className="grid grid-cols-[40px_1fr] items-center gap-3"
      data-testid={testId}
    >
      <span className="text-muted-foreground font-mono text-sm">{label}</span>
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${stepValues.length}, minmax(0, 1fr))`,
        }}
      >
        {stepValues.map((step, index) => (
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

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function openPrintWindow(html: string, title: string) {
  const printWindow = window.open("", "_blank", "noopener,noreferrer");

  if (!printWindow) {
    downloadFile(`${title}.html`, html, "text/html");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  window.setTimeout(() => {
    printWindow.print();
  }, 250);
}
