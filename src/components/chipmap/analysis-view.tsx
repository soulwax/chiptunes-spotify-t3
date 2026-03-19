"use client";

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

import {
  formatDuration,
  isMetadataAnalysis,
  type ChipmapAnalysis,
  type ChipmapMetadataAnalysis,
} from "~/lib/metadata-analysis";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

type AnalysisViewProps = {
  playlistId: string;
  playlistName: string;
  analysis: ChipmapAnalysis;
};

const MIN_GENRE_BAR_WIDTH_PERCENT = 8;
const MIN_METER_BAR_WIDTH_PERCENT = 6;

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function AnalysisView({
  playlistId,
  playlistName,
  analysis,
}: AnalysisViewProps) {
  if (!isMetadataAnalysis(analysis)) {
    return <LegacyAnalysisNotice playlistId={playlistId} />;
  }

  return (
    <MetadataAnalysisView
      playlistId={playlistId}
      playlistName={playlistName}
      analysis={analysis}
    />
  );
}

function MetadataAnalysisView({
  playlistId,
  playlistName,
  analysis,
}: Readonly<{
  playlistId: string;
  playlistName: string;
  analysis: ChipmapMetadataAnalysis;
}>) {
  function downloadJson(filename: string, payload: unknown) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  const baseFilename =
    playlistName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || playlistId;

  return (
    <div className="chipmap-grid bg-background min-h-screen px-4 py-4 lg:px-6">
      <div className="border-border bg-background/90 mx-auto max-w-350 rounded-[30px] border p-5 shadow-[0_24px_90px_rgba(0,0,0,0.26)] sm:p-7">
        <div className="border-border/80 mb-8 flex flex-col gap-4 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-accent mb-2 text-xs font-semibold tracking-[0.22em] uppercase">
              Metadata-First Analysis
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <h1
                className="text-3xl font-semibold tracking-tight sm:text-4xl"
                data-testid="analysis-title"
              >
                {playlistName}
              </h1>
              <EraBadge era={analysis.era} />
              <Badge variant="green" data-testid="analysis-mode-badge">
                Canonical Manifest
              </Badge>
            </div>
            <p className="text-muted-foreground mt-3 max-w-2xl text-sm sm:text-base">
              Spotify can still import your playlist cleanly even when audio
              features are blocked. Chipmap now turns that metadata into a
              soundtrack brief and a reusable manifest for later open-audio
              analysis.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() =>
                downloadJson(
                  `${baseFilename}-chipmap-manifest.json`,
                  analysis.manifest,
                )
              }
              data-testid="export-manifest-button"
            >
              Export Manifest
            </Button>
            <Button
              onClick={() =>
                downloadJson(
                  `${baseFilename}-chipmap-metadata-analysis.json`,
                  analysis,
                )
              }
              data-testid="export-analysis-button"
            >
              Export Analysis
            </Button>
          </div>
        </div>

        <div className="space-y-8">
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
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <InlineMetric
                label="Median Popularity"
                testId="stat-median-popularity"
                value={`${analysis.popularity.median}`}
              />
              <InlineMetric
                label="Median Track Length"
                testId="stat-median-track-length"
                value={formatDuration(analysis.trackLength.median)}
              />
              <InlineMetric
                label="Median Release Year"
                testId="stat-median-release-year"
                value={
                  analysis.releaseProfile.medianYear
                    ? `${analysis.releaseProfile.medianYear}`
                    : "Unknown"
                }
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
                          {analysis.releaseProfile.distribution.map(
                            (bucket) => (
                              <Cell
                                key={bucket.label}
                                fill={
                                  bucket.isMedianBucket
                                    ? "hsl(var(--accent))"
                                    : "hsl(var(--secondary-foreground) / 0.32)"
                                }
                              />
                            ),
                          )}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div
                    className="text-muted-foreground border-border rounded-2xl border border-dashed p-8 text-sm"
                    data-testid="release-timeline-empty"
                  >
                    Release years were missing from the imported track metadata.
                  </div>
                )}

                <div className="border-border bg-secondary/45 mt-4 rounded-2xl border p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <Badge variant="teal">
                      {analysis.releaseProfile.earliestYear ?? "?"} to{" "}
                      {analysis.releaseProfile.latestYear ?? "?"}
                    </Badge>
                    <span className="text-muted-foreground text-sm">
                      Median decade highlighted in teal
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    This timeline becomes especially useful once you start
                    matching the manifest to local audio or archival metadata.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          <section data-testid="genre-section">
            <StickyHeading title="Genre Fingerprint" />
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
              {analysis.genres.map((genre) => (
                <Card
                  key={genre.genre}
                  data-testid={`genre-${genre.genre.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{genre.genre}</CardTitle>
                    <CardDescription>
                      {genre.count} tracks tagged
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-secondary h-2 rounded-full">
                      <div
                        className="bg-accent h-2 rounded-full"
                        style={{
                          width: `${Math.max(MIN_GENRE_BAR_WIDTH_PERCENT, genre.share * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-muted-foreground mt-3 text-sm">
                      {Math.round(genre.share * 100)}% of imported tracks carry
                      this signal.
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
                    data-testid="soundtrack-profile-reason"
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
                      <p className="text-muted-foreground">
                        {cue.instrumentation}
                      </p>
                    </div>
                    <div>
                      <p className="text-foreground mb-1 font-medium">
                        Why this cue fits
                      </p>
                      <p className="text-muted-foreground">{cue.rationale}</p>
                    </div>
                    <div>
                      <p className="text-foreground mb-2 font-medium">
                        Source tracks
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {cue.sourceTracks.map((trackName) => (
                          <Badge
                            key={trackName}
                            variant="default"
                            data-testid={`cue-track-${cue.id}`}
                          >
                            {trackName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section data-testid="manifest-preview-section">
            <StickyHeading title="Canonical Manifest Preview" />
            <Card>
              <CardContent className="overflow-x-auto p-0">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-secondary/50 text-muted-foreground text-xs tracking-[0.18em] uppercase">
                    <tr>
                      <th className="px-5 py-4">Track</th>
                      <th className="px-5 py-4">Artists</th>
                      <th className="px-5 py-4">Album</th>
                      <th className="px-5 py-4">Year</th>
                      <th className="px-5 py-4">ISRC</th>
                    </tr>
                  </thead>
                  <tbody data-testid="manifest-preview-table">
                    {analysis.manifest.tracks.slice(0, 12).map((track) => (
                      <tr
                        key={track.spotifyId}
                        className="border-border border-t"
                      >
                        <td className="px-5 py-4">
                          <div className="text-foreground font-medium">
                            {track.title}
                          </div>
                          <div className="text-muted-foreground mt-1">
                            {formatDuration(track.durationMs)}
                          </div>
                        </td>
                        <td className="text-muted-foreground px-5 py-4">
                          {track.artists
                            .map((artist) => artist.name)
                            .join(", ")}
                        </td>
                        <td className="text-muted-foreground px-5 py-4">
                          {track.albumName}
                        </td>
                        <td className="text-muted-foreground px-5 py-4">
                          {track.releaseYear ?? "Unknown"}
                        </td>
                        <td className="text-muted-foreground px-5 py-4 font-mono">
                          {track.isrc ?? "Missing"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </section>

          <section data-testid="next-steps-section">
            <StickyHeading title="Next Steps" />
            <div className="grid gap-3">
              {analysis.nextSteps.map((step) => (
                <Card key={step} data-testid="next-step-card">
                  <CardContent className="text-muted-foreground p-5 text-sm">
                    {step}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function LegacyAnalysisNotice({
  playlistId,
}: Readonly<{
  playlistId: string;
}>) {
  return (
    <div className="chipmap-grid bg-background flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-xl" data-testid="legacy-analysis-notice">
        <CardHeader>
          <CardTitle>
            That cached analysis uses the old audio-feature mode.
          </CardTitle>
          <CardDescription>
            Chipmap now runs in metadata-first mode because Spotify blocks audio
            features for this app. Re-run the playlist to import a canonical
            manifest and generate the new soundtrack brief.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button asChild data-testid="rerun-metadata-analysis-button">
            <Link href={`/analysis/${playlistId}?run=1`}>Re-run Playlist</Link>
          </Button>
          <Button asChild variant="outline" data-testid="legacy-back-button">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
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
  formatter = formatPercent,
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
            style={{
              width: `${Math.max(MIN_METER_BAR_WIDTH_PERCENT, value * 100)}%`,
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function InlineMetric({
  label,
  testId,
  value,
}: Readonly<{
  label: string;
  testId: string;
  value: string;
}>) {
  return (
    <div
      className="border-border bg-card flex items-center justify-between rounded-2xl border px-4 py-3"
      data-testid={testId}
    >
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-foreground font-semibold">{value}</span>
    </div>
  );
}
