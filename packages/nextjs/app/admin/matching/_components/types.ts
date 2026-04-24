export interface PendingStage {
  sourceType: "snapshot" | "tally";
  stageId: string;
  title: string | null;
  authorName: string | null;
  url: string | null;
}

export type SourceType = "snapshot" | "tally";
export type MatchStatus = "matched" | "no_match" | "pending_review";
export type MatchMethod = "llm" | "csv_import" | "manual_override";

export function typeBadgeColor(sourceType: string) {
  return sourceType === "snapshot"
    ? "border-purple-200 bg-purple-100 text-purple-600"
    : "border-cyan-200 bg-cyan-100 text-cyan-600";
}

export interface MatchingResultRow {
  id: string;
  source_type: SourceType;
  source_stage_id: string;
  proposal_id: string | null;
  status: MatchStatus;
  method: MatchMethod;
  confidence: number | null;
  reasoning: string | null;
  source_title: string | null;
  source_url: string | null;
  matched_forum_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  proposal_title: string | null;
}
