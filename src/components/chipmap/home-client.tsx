"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";

import { APP_ERROR_CODES } from "~/lib/errors";
import { ChipmapLogo } from "~/components/chipmap/logo";
import { SiteFooter } from "~/components/chipmap/site-footer";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/react";

type HomeClientProps = {
  notice: string | null;
};

export function HomeClient({ notice }: HomeClientProps) {
  const router = useRouter();
  const utils = api.useUtils();
  const [inputValue, setInputValue] = useState("");
  const [debouncedInput, setDebouncedInput] = useState("");
  const [analysisStep, setAnalysisStep] = useState<"tracks" | "features">(
    "tracks",
  );
  const analyzeMutation = api.spotify.analyzePlaylist.useMutation({
    retry: false,
    onSuccess: async (result) => {
      await utils.spotify.getRecentAnalyses.invalidate();
      router.push(`/analysis/${result.playlist.id}`);
    },
  });

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedInput(inputValue.trim());
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [inputValue]);

  useEffect(() => {
    if (!analyzeMutation.isPending) {
      return;
    }

    setAnalysisStep("tracks");
    const timeout = window.setTimeout(() => {
      setAnalysisStep("features");
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, [analyzeMutation.isPending]);

  const previewQuery = api.spotify.previewPlaylist.useQuery(
    { input: debouncedInput },
    {
      enabled: debouncedInput.length > 0,
      retry: false,
    },
  );
  const recentAnalysesQuery = api.spotify.getRecentAnalyses.useQuery(undefined, {
    retry: false,
  });

  const preview = previewQuery.data;
  const playlistPreview = !previewQuery.isFetching ? preview ?? null : null;
  const previewError =
    debouncedInput.length > 0 && previewQuery.isError
      ? "Couldn't find that playlist — make sure it's public and the link is correct"
      : null;
  const analyzeError = getAnalysisErrorMessage(
    analyzeMutation.error?.data?.appErrorCode,
    analyzeMutation.error?.message,
  );

  return (
    <div className="chipmap-grid bg-background min-h-screen">
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl">
          {notice ? (
            <div
              className="border-border bg-card/95 fixed right-4 top-4 z-40 max-w-sm rounded-2xl border px-4 py-3 text-sm shadow-[0_18px_50px_rgba(0,0,0,0.35)]"
              data-testid="landing-notice"
            >
              {notice}
            </div>
          ) : null}

          <div className="mx-auto max-w-2xl text-center">
            <ChipmapLogo className="mx-auto mb-6 h-20 w-20" />
            <h1
              className="text-2xl font-semibold tracking-tight text-white sm:text-4xl"
              data-testid="landing-title"
            >
              Turn any playlist into game music
            </h1>
            <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-sm sm:text-base">
              Paste a public Spotify playlist link to analyse BPM, key, energy
              and get an 8-bit starter pack
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Paste a Spotify playlist URL, URI, or ID…"
                className="border-border bg-card/90 text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-accent/30 h-14 w-full rounded-2xl border px-5 pr-14 text-sm outline-none transition focus:ring-4"
                data-testid="input-playlist-url"
              />
              {previewQuery.isFetching ? (
                <LoaderCircle className="text-muted-foreground absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin" />
              ) : null}
            </div>

            {previewError ? (
              <p
                className="mt-3 text-sm text-red-400"
                data-testid="playlist-preview-error"
              >
                {previewError}
              </p>
            ) : null}

            {playlistPreview ? (
              <Card
                className="chipmap-panel mt-5 animate-[preview-rise_240ms_ease-out]"
                data-testid="card-playlist-preview"
              >
                <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="bg-secondary relative h-[60px] w-[60px] overflow-hidden rounded-2xl">
                      {playlistPreview.coverUrl ? (
                        <Image
                          src={playlistPreview.coverUrl}
                          alt={playlistPreview.name}
                          fill
                          className="object-cover"
                          sizes="60px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ChipmapLogo className="h-10 w-10" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold">
                        {playlistPreview.name}
                      </p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {playlistPreview.owner} · {playlistPreview.trackCount} track
                        {playlistPreview.trackCount === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    {analyzeMutation.isPending ? (
                      <div
                        className="inline-flex flex-col items-start gap-2 sm:items-end"
                        data-testid="analysis-progress-message"
                      >
                        <div className="inline-flex items-center gap-2 text-sm font-medium">
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                          Analysing {playlistPreview.trackCount} tracks…
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {analysisStep === "tracks"
                            ? "Fetching tracks…"
                            : "Analysing audio features…"}
                        </p>
                      </div>
                    ) : (
                      <Button
                        onClick={() =>
                          analyzeMutation.mutate({
                            playlistId: playlistPreview.id,
                          })
                        }
                        data-testid="button-analyse"
                      >
                        Analyse Playlist
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {analyzeError ? (
              <div
                className="border-border bg-card/90 mt-4 rounded-2xl border px-4 py-3 text-sm text-red-300"
                data-testid="analysis-inline-error"
              >
                {analyzeError}
              </div>
            ) : null}
          </div>

          {recentAnalysesQuery.isLoading ? (
            <section className="mx-auto mt-14 max-w-5xl" data-testid="recent-analyses-loading">
              <h2 className="mb-4 text-lg font-semibold tracking-tight">
                Recently Analysed
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Card key={`recent-skeleton-${index}`} className="w-60 shrink-0">
                    <Skeleton className="h-32 rounded-b-none rounded-t-3xl" />
                    <CardContent className="space-y-3 p-4">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ) : recentAnalysesQuery.data && recentAnalysesQuery.data.length > 0 ? (
            <section className="mx-auto mt-14 max-w-5xl" data-testid="recent-analyses-section">
              <h2 className="mb-4 text-lg font-semibold tracking-tight">
                Recently Analysed
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {recentAnalysesQuery.data.map((entry) => (
                  <Card
                    key={entry.playlistId}
                    className="chipmap-panel w-60 shrink-0 overflow-hidden"
                    data-testid={`card-recent-${entry.playlistId}`}
                  >
                    <div className="bg-secondary relative aspect-[16/10] overflow-hidden">
                      {entry.coverUrl ? (
                        <Image
                          src={entry.coverUrl}
                          alt={entry.playlistName}
                          fill
                          className="object-cover"
                          sizes="240px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ChipmapLogo className="h-12 w-12 opacity-80" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <p className="line-clamp-1 font-medium">{entry.playlistName}</p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <Badge
                          variant={
                            entry.era === "NES"
                              ? "amber"
                              : entry.era === "SNES"
                                ? "purple"
                                : "teal"
                          }
                        >
                          {entry.era}
                        </Badge>
                        <Link
                          href={`/analysis/${entry.playlistId}`}
                          className="text-accent text-sm font-medium"
                        >
                          View →
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function getAnalysisErrorMessage(
  appErrorCode: string | null | undefined,
  fallbackMessage: string | undefined,
) {
  if (appErrorCode === APP_ERROR_CODES.SPOTIFY_API_UNAVAILABLE) {
    return "Spotify API unavailable — check back soon.";
  }

  if (appErrorCode === APP_ERROR_CODES.SPOTIFY_AUDIO_FEATURES_UNAVAILABLE) {
    return "Spotify blocked audio-feature access for this app. Please try again later.";
  }

  if (appErrorCode === APP_ERROR_CODES.SPOTIFY_PLAYLIST_NOT_PUBLIC) {
    return "Playlist not found or is private. Only public playlists are supported.";
  }

  return fallbackMessage ?? null;
}
