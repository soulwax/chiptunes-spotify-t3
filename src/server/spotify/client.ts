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
  id: string;
  name: string;
}

export interface SpotifyAudioFeatureResponse {
  id: string;
  tempo: number;
  energy: number;
  valence: number;
  danceability: number;
  acousticness: number;
  key: number;
  mode: 0 | 1;
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
    `/playlists/${playlistId}/items?limit=100&fields=items(track(id,name,type,is_local)),next`;

  while (nextUrl) {
    const page: {
      items: Array<{
        track: {
          id: string | null;
          name: string;
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
        id: track.id,
        name: track.name,
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

export async function getAudioFeatures(
  accessToken: string,
  trackIds: string[],
) {
  const uniqueIds = [...new Set(trackIds)];
  const features = new Map<string, SpotifyAudioFeatureResponse>();

  for (let index = 0; index < uniqueIds.length; index += 100) {
    const batch = uniqueIds.slice(index, index + 100);
    const response = await spotifyFetch<{
      audio_features: Array<SpotifyAudioFeatureResponse | null>;
    }>(accessToken, `/audio-features?ids=${batch.join(",")}`, {
      forbiddenError: {
        code: APP_ERROR_CODES.SPOTIFY_AUDIO_FEATURES_UNAVAILABLE,
        message:
          "Spotify blocked audio-feature access for this app, so Chipmap cannot analyze this playlist right now.",
      },
    });

    for (const feature of response.audio_features) {
      if (!feature?.id) {
        continue;
      }

      features.set(feature.id, feature);
    }
  }

  return trackIds.map((trackId) => features.get(trackId) ?? null);
}
