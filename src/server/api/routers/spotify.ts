import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { analyzeFeatures } from "~/lib/analysis";
import { APP_ERROR_CODES, AppError } from "~/lib/errors";
import {
  SpotifyApiError,
  getAllAudioFeatures,
  getPlaylist,
  getPlaylistTracks,
  resolvePlaylistId,
} from "~/lib/spotify-api";
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
        throw toTrpcSpotifyError(error, "playlist");
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
        throw toTrpcSpotifyError(error, "playlist");
      }

      if (tracks.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Playlist has no analyzable tracks.",
        });
      }

      let features;

      try {
        features = await getAllAudioFeatures(tracks.map((track) => track.id));
      } catch (error) {
        throw toTrpcSpotifyError(error, "audio-features");
      }

      const featureMap = new Map(features.map((feature) => [feature.id, feature]));
      const analyzableTracks = tracks.filter((track) => featureMap.has(track.id));
      const orderedFeatures = analyzableTracks.map((track) => featureMap.get(track.id)!);

      if (orderedFeatures.length === 0) {
        throw new TRPCError({
          code: "BAD_GATEWAY",
          message:
            "Spotify blocked audio-feature access for this app. Please try again later.",
          cause: new AppError(APP_ERROR_CODES.SPOTIFY_AUDIO_FEATURES_UNAVAILABLE),
        });
      }

      const analysis = analyzeFeatures(
        analyzableTracks.map((track) => ({
          id: track.id,
          name: track.name,
        })),
        orderedFeatures,
      );
      const analyzedAt = new Date();
      const coverUrl = playlist.images[0]?.url ?? null;
      const trackCount = analyzableTracks.length;

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
});

function toTrpcSpotifyError(
  error: unknown,
  context: "playlist" | "audio-features",
) {
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

    if (error.status === 403 && context === "audio-features") {
      return new TRPCError({
        code: "BAD_GATEWAY",
        message:
          "Spotify blocked audio-feature access for this app. Please try again later.",
        cause: new AppError(APP_ERROR_CODES.SPOTIFY_AUDIO_FEATURES_UNAVAILABLE),
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
