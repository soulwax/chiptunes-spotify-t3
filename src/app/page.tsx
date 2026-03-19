import { HomeClient } from "~/components/chipmap/home-client";

type HomePageProps = {
  searchParams: Promise<{ notice?: string }>;
};

const NOTICE_MESSAGES: Record<string, string> = {
  "analysis-not-found":
    "Analysis not found — paste the playlist again to re-analyse.",
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const { notice } = await searchParams;

  return <HomeClient notice={notice ? NOTICE_MESSAGES[notice] ?? null : null} />;
}
