"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogOut, Music2, Sparkles } from "lucide-react";

import { APP_ERROR_CODES } from "~/lib/errors";
import { ChipmapLogo } from "~/components/chipmap/logo";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { authClient } from "~/server/better-auth/client";
import { api } from "~/trpc/react";

type UserProfile = {
  name: string | null;
  email: string | null;
  image: string | null;
};

type CachedAnalysis = {
  id: string;
  playlistId: string;
  playlistName: string;
  createdAt: string | Date;
  analysis: {
    era: "NES" | "SNES" | "Genesis";
  };
};

type Playlist = {
  accessLabel: string;
  canAnalyze: boolean;
  id: string;
  name: string;
  imageUrl: string | null;
  ownerName: string | null;
  trackCount: number;
};

type DashboardClientProps = {
  user: UserProfile;
};

export function DashboardClient({ user }: DashboardClientProps) {
  const router = useRouter();
  const playlistsQuery = api.spotify.getPlaylists.useQuery(undefined, {
    retry: false,
  });
  const cachedAnalysesQuery = api.spotify.getCachedAnalyses.useQuery(
    undefined,
    {
      retry: false,
    },
  );

  useEffect(() => {
    const hasExpiredToken =
      playlistsQuery.error?.data?.appErrorCode ===
        APP_ERROR_CODES.SPOTIFY_TOKEN_EXPIRED ||
      cachedAnalysesQuery.error?.data?.appErrorCode ===
        APP_ERROR_CODES.SPOTIFY_TOKEN_EXPIRED;

    if (!hasExpiredToken) {
      return;
    }

    void authClient.signOut().finally(() => {
      router.replace("/");
    });
  }, [
    cachedAnalysesQuery.error?.data?.appErrorCode,
    playlistsQuery.error?.data?.appErrorCode,
    router,
  ]);

  async function handleSignOut() {
    await authClient.signOut();
    router.replace("/");
  }

  const initials = (user.name ?? user.email ?? "C")
    .split(" ")
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);

  return (
    <div className="chipmap-grid bg-background min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-390 flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6">
        <aside className="chipmap-panel border-border flex w-full flex-col rounded-[28px] border p-4 lg:max-w-[320px]">
          <div className="border-border/70 flex items-center gap-4 border-b px-2 pb-5">
            <div
              className="border-border bg-secondary flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border text-lg font-semibold"
              data-testid="dashboard-user-avatar"
            >
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name ?? "Chipmap user"}
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0">
              <p
                className="truncate text-base font-semibold"
                data-testid="dashboard-user-name"
              >
                {user.name ?? "Spotify Listener"}
              </p>
              <p className="text-muted-foreground truncate text-sm">
                {user.email}
              </p>
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <Button
              asChild
              className="flex-1"
              data-testid="new-analysis-button"
            >
              <Link href="#playlist-grid">
                <Sparkles className="h-4 w-4" />
                New Analysis
              </Link>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => void handleSignOut()}
              data-testid="sign-out-button"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-6 flex-1">
            <div className="text-muted-foreground mb-3 flex items-center gap-2 px-2 text-xs font-semibold tracking-[0.18em] uppercase">
              <Music2 className="h-4 w-4" />
              Cached Analyses
            </div>

            <div className="space-y-3">
              {cachedAnalysesQuery.isLoading &&
                Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`cached-skeleton-${index}`}
                    className="border-border/70 bg-card/80 rounded-2xl border p-4"
                  >
                    <Skeleton className="mb-3 h-4 w-2/3" />
                    <Skeleton className="h-7 w-24 rounded-full" />
                  </div>
                ))}

              {cachedAnalysesQuery.data?.map((entry: CachedAnalysis) => (
                <Link
                  key={entry.id}
                  href={`/analysis/${entry.playlistId}`}
                  className="border-border/70 bg-card/85 hover:border-accent/60 hover:bg-card block rounded-2xl border p-4 transition"
                  data-testid={`cached-analysis-${entry.playlistId}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {entry.playlistName}
                      </p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        Saved {new Date(entry.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <EraBadge era={entry.analysis.era} />
                  </div>
                </Link>
              ))}

              {cachedAnalysesQuery.data?.length === 0 && (
                <Card data-testid="cached-analyses-empty">
                  <CardContent className="text-muted-foreground p-5 text-sm">
                    Your saved starter packs will show up here after the first
                    playlist analysis.
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="border-accent/25 bg-accent/10 mt-6 rounded-2xl border p-4">
            <div className="mb-3 flex items-center gap-3">
              <ChipmapLogo className="h-11 w-11" />
              <div>
                <p className="text-sm font-semibold">Chipmap</p>
                <p className="text-muted-foreground text-xs">
                  Turn your playlist into game music
                </p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Import playlist metadata from Spotify, export canonical manifests,
              and turn genre and era signals into retro composition prompts.
            </p>
          </div>
        </aside>

        <main className="flex-1">
          <div className="mb-6 flex items-end justify-between gap-4 px-1">
            <div>
              <p className="text-accent mb-2 text-xs font-semibold tracking-[0.22em] uppercase">
                Dashboard
              </p>
              <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
                Pick a playlist to map.
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm sm:text-base">
                Chipmap imports Spotify playlist metadata, then turns genres,
                release eras, runtime, and artist signals into a soundtrack
                brief you can export and build on.
              </p>
            </div>
          </div>

          <section id="playlist-grid" data-testid="playlist-grid">
            <div
              className="border-border/70 bg-card/70 mb-4 rounded-2xl border p-4 text-sm text-muted-foreground"
              data-testid="playlist-access-note"
            >
              Spotify currently lets this app import playlist items only for
              playlists you own or collaborate on. Followed playlists from
              other owners may appear as view-only here.
            </div>

            {playlistsQuery.isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card
                    key={`playlist-skeleton-${index}`}
                    className="overflow-hidden"
                  >
                    <Skeleton className="aspect-square rounded-none" />
                    <CardContent className="space-y-3 p-5">
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : playlistsQuery.data ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {playlistsQuery.data.map((playlist: Playlist) => (
                  <button
                    key={playlist.id}
                    type="button"
                    onClick={(): void =>
                      router.push(`/analysis/${playlist.id}?run=1`)
                    }
                    className="group border-border bg-card overflow-hidden rounded-3xl border text-left transition hover:border-accent/60 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(0,0,0,0.3)] disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:opacity-70"
                    data-testid={`playlist-card-${playlist.id}`}
                    disabled={!playlist.canAnalyze}
                  >
                    <div className="bg-secondary relative aspect-square overflow-hidden">
                      {playlist.imageUrl ? (
                        <Image
                          src={playlist.imageUrl}
                          alt={playlist.name}
                          fill
                          className="object-cover transition duration-300 group-hover:scale-[1.03]"
                          sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,hsl(var(--accent)/0.28),transparent_48%)]">
                          <ChipmapLogo className="h-20 w-20 opacity-80" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h2 className="line-clamp-2 text-lg font-semibold">
                          {playlist.name}
                        </h2>
                        <Badge
                          variant={playlist.canAnalyze ? "teal" : "default"}
                          data-testid={`playlist-access-label-${playlist.id}`}
                        >
                          {playlist.canAnalyze ? "Import" : playlist.accessLabel}
                        </Badge>
                      </div>
                      <p
                        className="text-muted-foreground text-sm"
                        data-testid={`playlist-track-count-${playlist.id}`}
                      >
                        {playlist.trackCount} track
                        {playlist.trackCount === 1 ? "" : "s"}
                      </p>
                      <p
                        className="text-muted-foreground mt-2 text-sm"
                        data-testid={`playlist-owner-${playlist.id}`}
                      >
                        {playlist.ownerName
                          ? `Owner: ${playlist.ownerName}`
                          : "Owner unavailable"}
                      </p>
                      {!playlist.canAnalyze ? (
                        <p
                          className="mt-3 text-sm text-amber-400"
                          data-testid={`playlist-analysis-disabled-${playlist.id}`}
                        >
                          Pick an owned or collaborative playlist to import
                          this in Chipmap.
                        </p>
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <Card data-testid="playlists-error">
                <CardHeader>
                  <CardTitle>Spotify playlists are unavailable</CardTitle>
                  <CardDescription>
                    Refresh the page or sign in again to reconnect your account.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function EraBadge({ era }: Readonly<{ era: "NES" | "SNES" | "Genesis" }>) {
  const variant = era === "NES" ? "amber" : era === "SNES" ? "purple" : "teal";

  return <Badge variant={variant}>{era}</Badge>;
}
