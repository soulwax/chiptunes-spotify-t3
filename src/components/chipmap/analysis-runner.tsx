"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { APP_ERROR_CODES } from "~/lib/errors";
import { ChipmapLogo } from "~/components/chipmap/logo";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { authClient } from "~/server/better-auth/client";
import { api } from "~/trpc/react";

export function AnalysisRunner({
  playlistId,
}: Readonly<{ playlistId: string }>) {
  const router = useRouter();
  const mutation = api.spotify.analyzePlaylist.useMutation({
    retry: false,
    onSuccess: (result) => {
      router.replace(`/analysis/${result.playlistId}`);
      router.refresh();
    },
  });

  useEffect(() => {
    if (mutation.status === "idle") {
      mutation.mutate({ playlistId });
    }
  }, [mutation, playlistId]);

  useEffect(() => {
    if (
      mutation.error?.data?.appErrorCode !== APP_ERROR_CODES.SPOTIFY_TOKEN_EXPIRED
    ) {
      return;
    }

    void authClient.signOut().finally(() => {
      router.replace("/");
    });
  }, [mutation.error?.data?.appErrorCode, router]);

  if (mutation.isError) {
    return (
      <div className="chipmap-grid flex min-h-screen items-center justify-center bg-background px-4 py-8">
        <Card className="w-full max-w-xl" data-testid="analysis-error-state">
          <CardHeader>
            <CardTitle>We couldn&apos;t analyze that playlist.</CardTitle>
            <CardDescription>{mutation.error.message}</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button
              onClick={() => mutation.mutate({ playlistId })}
              data-testid="analysis-retry-button"
            >
              Retry Analysis
            </Button>
            <Button asChild variant="outline" data-testid="analysis-back-button">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="chipmap-grid flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Card
        className="w-full max-w-2xl overflow-hidden border-accent/30 bg-card/95"
        data-testid="analysis-progress-indicator"
      >
        <div className="h-2 bg-[linear-gradient(90deg,hsl(var(--accent)),hsl(var(--purple)),hsl(var(--amber)),hsl(var(--accent)))] bg-[length:200%_100%] animate-[progress-pan_2.5s_linear_infinite]" />
        <CardContent className="p-8 sm:p-10">
          <div className="mb-6 flex items-center gap-4">
            <ChipmapLogo className="h-16 w-16 animate-pulse" />
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                Running Analysis
              </p>
              <h1 className="text-3xl font-semibold tracking-tight">
                Mapping your playlist
              </h1>
            </div>
          </div>

          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Chipmap is pulling your Spotify tracks, batching audio features, and
            translating the results into a retro starter pack. Large playlists
            can take a few seconds.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              "Fetching playlist tracks",
              "Collecting audio features",
              "Building game-music starter pack",
            ].map((step, index) => (
              <div
                key={step}
                className="rounded-2xl border border-border bg-secondary/50 p-4"
              >
                <div className="mb-3 h-2 overflow-hidden rounded-full bg-background">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${70 + index * 10}%` }}
                  />
                </div>
                <p className="text-sm font-medium">{step}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
