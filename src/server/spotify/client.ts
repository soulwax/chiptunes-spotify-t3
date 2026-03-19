import { TRPCError } from "@trpc/server";

import { APP_ERROR_CODES, AppError } from "~/lib/errors";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

export interface SpotifyPlaylistSummary {
  id: string;
  name: string;
  collaborative: boolean;
  images: Array<{ url: string; width: number | null; height: number | null }>;
  owner: {
    display_name: string | null;
    id: string;
  };
  tracks: { total: number };
}

export interface SpotifyPlaylistTrack {
  album: {
    id: string | null;
    imageUrl: string | null;
    name: string;
    releaseDate: string | null;
  };
  artists: Array<{
    id: string | null;
    name: string;
  }>;
  durationMs: number;
  explicit: boolean;
  id: string;
  isrc: string | null;
  name: string;
  popularity: number | null;
  spotifyUrl: string | null;
}

export interface SpotifyArtistMetadata {
  genres: string[];
  id: string;
  name: string;
}

type SpotifyForbiddenErrorConfig = {
  code: (typeof APP_ERROR_CODES)[keyof typeof APP_ERROR_CODES];
  message: string;
};

type SpotifyFetchOptions = {
  forbiddenError?: SpotifyForbiddenErrorConfig;
};

export async function spotifyFetch<T>(
  accessToken: string,
  path: string,
  options?: SpotifyFetchOptions,
): Promise<T> {
  const requestPath = path.startsWith("http")
    ? `${new URL(path).pathname}${new URL(path).search}`
    : path;
  const response = await fetch(
    path.startsWith("http") ? path : `${SPOTIFY_API_BASE}${path}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (response.status === 401) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: APP_ERROR_CODES.SPOTIFY_TOKEN_EXPIRED,
      cause: new AppError(APP_ERROR_CODES.SPOTIFY_TOKEN_EXPIRED),
    });
  }

  if (response.status === 403 && options?.forbiddenError) {
    const errorBody = await response.text();

    console.error("Spotify request was forbidden", {
      body: errorBody,
      path: requestPath,
      status: response.status,
    });

    throw new TRPCError({
      code: "FORBIDDEN",
      message: options.forbiddenError.message,
      cause: new AppError(options.forbiddenError.code),
    });
  }

  if (!response.ok) {
    const errorBody = await response.text();

    console.error("Spotify request failed", {
      body: errorBody,
      path: requestPath,
      status: response.status,
    });

    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: `Spotify request failed with status ${response.status} for ${requestPath}`,
    });
  }

  return (await response.json()) as T;
}

export async function getAllPlaylists(accessToken: string) {
  const playlists: SpotifyPlaylistSummary[] = [];
  let nextUrl: string | null = "/me/playlists?limit=50";

  while (nextUrl) {
    const page: {
      items: SpotifyPlaylistSummary[];
      next: string | null;
    } = await spotifyFetch(accessToken, nextUrl);

    playlists.push(...page.items);
    nextUrl = page.next;
  }

  return playlists;
}

export async function getPlaylistTracks(
  accessToken: string,
  playlistId: string,
) {
  const tracks: SpotifyPlaylistTrack[] = [];
  let nextUrl: string | null =
    `/playlists/${playlistId}/items?limit=100&fields=items(track(id,name,type,is_local,artists(id,name),album(id,name,release_date,images(url)),duration_ms,explicit,popularity,external_ids(isrc),external_urls(spotify))),next`;

  while (nextUrl) {
    const page: {
      items: Array<{
        track: {
          album: {
            id: string | null;
            images: Array<{ url: string }>;
            name: string;
            release_date: string | null;
          };
          artists: Array<{
            id: string | null;
            name: string;
          }>;
          duration_ms: number;
          explicit: boolean;
          external_ids?: {
            isrc?: string | null;
          };
          external_urls?: {
            spotify?: string | null;
          };
          id: string | null;
          name: string;
          popularity?: number | null;
          type: string;
          is_local?: boolean;
        } | null;
      }>;
      next: string | null;
    } = await spotifyFetch(accessToken, nextUrl, {
      forbiddenError: {
        code: APP_ERROR_CODES.SPOTIFY_PLAYLIST_NOT_ANALYZABLE,
        message:
          "Spotify currently only lets this app analyze playlists you own or collaborate on.",
      },
    });

    for (const item of page.items) {
      const track = item.track;

      if (
        track?.type !== "track" ||
        track?.is_local ||
        !track?.id
      ) {
        continue;
      }

      tracks.push({
        album: {
          id: track.album.id,
          imageUrl: track.album.images?.[0]?.url ?? null,
          name: track.album.name,
          releaseDate: track.album.release_date,
        },
        artists: track.artists.map((artist) => ({
          id: artist.id,
          name: artist.name,
        })),
        durationMs: track.duration_ms,
        explicit: track.explicit,
        id: track.id,
        isrc: track.external_ids?.isrc ?? null,
        name: track.name,
        popularity: track.popularity ?? null,
        spotifyUrl: track.external_urls?.spotify ?? null,
      });
    }

    nextUrl = page.next;
  }

  return tracks;
}

export async function getPlaylistMetadata(
  accessToken: string,
  playlistId: string,
) {
  return spotifyFetch<SpotifyPlaylistSummary>(
    accessToken,
    `/playlists/${playlistId}?fields=id,name,images,tracks(total),owner(id,display_name),collaborative`,
  );
}

export async function getArtistsByIds(
  accessToken: string,
  artistIds: string[],
) {
  const uniqueIds = [...new Set(artistIds.filter(Boolean))];
  const artists = new Map<string, SpotifyArtistMetadata>();

  for (let index = 0; index < uniqueIds.length; index += 50) {
    const batch = uniqueIds.slice(index, index + 50);

    try {
      const response = await spotifyFetch<{
        artists: Array<{
          genres?: string[];
          id: string;
          name: string;
        } | null>;
      }>(accessToken, `/artists?ids=${batch.join(",")}`);

      for (const artist of response.artists) {
        if (!artist?.id) {
          continue;
        }

        artists.set(artist.id, {
          genres: artist.genres ?? [],
          id: artist.id,
          name: artist.name,
        });
      }
    } catch (error) {
      console.error("Spotify artist enrichment failed", {
        artistIds: batch,
        batchSize: batch.length,
        error,
      });
    }
  }

  return artists;
}
