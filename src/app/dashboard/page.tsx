import { redirect } from "next/navigation";

import { DashboardClient } from "~/components/chipmap/dashboard-client";
import { getSession } from "~/server/better-auth/server";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session?.user || !session.spotifyAccessToken) {
    redirect("/");
  }

  return (
    <DashboardClient
      user={{
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
      }}
    />
  );
}
