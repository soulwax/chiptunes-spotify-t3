import { integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { type ChipmapAnalysis } from "~/lib/analysis";

export const cachedAnalyses = pgTable("cached_analyses", {
  id: uuid("id").defaultRandom().primaryKey(),
  playlistId: text("playlist_id").notNull().unique(),
  playlistName: text("playlist_name").notNull(),
  coverUrl: text("cover_url"),
  trackCount: integer("track_count").notNull(),
  era: text("era").notNull().$type<ChipmapAnalysis["era"]>(),
  analysisJson: jsonb("analysis_json").$type<ChipmapAnalysis>().notNull(),
  analyzedAt: timestamp("analyzed_at").defaultNow().notNull(),
});
