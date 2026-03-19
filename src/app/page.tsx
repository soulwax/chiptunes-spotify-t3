import { redirect } from "next/navigation";

import { ChipmapLogo } from "~/components/chipmap/logo";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { auth } from "~/server/better-auth";
import { getSession } from "~/server/better-auth/server";

export default async function HomePage() {
  const session = await getSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="chipmap-grid flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="chipmap-panel w-full max-w-xl overflow-hidden border-accent/25">
        <div className="h-2 bg-[linear-gradient(90deg,hsl(var(--accent)),hsl(var(--purple)),hsl(var(--amber)))]" />
        <CardContent className="px-8 py-10 sm:px-10 sm:py-12">
          <div className="mb-8 flex flex-col items-center text-center">
            <ChipmapLogo className="mb-5 h-20 w-20" />
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Chipmap
            </p>
            <h1
              className="max-w-md text-4xl font-semibold tracking-tight sm:text-5xl"
              data-testid="landing-title"
            >
              Turn your playlist into game music
            </h1>
            <p className="mt-4 max-w-lg text-sm text-muted-foreground sm:text-base">
              Sign in with Spotify to turn tempo, keys, and mood into a retro
              starter pack for NES, SNES, and Genesis-inspired tracks.
            </p>
          </div>

          <div className="mb-8 rounded-[24px] border border-border bg-secondary/40 p-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                What Chipmap builds
              </span>
              <span className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                Starter Pack
              </span>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Median BPM, mood spread, and playable game-context buckets</li>
              <li>Dominant keys with Camelot codes and chord progression prompts</li>
              <li>Drum grids, cluster cues, and era-matched sound design notes</li>
            </ul>
          </div>

          <form>
            <Button
              className="h-12 w-full bg-[hsl(var(--green))] text-background hover:opacity-90"
              formAction={async () => {
                "use server";
                const response = await auth.api.signInSocial({
                  body: {
                    provider: "spotify",
                    callbackURL: "/dashboard",
                  },
                });

                if (!response.url) {
                  throw new Error("Spotify sign-in did not return a redirect URL.");
                }

                redirect(response.url);
              }}
              data-testid="spotify-sign-in-button"
            >
              Sign in with Spotify
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
