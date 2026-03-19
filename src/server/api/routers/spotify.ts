import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { analyzeFeatures } from "~/lib/analysis";
import { APP_ERROR_CODES, AppError } from "~/lib/errors";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { cachedAnalyses } from "~/server/db/schema";
import {
  getAllPlaylists,
  getAudioFeatures,
  getPlaylistMetadata,
  getPlaylistTracks,
} from "~/server/spotify/client";

const spotifyProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.session.spotifyAccessToken) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: APP_ERROR_CODES.SPOTIFY_TOKEN_EXPIRED,
      cause: new AppError(APP_ERROR_CODES.SPOTIFY_TOKEN_EXPIRED),
    });
  }

  return next({
    ctx: {
      session: {
        ...ctx.session,
        spotifyAccountId: ctx.session.spotifyAccountId,
        spotifyAccessToken: ctx.session.spotifyAccessToken,
      },
    },
  });
});

export const spotifyRouter = createTRPCRouter({
  getPlaylists: spotifyProcedure.query(async ({ ctx }) => {
    const playlists = await getAllPlaylists(ctx.session.spotifyAccessToken);

    return playlists.map((playlist) => ({
      accessLabel:
        playlist.owner.id === ctx.session.spotifyAccountId
          ? "Owned"
          : playlist.collaborative
            ? "Collaborative"
            : "View only",
      canAnalyze:
        playlist.owner.id === ctx.session.spotifyAccountId ||
        playlist.collaborative,
      id: playlist.id,
      name: playlist.name,
      imageUrl: playlist.images[0]?.url ?? null,
      ownerName: playlist.owner.display_name,
      trackCount: playlist.tracks.total,
    }));
  }),

  analyzePlaylist: spotifyProcedure
    .input(z.object({ playlistId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [playlist, tracks] = await Promise.all([
        getPlaylistMetadata(ctx.session.spotifyAccessToken, input.playlistId),
        getPlaylistTracks(ctx.session.spotifyAccessToken, input.playlistId),
      ]);

      if (tracks.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Playlist has no analyzable tracks.",
        });
      }

      const featureResults = await getAudioFeatures(
        ctx.session.spotifyAccessToken,
        tracks.map((track) => track.id),
      );

      const matchedPairs = tracks
        .map((track, index) => ({
          track,
          feature: featureResults[index],
        }))
        .filter(
          (
            value,
          ): value is {
            track: (typeof tracks)[number];
            feature: NonNullable<(typeof featureResults)[number]>;
          } => Boolean(value.feature),
        );

      if (matchedPairs.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Spotify did not return usable audio features for this playlist.",
        });
      }

      const matchedTracks = matchedPairs.map(({ track }) => track);
      const matchedFeatures = matchedPairs.map(({ feature }) => feature);
      const analysis = analyzeFeatures(matchedTracks, matchedFeatures);

      await ctx.db
        .insert(cachedAnalyses)
        .values({
          userId: ctx.session.user.id,
          playlistId: playlist.id,
          playlistName: playlist.name,
          analysisJson: analysis,
          createdAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [cachedAnalyses.userId, cachedAnalyses.playlistId],
          set: {
            playlistName: playlist.name,
            analysisJson: analysis,
            createdAt: new Date(),
          },
        });

      return {
        playlistId: playlist.id,
        playlistName: playlist.name,
        features: matchedFeatures,
        analysis,
      };
    }),

  getCachedAnalyses: spotifyProcedure.query(async ({ ctx }) => {
    const analyses = await ctx.db.query.cachedAnalyses.findMany({
      where: eq(cachedAnalyses.userId, ctx.session.user.id),
      orderBy: [desc(cachedAnalyses.createdAt)],
    });

    return analyses.map((entry) => ({
      id: entry.id,
      playlistId: entry.playlistId,
      playlistName: entry.playlistName,
      createdAt: entry.createdAt,
      analysis: entry.analysisJson,
    }));
  }),
});
