import "server-only";

import { SpotifyApiError } from "~/lib/spotify-api-error";
import { getSpotifyToken } from "~/lib/spotify-token";

const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";
const MAX_PLAYLIST_TRACKS = 500;
const PLAYLIST_PAGE_SIZE = 100;
const AUDIO_FEATURE_BATCH_SIZE = 100;
const SPOTIFY_ID_PATTERN = /^[A-Za-z0-9]{22}$/;

export type SpotifyPlaylist = {
  id: string;
  name: string;
  description: string;
  images: { url: string; width: number; height: number }[];
  owner: { display_name: string };
  tracks: { total: number };
};

export type SpotifyTrack = {
  id: string;
  name: string;
  artists: { id: string | null; name: string }[];
  album: {
    id: string | null;
    images: { url: string }[];
    name: string;
    release_date: string | null;
  };
  duration_ms: number;
  explicit: boolean;
  popularity: number | null;
  external_ids: { isrc?: string } | null;
  external_urls: { spotify?: string } | null;
};

export type SpotifyArtist = {
  id: string;
  name: string;
  genres: string[];
};

export type SpotifyAudioFeatures = {
  id: string;
  tempo: number;
  energy: number;
  valence: number;
  danceability: number;
  acousticness: number;
  key: number;
  mode: 0 | 1;
  loudness: number;
  speechiness: number;
  instrumentalness: number;
  time_signature: number;
  duration_ms: number;
};

type PlaylistItemsResponse = {
  items: Array<{
    track:
      | ({
          id: string | null;
          name: string;
          artists: { id: string | null; name: string }[];
          album: {
            id: string | null;
            images: { url: string }[];
            name: string;
            release_date: string | null;
          };
          duration_ms: number;
          explicit: boolean;
          popularity: number | null;
          external_ids: { isrc?: string } | null;
          external_urls: { spotify?: string } | null;
          is_local?: boolean;
          type?: string;
        } | null)
      | undefined;
  }>;
  next: string | null;
};

type AudioFeaturesResponse = {
  audio_features: Array<SpotifyAudioFeatures | null>;
};

type ArtistsResponse = {
  artists: SpotifyArtist[];
};

async function spotifyFetch<T>(path: string): Promise<T> {
  const token = await getSpotifyToken();
  const response = await fetch(`${SPOTIFY_API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | T
    | { error?: { message?: string } }
    | null;

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "error" in payload &&
      payload.error?.message
        ? payload.error.message
        : `Spotify request failed with status ${response.status}`;

    throw new SpotifyApiError(response.status, message);
  }

  return payload as T;
}

export function resolvePlaylistId(input: string): string | null {
  const trimmed = input.trim();

  if (!trimmed) {
    return null;
  }

  if (SPOTIFY_ID_PATTERN.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("spotify:playlist:")) {
    const playlistId = trimmed.split(":").pop() ?? "";
    return SPOTIFY_ID_PATTERN.test(playlistId) ? playlistId : null;
  }

  try {
    const url = new URL(trimmed);
    if (
      url.hostname !== "open.spotify.com" &&
      url.hostname !== "play.spotify.com"
    ) {
      return null;
    }

    const segments = url.pathname.split("/").filter(Boolean);
    if (segments[0] !== "playlist") {
      return null;
    }

    const playlistId = segments[1] ?? "";
    return SPOTIFY_ID_PATTERN.test(playlistId) ? playlistId : null;
  } catch {
    return null;
  }
}

export async function getPlaylist(
  playlistId: string,
): Promise<SpotifyPlaylist> {
  return spotifyFetch<SpotifyPlaylist>(
    `/playlists/${playlistId}?fields=id,name,description,images(url,width,height),owner(display_name),tracks(total)`,
  );
}

export async function getPlaylistTracks(
  playlistId: string,
): Promise<SpotifyTrack[]> {
  const tracks: SpotifyTrack[] = [];
  let offset = 0;

  while (tracks.length < MAX_PLAYLIST_TRACKS) {
    const remaining = MAX_PLAYLIST_TRACKS - tracks.length;
    const limit = Math.min(PLAYLIST_PAGE_SIZE, remaining);
    const response = await spotifyFetch<PlaylistItemsResponse>(
      `/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}&fields=items(track(id,name,artists(id,name),album(id,name,release_date,images),duration_ms,explicit,popularity,external_ids(isrc),external_urls(spotify),is_local,type)),next`,
    );

    const pageTracks = response.items
      .map((item) => item.track)
      .filter(
        (
          track,
        ): track is NonNullable<PlaylistItemsResponse["items"][number]["track"]> =>
          Boolean(track),
      )
      .filter((track) => track.id !== null && track.type === "track")
      .filter((track) => track.is_local !== true)
      .map((track) => ({
        id: track.id!,
        name: track.name,
        artists: track.artists,
        album: track.album,
        duration_ms: track.duration_ms,
        explicit: track.explicit,
        popularity: track.popularity,
        external_ids: track.external_ids,
        external_urls: track.external_urls,
      }));

    tracks.push(...pageTracks);

    if (!response.next || response.items.length < limit) {
      break;
    }

    offset += limit;
  }

  return tracks;
}

export async function getAudioFeatures(
  trackIds: string[],
): Promise<SpotifyAudioFeatures[]> {
  if (trackIds.length === 0) {
    return [];
  }

  if (trackIds.length > AUDIO_FEATURE_BATCH_SIZE) {
    throw new Error("Spotify audio feature requests are limited to 100 track IDs.");
  }

  const response = await spotifyFetch<AudioFeaturesResponse>(
    `/audio-features?ids=${encodeURIComponent(trackIds.join(","))}`,
  );

  return response.audio_features.filter(
    (feature): feature is SpotifyAudioFeatures => Boolean(feature),
  );
}

export async function getAllAudioFeatures(
  trackIds: string[],
): Promise<SpotifyAudioFeatures[]> {
  const uniqueTrackIds = [...new Set(trackIds)];
  const batches: string[][] = [];

  for (
    let startIndex = 0;
    startIndex < uniqueTrackIds.length;
    startIndex += AUDIO_FEATURE_BATCH_SIZE
  ) {
    batches.push(
      uniqueTrackIds.slice(startIndex, startIndex + AUDIO_FEATURE_BATCH_SIZE),
    );
  }

  const responses = await Promise.all(
    batches.map((batch) => getAudioFeatures(batch)),
  );

  return responses.flat();
}

export async function getArtistsByIds(
  artistIds: string[],
): Promise<Map<string, SpotifyArtist>> {
  const uniqueArtistIds = [...new Set(artistIds)].filter(Boolean);
  const artistMap = new Map<string, SpotifyArtist>();

  for (let startIndex = 0; startIndex < uniqueArtistIds.length; startIndex += 50) {
    const batch = uniqueArtistIds.slice(startIndex, startIndex + 50);
    if (batch.length === 0) {
      continue;
    }

    const response = await spotifyFetch<ArtistsResponse>(
      `/artists?ids=${encodeURIComponent(batch.join(","))}`,
    );

    for (const artist of response.artists) {
      artistMap.set(artist.id, artist);
    }
  }

  return artistMap;
}

export { SpotifyApiError };
