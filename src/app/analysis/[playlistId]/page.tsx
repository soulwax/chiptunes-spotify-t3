import { redirect } from "next/navigation";

import { AnalysisRunner } from "~/components/chipmap/analysis-runner";
import { AnalysisView } from "~/components/chipmap/analysis-view";
import { getSession } from "~/server/better-auth/server";
import { api } from "~/trpc/server";

type AnalysisPageProps = {
  params: Promise<{ playlistId: string }>;
  searchParams: Promise<{ run?: string }>;
};

export default async function AnalysisPage({
  params,
  searchParams,
}: AnalysisPageProps) {
  const session = await getSession();

  if (!session?.user || !session.spotifyAccessToken) {
    redirect("/");
  }

  const { playlistId } = await params;
  const { run } = await searchParams;

  if (run === "1") {
    return <AnalysisRunner playlistId={playlistId} />;
  }

  const cachedAnalyses = await api.spotify.getCachedAnalyses();
  const entry = cachedAnalyses.find((analysis) => analysis.playlistId === playlistId);

  if (!entry) {
    redirect("/dashboard");
  }

  return (
    <AnalysisView
      playlistId={entry.playlistId}
      playlistName={entry.playlistName}
      analysis={entry.analysis}
    />
  );
}
