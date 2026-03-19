import { auth } from ".";
import { headers } from "next/headers";
import { cache } from "react";

import { and, eq } from "drizzle-orm";

import { db } from "~/server/db";
import { account } from "~/server/db/schema";

export type ServerSession = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
> & {
  spotifyAccessToken: string | null;
};

export async function getSessionFromRequestHeaders(requestHeaders: Headers) {
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session?.user?.id) {
    return null;
  }

  const spotifyAccount = await db.query.account.findFirst({
    columns: {
      accessToken: true,
    },
    where: and(
      eq(account.userId, session.user.id),
      eq(account.providerId, "spotify"),
    ),
  });

  return {
    ...session,
    spotifyAccessToken: spotifyAccount?.accessToken ?? null,
  } satisfies ServerSession;
}

export const getSession = cache(async () => {
  const requestHeaders = new Headers(await headers());
  return getSessionFromRequestHeaders(requestHeaders);
});
