import { upsertMatchingResult } from "../database/repositories/matching";
import { getAllProposals } from "../database/repositories/proposals";
import { getSnapshotStageById } from "../database/repositories/snapshot";
import { getTallyStageById } from "../database/repositories/tally";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { and, eq } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { matchingResult } from "~~/services/database/config/schema";

interface LlmMatch {
  proposal_id: string;
  confidence: string; // "high" | "medium" | "low"
  confidence_score: number; // 0-100
  reasoning: string;
}

interface LlmMatchResult {
  matches: LlmMatch[];
  reasoning: string; // Overall reasoning when no matches found
}

interface StageInfo {
  id: string;
  title: string | null;
  author_name: string | null;
  url: string | null;
}

function buildMatchingPrompt(
  stage: StageInfo,
  allProposals: { id: string; title: string; author_name: string | null }[],
): string {
  const candidateList = allProposals
    .map(p => `- ID: ${p.id} | Title: ${p.title} | Author: ${p.author_name ?? "Unknown"}`)
    .join("\n");

  return `You are matching an on-chain governance stage (from Snapshot or Tally) to canonical forum proposals.

## Source Stage to Match
- Title: ${stage.title ?? "Unknown"}
- Author: ${stage.author_name ?? "Unknown"}
- URL: ${stage.url ?? "N/A"}

## Candidate Canonical Proposals
${candidateList}

## Instructions
1. Find the canonical proposal(s) that this stage belongs to, based on title similarity, author, and context.
2. Many proposals go through multiple governance stages (forum → snapshot → tally), so titles may differ slightly.
3. Common patterns: AIP prefixes may be added/removed, markdown formatting (#) in titles, slight rewording.
4. **IMPORTANT: Some stages are BUNDLED VOTES** that combine multiple proposals into a single on-chain transaction. In this case, return ALL matching proposals. Look for clues like:
   - Titles listing multiple actions (e.g., "Remove Cost Cap, Update Executors, Disable Bridge")
   - Titles mentioning "bundled" or combining multiple AIPs
5. Some stages will NOT match any proposal. These include:
   - Security Council elections and member changes
   - STIP/LTIPP individual grant distributions (unless there's a matching umbrella proposal)
   - Operational/constitutional votes that predate the forum tracking
   - Proposals from other DAOs or test proposals

Return a JSON object with these fields:
- "matches": an array of matched proposals (can be empty, one, or multiple). Each match should have:
  - "proposal_id": the UUID of the matched canonical proposal
  - "confidence": "high", "medium", or "low"
  - "confidence_score": integer 0-100
  - "reasoning": brief explanation for this specific match
- "reasoning": overall explanation (used when matches is empty to explain why)

Example for a single match:
{"matches": [{"proposal_id": "abc-123", "confidence": "high", "confidence_score": 95, "reasoning": "Title matches exactly"}], "reasoning": ""}

Example for a bundled vote matching multiple proposals:
{"matches": [{"proposal_id": "abc-123", "confidence": "high", "confidence_score": 90, "reasoning": "Matches 'Remove Cost Cap'"}, {"proposal_id": "def-456", "confidence": "high", "confidence_score": 90, "reasoning": "Matches 'Update Executors'"}], "reasoning": ""}

Example for no match:
{"matches": [], "reasoning": "This is a Security Council election with no corresponding forum proposal"}`;
}

async function callGemini(prompt: string): Promise<LlmMatchResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is not set");

  const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const raw = JSON.parse(text);
  const parsed = (Array.isArray(raw) ? raw[0] : raw) as LlmMatchResult;

  // Normalize: handle old single-match format gracefully
  if (!Array.isArray(parsed.matches)) {
    // Old format: { proposal_id, confidence, confidence_score, reasoning }
    const legacy = raw as {
      proposal_id: string | null;
      confidence_score: number;
      reasoning: string;
      confidence: string;
    };
    if (legacy.proposal_id) {
      parsed.matches = [
        {
          proposal_id: legacy.proposal_id,
          confidence: legacy.confidence ?? "medium",
          confidence_score: Math.max(0, Math.min(100, Math.round(legacy.confidence_score))),
          reasoning: legacy.reasoning ?? "",
        },
      ];
      parsed.reasoning = "";
    } else {
      parsed.matches = [];
      parsed.reasoning = legacy.reasoning ?? "";
    }
  }

  // Validate and normalize scores
  for (const match of parsed.matches) {
    if (typeof match.confidence_score !== "number" || typeof match.reasoning !== "string") {
      throw new Error(`Invalid LLM match structure: ${text}`);
    }
    match.confidence_score = Math.max(0, Math.min(100, Math.round(match.confidence_score)));
  }

  return parsed;
}

export async function matchStage(
  sourceType: "tally" | "snapshot",
  stageId: string,
): Promise<{ status: string; proposalId: string | null; matchCount: number }> {
  // Load the stage info
  let stage: StageInfo | undefined;

  if (sourceType === "tally") {
    stage = (await getTallyStageById(stageId)) as StageInfo | undefined;
  } else {
    stage = (await getSnapshotStageById(stageId)) as StageInfo | undefined;
  }

  if (!stage) {
    console.log(`  Stage ${stageId} not found in ${sourceType}_stage table`);
    return { status: "not_found", proposalId: null, matchCount: 0 };
  }

  console.log(`  Matching: "${stage.title}" (${stageId})`);

  // Load all canonical proposals + forum URLs
  const allProposals = await getAllProposals();
  if (allProposals.length === 0) {
    throw new Error("No proposals found in database. Cannot match.");
  }

  // Build proposalId → forumUrl map for matched_forum_url
  const forumRows = await db.query.forumStage.findMany({
    columns: { proposal_id: true, url: true },
  });
  const forumUrlByProposal = new Map<string, string | null>(
    forumRows.filter(f => f.proposal_id).map(f => [f.proposal_id!, f.url ?? null]),
  );

  // Build prompt and call LLM
  const prompt = buildMatchingPrompt(stage, allProposals);
  const llmResult = await callGemini(prompt);

  // Validate matched proposal IDs exist
  const validMatches = llmResult.matches.filter(match => {
    const exists = allProposals.find(p => p.id === match.proposal_id);
    if (!exists) {
      console.log(`    → WARNING: LLM returned non-existent proposal_id ${match.proposal_id}, skipping`);
    }
    return !!exists;
  });

  // Mark any previous results for this stage as overwritten
  await db
    .update(matchingResult)
    .set({ status: "overwritten", updated_at: new Date() })
    .where(and(eq(matchingResult.source_type, sourceType), eq(matchingResult.source_stage_id, stageId)));

  if (validMatches.length === 0) {
    console.log(`    → NO MATCH (${llmResult.reasoning})`);

    // Record a single no-match result
    await upsertMatchingResult({
      source_type: sourceType,
      source_stage_id: stageId,
      proposal_id: null,
      status: "no_match",
      method: "llm",
      confidence: 0,
      reasoning: llmResult.reasoning || "No matching proposal found",
      source_title: stage.title,
      source_url: stage.url,
    });

    return { status: "no_match", proposalId: null, matchCount: 0 };
  }

  console.log(`    → MATCHED ${validMatches.length} proposal(s)`);

  // TODO: gate status on confidence_score. Every validated match is
  // currently written as "matched" regardless of score, so low-confidence or
  // hallucinated bundled matches land directly on the homepage. Proposed:
  // introduce MIN_MATCH_CONFIDENCE and demote below-threshold matches to
  // status: "pending_review" (which the dashboard query already filters out).
  // confidence is already stored on the row — just need to act on it.
  const primaryMatch = validMatches.reduce((best, m) => (m.confidence_score > best.confidence_score ? m : best));

  for (const match of validMatches) {
    console.log(`      • ${match.proposal_id} (score: ${match.confidence_score}) — ${match.reasoning}`);
    await upsertMatchingResult({
      source_type: sourceType,
      source_stage_id: stageId,
      proposal_id: match.proposal_id,
      status: "matched",
      method: "llm",
      confidence: match.confidence_score,
      reasoning: match.reasoning,
      source_title: stage.title,
      source_url: stage.url,
      matched_forum_url: forumUrlByProposal.get(match.proposal_id) ?? null,
    });
  }

  return { status: "matched", proposalId: primaryMatch.proposal_id, matchCount: validMatches.length };
}
