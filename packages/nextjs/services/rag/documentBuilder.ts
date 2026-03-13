// Document Builder - Creates distinct document types from proposals
import {
  ProposalWithAllData,
  RagNodeMetadata,
  SnapshotOptions,
  TallyEvent,
  TallyOptions,
  TallyVoteStat,
} from "./types";
import { createHash } from "crypto";
import { Document } from "llamaindex";

/**
 * Compute a content hash for idempotency checking.
 * Returns first 16 chars of SHA256 hash.
 */
export function computeContentHash(text: string): string {
  return createHash("sha256").update(text).digest("hex").slice(0, 16);
}

/**
 * Generate a deterministic node ID.
 * Format: ${proposal_id}__${stage}__${suffix}
 * Uses double underscore separator (unlikely in UUIDs).
 */
export function generateNodeId(proposalId: string, stage: string, suffix: number | string): string {
  return `${proposalId}__${stage}__${suffix}`;
}

/**
 * Format a date for display in documents.
 */
function formatDate(date: Date | string | null): string | null {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}

/**
 * Build the Summary Document text for a proposal.
 * Contains: title, author, category, dates, all stage URLs, cross-links,
 * Snapshot body text, Tally description, and status across stages.
 */
function buildSummaryText(proposal: ProposalWithAllData): string {
  const lines: string[] = [];

  // Proposal header
  lines.push(`# ${proposal.title}`);
  lines.push("");

  if (proposal.author_name) {
    lines.push(`**Author:** ${proposal.author_name}`);
  }
  if (proposal.category) {
    lines.push(`**Category:** ${proposal.category}`);
  }
  if (proposal.created_at) {
    lines.push(`**Created:** ${formatDate(proposal.created_at)}`);
  }
  lines.push("");

  // All stage URLs + cross-links
  lines.push("## Links");
  if (proposal.forum?.url) {
    lines.push(`**Forum URL:** ${proposal.forum.url}`);
  }
  if (proposal.snapshot?.url) {
    lines.push(`**Snapshot URL:** ${proposal.snapshot.url}`);
  }
  if (proposal.tally?.url) {
    lines.push(`**Tally URL:** ${proposal.tally.url}`);
  }
  // Cross-links from Tally metadata
  if (proposal.tally?.discourse_url) {
    lines.push(`**Discourse URL (from Tally):** ${proposal.tally.discourse_url}`);
  }
  if (proposal.tally?.snapshot_url) {
    lines.push(`**Snapshot URL (from Tally):** ${proposal.tally.snapshot_url}`);
  }
  lines.push("");

  // Status across all stages
  lines.push("## Status");
  if (proposal.forum) {
    lines.push(`**Forum:** ${proposal.forum.message_count || 0} messages`);
    if (proposal.forum.last_message_at) {
      lines.push(`**Forum Last Activity:** ${formatDate(proposal.forum.last_message_at)}`);
    }
  }
  if (proposal.snapshot) {
    lines.push(`**Snapshot State:** ${proposal.snapshot.status || "unknown"}`);
    if (proposal.snapshot.voting_start) {
      lines.push(
        `**Snapshot Voting:** ${formatDate(proposal.snapshot.voting_start)} to ${formatDate(proposal.snapshot.voting_end)}`,
      );
    }
  }
  if (proposal.tally) {
    const tallyStatus = [proposal.tally.status, proposal.tally.substatus].filter(Boolean).join(" / ");
    lines.push(`**Tally Status:** ${tallyStatus || "unknown"}`);
    if (proposal.tally.start_timestamp) {
      lines.push(
        `**Tally Voting:** ${formatDate(proposal.tally.start_timestamp)} to ${formatDate(proposal.tally.end_timestamp)}`,
      );
    }
    if (proposal.tally.onchain_id) {
      lines.push(`**On-chain ID:** ${proposal.tally.onchain_id}`);
    }
  }
  lines.push("");

  // Snapshot body text — the actual proposal content
  if (proposal.snapshot?.body) {
    lines.push("## Proposal Content (Snapshot)");
    lines.push("");
    lines.push(proposal.snapshot.body);
    lines.push("");
  }

  // Tally description — if snapshot body is missing, or if it adds different content
  if (proposal.tally?.description) {
    if (!proposal.snapshot?.body) {
      lines.push("## Proposal Content (Tally)");
      lines.push("");
      lines.push(proposal.tally.description);
      lines.push("");
    }
    // If snapshot body exists, only include tally description if it's substantially different
    // (skip if they overlap heavily — typically the same text)
  }

  return lines.join("\n");
}

/**
 * Format Snapshot voting results from the options JSONB.
 * Fixes the bug where options.join(",") was called on an object.
 */
function formatSnapshotResults(options: unknown): string | null {
  const opts = options as SnapshotOptions | null;
  if (!opts?.choices || !opts?.scores) return null;

  return opts.choices.map((choice, i) => `${choice}: ${(opts.scores[i] || 0).toLocaleString()} votes`).join(", ");
}

/**
 * Format Tally voting results from the options JSONB.
 * Fixes the bug where options.join(",") was called on an object.
 */
function formatTallyResults(options: unknown): string | null {
  const opts = options as TallyOptions | null;
  if (!opts?.voteStats || opts.voteStats.length === 0) return null;

  return opts.voteStats
    .map((s: TallyVoteStat) => `${s.type}: ${s.votesCount} (${s.percent}%, ${s.votersCount} voters)`)
    .join(", ");
}

/**
 * Format Tally events timeline.
 */
function formatEventsTimeline(options: unknown): string | null {
  const opts = options as TallyOptions | null;
  if (!opts?.events || opts.events.length === 0) return null;

  return opts.events
    .sort(
      (a: TallyEvent, b: TallyEvent) => new Date(a.block.timestamp).getTime() - new Date(b.block.timestamp).getTime(),
    )
    .map((e: TallyEvent) => `${e.type}: ${formatDate(e.block.timestamp)}`)
    .join(" → ");
}

/**
 * Format Tally executable calls.
 */
function formatExecutableCalls(options: unknown): string | null {
  const opts = options as TallyOptions | null;
  if (!opts?.executableCalls || opts.executableCalls.length === 0) return null;

  return opts.executableCalls.map(call => `Target: ${call.target}, Value: ${call.value}`).join("; ");
}

/**
 * Build the Voting Data Document text for a proposal.
 * Contains: Snapshot results, Tally results, executable calls, events timeline.
 */
function buildVotingDataText(proposal: ProposalWithAllData): string | null {
  const lines: string[] = [];
  let hasContent = false;

  lines.push(`# Voting Data: ${proposal.title}`);
  lines.push("");

  // Snapshot results
  if (proposal.snapshot?.options) {
    const results = formatSnapshotResults(proposal.snapshot.options);
    if (results) {
      lines.push("## Snapshot Vote Results");
      lines.push(results);
      lines.push("");
      hasContent = true;
    }
  }

  // Tally results
  if (proposal.tally?.options) {
    const results = formatTallyResults(proposal.tally.options);
    if (results) {
      lines.push("## Tally On-chain Vote Results");
      lines.push(results);
      lines.push("");
      hasContent = true;
    }

    // Executable calls
    const calls = formatExecutableCalls(proposal.tally.options);
    if (calls) {
      lines.push("## Executable Calls");
      lines.push(calls);
      lines.push("");
      hasContent = true;
    }

    // Events timeline
    const timeline = formatEventsTimeline(proposal.tally.options);
    if (timeline) {
      lines.push("## Events Timeline");
      lines.push(timeline);
      lines.push("");
      hasContent = true;
    }
  }

  if (!hasContent) return null;
  return lines.join("\n");
}

/**
 * Create the Summary Document for a proposal (1 per proposal).
 */
export function createSummaryDocument(proposal: ProposalWithAllData): Document {
  const text = buildSummaryText(proposal);
  const contentHash = computeContentHash(text);

  // Pick the best stage for metadata
  const stage = proposal.tally ? "tally" : proposal.snapshot ? "snapshot" : "forum";
  const status = proposal.tally?.status || proposal.snapshot?.status || "";
  const url = proposal.tally?.url || proposal.snapshot?.url || proposal.forum?.url || "";
  const sourceId =
    proposal.tally?.tally_proposal_id || proposal.snapshot?.snapshot_id || proposal.forum?.original_id || "";

  const metadata: RagNodeMetadata = {
    proposal_id: proposal.id,
    stage,
    doc_type: "summary",
    status: status.toLowerCase(),
    url,
    source_id: sourceId,
    chunk_index: 0,
    content_hash: contentHash,
  };

  return new Document({
    text,
    id_: generateNodeId(proposal.id, "summary", 0),
    metadata,
  });
}

/**
 * Create the Voting Data Document for a proposal (1 per proposal, if data exists).
 */
export function createVotingDocument(proposal: ProposalWithAllData): Document | null {
  const text = buildVotingDataText(proposal);
  if (!text) return null;

  const contentHash = computeContentHash(text);

  const stage = proposal.tally ? "tally" : "snapshot";
  const status = proposal.tally?.status || proposal.snapshot?.status || "";
  const url = proposal.tally?.url || proposal.snapshot?.url || "";
  const sourceId = proposal.tally?.tally_proposal_id || proposal.snapshot?.snapshot_id || "";

  const metadata: RagNodeMetadata = {
    proposal_id: proposal.id,
    stage,
    doc_type: "voting_data",
    status: status.toLowerCase(),
    url,
    source_id: sourceId,
    chunk_index: 0,
    content_hash: contentHash,
  };

  return new Document({
    text,
    id_: generateNodeId(proposal.id, "voting", 0),
    metadata,
  });
}

/**
 * Create LlamaIndex Documents from forum posts for a proposal.
 * Creates one document per post with stable IDs.
 * Skips post_number === 1 when proposal has snapshot body or tally description
 * (avoids embedding the same ~3K words twice).
 */
export function createDocumentsFromForumStage(proposal: ProposalWithAllData): Document[] {
  const documents: Document[] = [];

  if (!proposal.forum?.posts || proposal.forum.posts.length === 0) {
    return documents;
  }

  // Check if we have rich body text from other stages
  const hasBodyText = !!proposal.snapshot?.body || !!proposal.tally?.description;

  for (const post of proposal.forum.posts) {
    // Skip deleted posts
    if (post.is_deleted) continue;

    // Skip post 1 when body text is available (it's duplicate content)
    if (post.post_number === 1 && hasBodyText) continue;

    // Skip posts with empty or whitespace-only content
    const content = post.content?.trim();
    if (!content || content.length === 0) {
      console.warn(`Skipping empty content for post ${post.post_number} in proposal ${proposal.id}`);
      continue;
    }

    const metadata: RagNodeMetadata = {
      proposal_id: proposal.id,
      stage: "forum",
      doc_type: "forum_post",
      status: "",
      url: `${proposal.forum.url}/${post.post_number}`,
      source_id: proposal.forum.original_id || "",
      post_number: post.post_number,
      author_name: post.author_name,
      author_username: post.author_username,
      content_type: post.post_number === 1 ? "original" : "comment",
      posted_at: post.posted_at,
      reply_to_post_number: post.reply_to_post_number,
    };

    documents.push(
      new Document({
        id_: generateNodeId(proposal.id, "forum", post.post_number),
        text: content,
        metadata,
      }),
    );
  }

  return documents;
}
