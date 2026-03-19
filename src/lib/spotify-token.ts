import "server-only";

import { env } from "~/env";
import { SpotifyApiError } from "~/lib/spotify-api-error";

const SPOTIFY_TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

type SpotifyTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: "Bearer";
};

let cachedToken:
  | {
      token: string;
      expiresAt: number;
    }
  | null = null;

export async function getSpotifyToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const credentials = Buffer.from(
    `${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`,
  ).toString("base64");

  const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | SpotifyTokenResponse
    | { error?: string; error_description?: string }
    | null;

  if (!response.ok || !payload || !("access_token" in payload)) {
    const message =
      payload && "error_description" in payload && payload.error_description
        ? payload.error_description
        : `Spotify token request failed with status ${response.status}`;

    throw new SpotifyApiError(response.status, message);
  }

  cachedToken = {
    token: payload.access_token,
    expiresAt: Date.now() + payload.expires_in * 1000 - 60_000,
  };

  return cachedToken.token;
}
