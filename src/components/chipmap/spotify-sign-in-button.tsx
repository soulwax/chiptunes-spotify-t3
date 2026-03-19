"use client";

import { useState } from "react";

import { authClient } from "~/server/better-auth/client";

import { Button } from "~/components/ui/button";

export function SpotifySignInButton() {
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setIsPending(true);
      setErrorMessage(null);

      await authClient.signIn.social({
        provider: "spotify",
        callbackURL: "/dashboard",
      });
    } catch (error) {
      console.error("Spotify sign-in failed", error);
      setErrorMessage("Spotify sign-in could not start. Please try again.");
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        className="h-12 w-full bg-[hsl(var(--green))] text-background hover:opacity-90"
        data-testid="spotify-sign-in-button"
        disabled={isPending}
        onClick={handleSignIn}
        type="button"
      >
        {isPending ? "Connecting to Spotify..." : "Sign in with Spotify"}
      </Button>

      {errorMessage ? (
        <p
          className="text-center text-sm text-destructive"
          data-testid="spotify-sign-in-error"
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
