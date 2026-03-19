import { TRPCError } from "@trpc/server";

import { APP_ERROR_CODES, AppError } from "~/lib/errors";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

export interface SpotifyPlaylistSummary {
  id: string;
  name: string;
  images: Array<{ url: string; width: number | null; height: number | null }>;
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

export async function spotifyFetch<T>(
  accessToken: string,
  path: string,
): Promise<T> {
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

  if (!response.ok) {
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: `Spotify request failed with status ${response.status}`,
    });
  }

  return (await response.json()) as T;
}

export async function getAllPlaylists(accessToken: string) {
  const playlists: SpotifyPlaylistSummary[] = [];
  let nextUrl: string | null = "/me/playlists?limit=50";

  while (nextUrl) {
    const page = await spotifyFetch<{
      items: SpotifyPlaylistSummary[];
      next: string | null;
    }>(accessToken, nextUrl);

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
    `/playlists/${playlistId}/tracks?limit=100&fields=items(track(id,name,type,is_local)),next`;

  while (nextUrl) {
    const page = await spotifyFetch<{
      items: Array<{
        track: {
          id: string | null;
          name: string;
          type: string;
          is_local?: boolean;
        } | null;
      }>;
      next: string | null;
    }>(accessToken, nextUrl);

    for (const item of page.items) {
      const track = item.track;

      if (!track || track.type !== "track" || track.is_local || !track.id) {
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
    `/playlists/${playlistId}?fields=id,name,images,tracks(total)`,
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
    }>(accessToken, `/audio-features?ids=${batch.join(",")}`);

    for (const feature of response.audio_features) {
      if (!feature?.id) {
        continue;
      }

      features.set(feature.id, feature);
    }
  }

  return trackIds.map((trackId) => features.get(trackId) ?? null);
}
