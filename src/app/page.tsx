import { redirect } from "next/navigation";

import { ChipmapLogo } from "~/components/chipmap/logo";
import { SpotifySignInButton } from "~/components/chipmap/spotify-sign-in-button";
import { Card, CardContent } from "~/components/ui/card";
import { getSession } from "~/server/better-auth/server";

export default async function HomePage() {
  const session = await getSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="chipmap-grid bg-background flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="chipmap-panel border-accent/25 w-full max-w-xl overflow-hidden">
        <div className="h-2 bg-[linear-gradient(90deg,hsl(var(--accent)),hsl(var(--purple)),hsl(var(--amber)))]" />
        <CardContent className="px-8 py-10 sm:px-10 sm:py-12">
          <div className="mb-8 flex flex-col items-center text-center">
            <ChipmapLogo className="mb-5 h-20 w-20" />
            <p className="text-accent mb-3 text-xs font-semibold tracking-[0.28em] uppercase">
              Chipmap
            </p>
            <h1
              className="max-w-md text-4xl font-semibold tracking-tight sm:text-5xl"
              data-testid="landing-title"
            >
              Turn your playlist into game music
            </h1>
            <p className="text-muted-foreground mt-4 max-w-lg text-sm sm:text-base">
              Sign in with Spotify to import playlist metadata, build a
              canonical manifest, and turn genres, release eras, and runtime
              signals into a retro soundtrack brief.
            </p>
          </div>

          <div className="border-border bg-secondary/40 mb-8 rounded-3xl border p-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-foreground text-sm font-medium">
                What Chipmap builds
              </span>
              <span className="border-accent/25 bg-accent/10 text-accent rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.16em] uppercase">
                Starter Pack
              </span>
            </div>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                Canonical manifests with track, artist, album, release year,
                duration, popularity, and ISRC data
              </li>
              <li>
                Genre fingerprints, release timelines, and soundtrack-era
                recommendations
              </li>
              <li>
                Metadata-driven cue maps you can export for later open-audio
                analysis
              </li>
            </ul>
          </div>

          <SpotifySignInButton />
        </CardContent>
      </Card>
    </main>
  );
}
