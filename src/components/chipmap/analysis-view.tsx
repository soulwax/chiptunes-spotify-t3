"use client";

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

export function AnalysisView({
  playlistId,
  playlistName,
  analysis,
}: AnalysisViewProps) {
  function handleExport() {
    const blob = new Blob([JSON.stringify(analysis, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${
      playlistName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || playlistId
    }-chipmap-analysis.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="chipmap-grid bg-background min-h-screen px-4 py-4 lg:px-6">
      <div className="border-border bg-background/90 mx-auto max-w-350 rounded-[30px] border p-5 shadow-[0_24px_90px_rgba(0,0,0,0.26)] sm:p-7">
        <div className="border-border/80 mb-8 flex flex-col gap-4 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-accent mb-2 text-xs font-semibold tracking-[0.22em] uppercase">
              Analysis
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {playlistName}
              </h1>
              <EraBadge era={analysis.era} />
            </div>
          </div>
          <Button onClick={handleExport} data-testid="export-analysis-button">
            Export JSON
          </Button>
        </div>

        <div className="space-y-8">
          <section data-testid="overview-section">
            <StickyHeading title="Overview Stats" />
            <div className="grid gap-4 lg:grid-cols-4">
              <StatCard
                label="Median BPM"
                value={`${analysis.aggregates.tempo.median}`}
                helper={`${analysis.bpmBucket.toUpperCase()} pacing`}
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
                helper={`${analysis.topKey.count} tracks in the dominant center`}
                testId="stat-top-key"
              />
            </div>
          </section>

          <section data-testid="bpm-distribution-section">
            <StickyHeading title="BPM Distribution" />
            <Card>
              <CardContent className="p-5 sm:p-6">
                <div className="h-80" data-testid="bpm-distribution-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analysis.bpmDistribution} layout="vertical">
                      <CartesianGrid
                        horizontal={false}
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        type="number"
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        dataKey="label"
                        type="category"
                        stroke="hsl(var(--muted-foreground))"
                        width={72}
                      />
                      <Tooltip
                        cursor={{ fill: "hsl(var(--secondary) / 0.45)" }}
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "16px",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                      <Bar dataKey="count" radius={[0, 10, 10, 0]}>
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
                  <div className="mb-2 flex items-center gap-3">
                    <Badge variant="teal">{analysis.bpmBucket}</Badge>
                    <span className="text-muted-foreground text-sm">
                      Median bucket highlighted in teal
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {analysis.bpmBucketDescription}
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          <section data-testid="cluster-map-section">
            <StickyHeading title="Energy x Valence Cluster Map" />
            <div className="grid gap-4 lg:grid-cols-2">
              {analysis.clusters.map((cluster) => (
                <Card key={cluster.id} data-testid={`cluster-${cluster.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle>{cluster.label}</CardTitle>
                      <Badge variant="teal">{cluster.count} tracks</Badge>
                    </div>
                    <CardDescription>
                      {cluster.suggestedGameCue}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-muted-foreground grid gap-3 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span>Target BPM</span>
                      <span className="text-foreground font-semibold">
                        {cluster.targetBpm}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Recommended Key</span>
                      <span className="text-foreground font-semibold">
                        {cluster.recommendedKey}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Waveform</span>
                      <span className="text-foreground font-semibold">
                        {cluster.waveformSuggestion}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section data-testid="chord-palette-section">
            <StickyHeading title="Chord Palette" />
            <div className="grid gap-4 xl:grid-cols-3">
              {analysis.chordPalette.map((progression) => (
                <Card
                  key={progression.roman}
                  data-testid={`chord-${progression.roman}`}
                >
                  <CardHeader>
                    <CardTitle className="font-mono text-base">
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
                <div className="flex flex-wrap items-center gap-3">
                  <CardTitle>{analysis.drumPattern.name}</CardTitle>
                  <Badge variant="amber">
                    {analysis.drumPattern.bpmBucket}
                  </Badge>
                </div>
                <CardDescription>
                  {analysis.drumPattern.context}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DrumRow
                  label="K"
                  pattern={analysis.drumPattern.kick}
                  colorClass="bg-[hsl(var(--amber))]"
                  testId="drum-kick-row"
                />
                <DrumRow
                  label="S"
                  pattern={analysis.drumPattern.snare}
                  colorClass="bg-accent"
                  testId="drum-snare-row"
                />
                <DrumRow
                  label="HH"
                  pattern={analysis.drumPattern.hiHat}
                  colorClass="bg-muted-foreground"
                  testId="drum-hihat-row"
                />
              </CardContent>
            </Card>
          </section>

          <section data-testid="sound-design-section">
            <StickyHeading title="Sound Design Reference" />
            <Card>
              <CardContent className="overflow-x-auto p-0">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-secondary/50 text-muted-foreground text-xs tracking-[0.18em] uppercase">
                    <tr>
                      <th className="px-5 py-4">Waveform</th>
                      <th className="px-5 py-4">Character</th>
                      <th className="px-5 py-4">Best Use</th>
                    </tr>
                  </thead>
                  <tbody data-testid="sound-design-table">
                    {analysis.soundDesignReference.map((row) => (
                      <tr key={row.waveform} className="border-border border-t">
                        <td className="text-foreground px-5 py-4 font-medium">
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

function DrumRow({
  label,
  pattern,
  colorClass,
  testId,
}: Readonly<{
  label: string;
  pattern: string;
  colorClass: string;
  testId: string;
}>) {
  return (
    <div className="mb-4 last:mb-0" data-testid={testId}>
      <div className="mb-2 flex items-center gap-3">
        <span className="text-muted-foreground w-8 font-mono text-sm">
          {label}
        </span>
        <span className="text-muted-foreground font-mono text-xs tracking-[0.2em]">
          {pattern}
        </span>
      </div>
      <div className="grid grid-cols-16 gap-2">
        {pattern.split("").map((step, index) => (
          <div
            key={`${label}-${index}`}
            className={`border-border h-6 rounded-md border ${step === "*" ? colorClass : "bg-secondary/70"}`}
          />
        ))}
      </div>
    </div>
  );
}
