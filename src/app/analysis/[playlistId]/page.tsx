import { redirect } from "next/navigation";

import { AnalysisView } from "~/components/chipmap/analysis-view";
import { api } from "~/trpc/server";

type AnalysisPageProps = {
  params: Promise<{ playlistId: string }>;
};

export default async function AnalysisPage({ params }: AnalysisPageProps) {
  const { playlistId } = await params;
  const [entry, recentAnalyses] = await Promise.all([
    api.spotify.getAnalysis({ playlistId }),
    api.spotify.getRecentAnalyses(),
  ]);

  if (!entry) {
    redirect("/?notice=analysis-not-found");
  }

  return (
    <AnalysisView
      playlistId={entry.playlistId}
      playlistName={entry.playlistName}
      analysis={entry.analysis}
      coverUrl={entry.coverUrl}
      recentAnalyses={recentAnalyses}
    />
  );
}
