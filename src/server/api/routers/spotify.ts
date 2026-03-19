import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { APP_ERROR_CODES, AppError } from "~/lib/errors";
import {
  buildStarterPackBrief,
  analyzePlaylistMetadata,
  isMetadataAnalysis,
} from "~/lib/metadata-analysis";
import {
  SpotifyApiError,
  getArtistsByIds,
  getPlaylist,
  getPlaylistTracks,
  resolvePlaylistId,
} from "~/lib/spotify-api";
import { toFileNameBase } from "~/lib/utils";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { cachedAnalyses } from "~/server/db/schema";

const ANALYSIS_CACHE_WINDOW_MS = 24 * 60 * 60 * 1000;

export const spotifyRouter = createTRPCRouter({
  previewPlaylist: publicProcedure
    .input(z.object({ input: z.string().min(1) }))
    .query(async ({ input }) => {
      const playlistId = resolvePlaylistId(input.input);

      if (!playlistId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid Spotify playlist URL or ID",
        });
      }

      try {
        const playlist = await getPlaylist(playlistId);

        return {
          id: playlist.id,
          name: playlist.name,
          description: playlist.description,
          coverUrl: playlist.images[0]?.url ?? null,
          owner: playlist.owner.display_name,
          trackCount: playlist.tracks.total,
        };
      } catch (error) {
        throw toTrpcSpotifyError(error);
      }
    }),

  analyzePlaylist: publicProcedure
    .input(z.object({ playlistId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const cachedAnalysis = await ctx.db.query.cachedAnalyses.findFirst({
        where: eq(cachedAnalyses.playlistId, input.playlistId),
      });

      if (
        cachedAnalysis &&
        isMetadataAnalysis(cachedAnalysis.analysisJson) &&
        cachedAnalysis.analyzedAt.getTime() >=
          Date.now() - ANALYSIS_CACHE_WINDOW_MS
      ) {
        return {
          analysis: cachedAnalysis.analysisJson,
          fromCache: true,
          playlist: {
            coverUrl: cachedAnalysis.coverUrl,
            id: cachedAnalysis.playlistId,
            name: cachedAnalysis.playlistName,
            owner: null,
            trackCount: cachedAnalysis.trackCount,
          },
        };
      }

      let playlist;
      let tracks;

      try {
        [playlist, tracks] = await Promise.all([
          getPlaylist(input.playlistId),
          getPlaylistTracks(input.playlistId),
        ]);
      } catch (error) {
        throw toTrpcSpotifyError(error);
      }

      if (tracks.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Playlist has no importable tracks.",
        });
      }

      try {
        const artistGenres = await getArtistsByIds(
          tracks.flatMap((track) =>
            track.artists
              .map((artist) => artist.id)
              .filter((artistId): artistId is string => Boolean(artistId)),
          ),
        );

        const analysis = analyzePlaylistMetadata({
          artistGenres: new Map(
            [...artistGenres.entries()].map(([spotifyId, artist]) => [
              spotifyId,
              {
                genres: artist.genres,
                name: artist.name,
                spotifyId,
              },
            ]),
          ),
          playlistId: playlist.id,
          playlistName: playlist.name,
          tracks: tracks.map((track) => ({
            album: {
              imageUrl: track.album.images[0]?.url ?? null,
              name: track.album.name,
              releaseDate: track.album.release_date,
              releaseYear: parseReleaseYear(track.album.release_date),
              spotifyId: track.album.id,
            },
            artists: track.artists.map((artist) => ({
              name: artist.name,
              spotifyId: artist.id,
            })),
            durationMs: track.duration_ms,
            explicit: track.explicit,
            isrc: track.external_ids?.isrc ?? null,
            name: track.name,
            popularity: track.popularity,
            spotifyId: track.id,
            spotifyUrl: track.external_urls?.spotify ?? null,
          })),
        });
        const analyzedAt = new Date();
        const coverUrl = playlist.images[0]?.url ?? null;
        const trackCount = tracks.length;

        await ctx.db
          .insert(cachedAnalyses)
          .values({
            playlistId: playlist.id,
            playlistName: playlist.name,
            coverUrl,
            trackCount,
            era: analysis.era,
            analysisJson: analysis,
            analyzedAt,
          })
          .onConflictDoUpdate({
            target: cachedAnalyses.playlistId,
            set: {
              playlistName: playlist.name,
              coverUrl,
              trackCount,
              era: analysis.era,
              analysisJson: analysis,
              analyzedAt,
            },
          });

        return {
          analysis,
          fromCache: false,
          playlist: {
            coverUrl,
            id: playlist.id,
            name: playlist.name,
            owner: playlist.owner.display_name,
            trackCount,
          },
        };
      } catch (error) {
        throw toTrpcSpotifyError(error);
      }
    }),

  getRecentAnalyses: publicProcedure.query(async ({ ctx }) => {
    const analyses = await ctx.db.query.cachedAnalyses.findMany({
      orderBy: [desc(cachedAnalyses.analyzedAt)],
      limit: 20,
    });

    return analyses.map((entry) => ({
      analyzedAt: entry.analyzedAt,
      coverUrl: entry.coverUrl,
      era: entry.era,
      playlistId: entry.playlistId,
      playlistName: entry.playlistName,
      trackCount: entry.trackCount,
    }));
  }),

  getAnalysis: publicProcedure
    .input(z.object({ playlistId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const entry = await ctx.db.query.cachedAnalyses.findFirst({
        where: eq(cachedAnalyses.playlistId, input.playlistId),
      });

      if (!entry) {
        return null;
      }

      return {
        analysis: entry.analysisJson,
        analyzedAt: entry.analyzedAt,
        coverUrl: entry.coverUrl,
        era: entry.era,
        playlistId: entry.playlistId,
        playlistName: entry.playlistName,
        trackCount: entry.trackCount,
      };
    }),

  exportAnalysis: publicProcedure
    .input(z.object({ playlistId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const entry = await ctx.db.query.cachedAnalyses.findFirst({
        where: eq(cachedAnalyses.playlistId, input.playlistId),
      });

      if (!entry) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No cached analysis was found for that playlist.",
        });
      }

      if (!isMetadataAnalysis(entry.analysisJson)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "This cached analysis uses the older audio-feature format. Re-run the playlist to generate the metadata-first starter pack.",
        });
      }

      const starterPack = buildStarterPackBrief({
        analysis: entry.analysisJson,
        playlistName: entry.playlistName,
      });

      return {
        analysis: entry.analysisJson,
        filenameBase: toFileNameBase(entry.playlistName, entry.playlistId),
        manifest: entry.analysisJson.manifest,
        pdfHtml: starterPack.html,
        playlistId: entry.playlistId,
        playlistName: entry.playlistName,
        sections: starterPack.sections,
        starterPackMarkdown: starterPack.markdown,
      };
    }),
});

function toTrpcSpotifyError(error: unknown) {
  if (error instanceof SpotifyApiError) {
    if (error.status === 404) {
      return new TRPCError({
        code: "NOT_FOUND",
        message:
          "Playlist not found or is private. Only public playlists are supported.",
        cause: new AppError(APP_ERROR_CODES.SPOTIFY_PLAYLIST_NOT_PUBLIC),
      });
    }

    if (error.status === 401) {
      console.error("[Spotify] Client credentials request failed:", error.message);
      return new TRPCError({
        code: "SERVICE_UNAVAILABLE",
        message: "Spotify API unavailable — check back soon.",
        cause: new AppError(APP_ERROR_CODES.SPOTIFY_API_UNAVAILABLE),
      });
    }

    if (error.status === 400 && error.message.toLowerCase().includes("invalid client")) {
      console.error("[Spotify] Invalid client credentials:", error.message);
      return new TRPCError({
        code: "SERVICE_UNAVAILABLE",
        message: "Spotify API unavailable — check back soon.",
        cause: new AppError(APP_ERROR_CODES.SPOTIFY_API_UNAVAILABLE),
      });
    }

    console.error("[Spotify] Upstream request failed:", error.status, error.message);
    return new TRPCError({
      code: "BAD_GATEWAY",
      message: "Spotify API unavailable — check back soon.",
    });
  }

  console.error("[Spotify] Unexpected error:", error);
  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Spotify API unavailable — check back soon.",
  });
}

function parseReleaseYear(releaseDate: string | null) {
  if (!releaseDate) {
    return null;
  }

  const year = Number.parseInt(releaseDate.slice(0, 4), 10);
  return Number.isFinite(year) ? year : null;
}
