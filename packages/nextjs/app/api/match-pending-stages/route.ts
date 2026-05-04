import { NextRequest, NextResponse } from "next/server";
import { getUnprocessedSnapshotStages, getUnprocessedTallyStages } from "~~/services/database/repositories/matching";
import { MatchStageStatus, matchStage } from "~~/services/matching/llm-matching";

export const maxDuration = 300;

interface StageRunResult {
  sourceType: "snapshot" | "tally";
  stageId: string;
  status: MatchStageStatus | "error";
  matchCount?: number;
  error?: string;
}

export async function GET(request: NextRequest) {
  const startedAt = Date.now();

  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    console.error("Unauthorized attempt to access match-pending-stages endpoint");
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // Stop processing once we're within this many ms of maxDuration to leave
  // headroom for the response. Any stages not reached this run will remain
  // unprocessed and get picked up by the next cron run.
  const SAFETY_MARGIN_MS = 30_000;
  const deadline = startedAt + maxDuration * 1000 - SAFETY_MARGIN_MS;

  const results: StageRunResult[] = [];
  let processed = 0;
  let skipped = 0;

  try {
    const [snapshotRows, tallyRows] = await Promise.all([getUnprocessedSnapshotStages(), getUnprocessedTallyStages()]);

    const queue: { sourceType: "snapshot" | "tally"; stageId: string }[] = [
      ...snapshotRows.map(r => ({ sourceType: "snapshot" as const, stageId: r.snapshotStage.id })),
      ...tallyRows.map(r => ({ sourceType: "tally" as const, stageId: r.tallyStage.id })),
    ];

    console.log(
      `match-pending-stages: ${queue.length} stage(s) pending (${snapshotRows.length} snapshot, ${tallyRows.length} tally)`,
    );

    for (const { sourceType, stageId } of queue) {
      if (Date.now() > deadline) {
        skipped = queue.length - processed;
        console.log(`match-pending-stages: deadline reached, skipping ${skipped} remaining stage(s) for next run`);
        break;
      }

      try {
        const result = await matchStage(sourceType, stageId);
        results.push({
          sourceType,
          stageId,
          status: result.status,
          matchCount: result.matchCount,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`match-pending-stages: error matching ${sourceType}/${stageId}:`, message);
        results.push({ sourceType, stageId, status: "error", error: message });
      }

      processed++;
    }

    const durationMs = Date.now() - startedAt;
    const matched = results.filter(r => r.status === "matched").length;
    const noMatch = results.filter(r => r.status === "no_match").length;
    const errors = results.filter(r => r.status === "error").length;

    console.log(
      `match-pending-stages: finished in ${durationMs}ms - processed=${processed}, matched=${matched}, no_match=${noMatch}, errors=${errors}, skipped=${skipped}`,
    );

    return NextResponse.json(
      {
        success: errors === 0,
        durationMs,
        processed,
        matched,
        noMatch,
        errors,
        skipped,
        results,
      },
      { status: errors > 0 ? 500 : 200 },
    );
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    console.error(`match-pending-stages: fatal error after ${durationMs}ms:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        durationMs,
        processed,
        results,
      },
      { status: 500 },
    );
  }
}
