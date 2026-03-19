import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { APP_ERROR_CODES, AppError } from "~/lib/errors";
import {
  analyzePlaylistMetadata,
  buildStarterPackBrief,
  isMetadataAnalysis,
} from "~/lib/metadata-analysis";
import { toFileNameBase } from "~/lib/utils";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { cachedAnalyses } from "~/server/db/schema";
import {
  getAllPlaylists,
  getArtistsByIds,
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

      const artistGenresResponse = await getArtistsByIds(
        ctx.session.spotifyAccessToken,
        tracks.flatMap((track) =>
          track.artists
            .map((artist) => artist.id)
            .filter((artistId): artistId is string => Boolean(artistId)),
        ),
      );
      const artistGenres = new Map(
        [...artistGenresResponse.entries()].map(([spotifyId, artist]) => [
          spotifyId,
          {
            genres: artist.genres,
            name: artist.name,
            spotifyId,
          },
        ]),
      );

      const analysis = analyzePlaylistMetadata({
        artistGenres,
        playlistId: playlist.id,
        playlistName: playlist.name,
        tracks: tracks.map((track) => ({
          album: {
            imageUrl: track.album.imageUrl,
            name: track.album.name,
            releaseDate: track.album.releaseDate,
            releaseYear: parseReleaseYear(track.album.releaseDate),
            spotifyId: track.album.id,
          },
          artists: track.artists.map((artist) => ({
            name: artist.name,
            spotifyId: artist.id,
          })),
          durationMs: track.durationMs,
          explicit: track.explicit,
          isrc: track.isrc,
          name: track.name,
          popularity: track.popularity,
          spotifyId: track.id,
          spotifyUrl: track.spotifyUrl,
        })),
      });

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

  exportAnalysis: protectedProcedure
    .input(z.object({ playlistId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const entry = await ctx.db.query.cachedAnalyses.findFirst({
        where: and(
          eq(cachedAnalyses.playlistId, input.playlistId),
          eq(cachedAnalyses.userId, ctx.session.user.id),
        ),
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
            "This cached analysis uses the legacy audio-feature format. Re-run the playlist to export the metadata-first starter pack.",
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

function parseReleaseYear(releaseDate: string | null) {
  if (!releaseDate) {
    return null;
  }

  const year = Number.parseInt(releaseDate.slice(0, 4), 10);
  return Number.isFinite(year) ? year : null;
}
