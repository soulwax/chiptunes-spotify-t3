import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { env } from "~/env";
import { db } from "~/server/db";

const PRODUCTION_BASE_URL = "https://chiptunes.darkfloor.org";
const DEFAULT_BASE_URL =
  env.NODE_ENV === "production"
    ? PRODUCTION_BASE_URL
    : "http://localhost:3000";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL ?? DEFAULT_BASE_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  socialProviders: {
    spotify: {
      clientId: env.BETTER_AUTH_SPOTIFY_CLIENT_ID,
      clientSecret: env.BETTER_AUTH_SPOTIFY_CLIENT_SECRET,
      scope: [
        "playlist-read-private",
        "playlist-read-collaborative",
        "user-read-private",
      ],
    },
  },
});

export type Session = typeof auth.$Infer.Session;
