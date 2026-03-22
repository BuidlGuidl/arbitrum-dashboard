import { matchingResult, proposals, snapshotStage, tallyStage } from "../config/schema";
import { InferInsertModel, and, desc, eq } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import {
  type SnapshotOptions,
  type TallyOptions,
  type VoteInfo,
  extractSnapshotVotes,
  extractTallyVotes,
  mapTallyStatus,
  resolveSnapshotResult,
  timeAgo,
} from "~~/utils/proposalTransforms";

type ProposalData = InferInsertModel<typeof proposals>;

export async function getAllProposals() {
  return await db.query.proposals.findMany();
}

export async function createProposal(proposalData: ProposalData) {
  const [newProposal] = await db.insert(proposals).values(proposalData).returning();
  return newProposal;
}

export type VotingStageItem = {
  id: string;
  status: string | null;
  displayStatus: string | null;
  lastUpdate: string | null;
  link: string | null;
  title: string | null;
  votes?: VoteInfo;
};

// Strip "Pending execution (...)" wrapper for compact badge display
function formatDisplayStatus(status: string | null): string | null {
  if (!status) return null;
  if (status.startsWith("Pending execution")) return status.replace("Pending execution (", "").replace(")", "");
  return status;
}

export async function getDashboardProposals() {
  // 1. Fetch proposals with forum stages (forum still uses direct FK)
  const proposalRows = await db.query.proposals.findMany({
    with: {
      forumStages: {
        orderBy: (forumStage, { desc }) => [desc(forumStage.last_message_at)],
        limit: 1,
      },
    },
  });

  // 2. Fetch matched snapshot stages via matching_result
  const snapshotLinks = await db
    .select({
      proposalId: matchingResult.proposal_id,
      stage: snapshotStage,
    })
    .from(matchingResult)
    .innerJoin(snapshotStage, eq(matchingResult.source_stage_id, snapshotStage.id))
    .where(and(eq(matchingResult.source_type, "snapshot"), eq(matchingResult.status, "matched")))
    .orderBy(desc(snapshotStage.voting_end));

  // 3. Fetch matched tally stages via matching_result
  const tallyLinks = await db
    .select({
      proposalId: matchingResult.proposal_id,
      stage: tallyStage,
    })
    .from(matchingResult)
    .innerJoin(tallyStage, eq(matchingResult.source_stage_id, tallyStage.id))
    .where(and(eq(matchingResult.source_type, "tally"), eq(matchingResult.status, "matched")))
    .orderBy(desc(tallyStage.last_activity));

  // 4. Group stages by proposal_id
  const snapshotsByProposal = new Map<string, (typeof snapshotLinks)[number]["stage"][]>();
  for (const link of snapshotLinks) {
    if (!link.proposalId) continue;
    const arr = snapshotsByProposal.get(link.proposalId) ?? [];
    arr.push(link.stage);
    snapshotsByProposal.set(link.proposalId, arr);
  }

  const tallyByProposal = new Map<string, (typeof tallyLinks)[number]["stage"][]>();
  for (const link of tallyLinks) {
    if (!link.proposalId) continue;
    const arr = tallyByProposal.get(link.proposalId) ?? [];
    arr.push(link.stage);
    tallyByProposal.set(link.proposalId, arr);
  }

  // 5. Assemble results (same shape as before)
  const assembled = proposalRows.map(row => {
    const forum = row.forumStages[0] ?? null;
    const snapshotStages = snapshotsByProposal.get(row.id) ?? [];
    const tallyStages = tallyByProposal.get(row.id) ?? [];

    const snapshot = snapshotStages[0] ?? null;
    const tally = tallyStages[0] ?? null;

    const snapshotOptions = snapshot?.options as SnapshotOptions | null;
    const tallyOptions = tally?.options as TallyOptions | null;

    // Map older snapshot stages (skip index 0, which is the latest)
    const snapshotHistory: VotingStageItem[] = snapshotStages.slice(1).map(s => {
      const opts = s.options as SnapshotOptions | null;
      const status = resolveSnapshotResult(s.status ?? null, opts);
      return {
        id: s.id,
        status,
        displayStatus: status,
        lastUpdate: timeAgo(s.voting_end ?? s.voting_start ?? null),
        link: s.url ?? null,
        title: s.title ?? null,
      };
    });

    // Map older tally stages (skip index 0, which is the latest)
    const tallyHistory: VotingStageItem[] = tallyStages.slice(1).map(t => {
      const opts = t.options as TallyOptions | null;
      const status = mapTallyStatus(t.status ?? null, t.substatus ?? null);
      return {
        id: t.id,
        status,
        displayStatus: formatDisplayStatus(status),
        lastUpdate: timeAgo(t.last_activity ?? t.updated_at ?? null),
        link: t.url ?? null,
        title: t.title ?? null,
        votes: extractTallyVotes(opts),
      };
    });

    const lastActivityDate = tally?.last_activity ?? snapshot?.voting_end ?? forum?.last_message_at ?? null;

    return {
      id: row.id,
      title: row.title,
      forumLink: forum?.url ?? null,
      snapshotLink: snapshot?.url ?? null,
      tallyLink: tally?.url ?? null,
      forumStatus: forum ? (snapshot || tally ? "Completed" : "Active Discussion") : null,
      snapshotStatus: resolveSnapshotResult(snapshot?.status ?? null, snapshotOptions),
      tallyStatus: mapTallyStatus(tally?.status ?? null, tally?.substatus ?? null),
      tallyDisplayStatus: formatDisplayStatus(mapTallyStatus(tally?.status ?? null, tally?.substatus ?? null)),
      forumLastUpdate: timeAgo(forum?.last_message_at ?? null),
      snapshotLastUpdate: timeAgo(snapshot?.voting_end ?? snapshot?.voting_start ?? null),
      tallyLastUpdate: timeAgo(tally?.last_activity ?? tally?.updated_at ?? null),
      category: row.category ?? "Uncategorized",
      author: row.author_name ?? "Unknown",
      votes: tally ? extractTallyVotes(tallyOptions) : extractSnapshotVotes(snapshotOptions),
      lastActivity: timeAgo(lastActivityDate),
      snapshotHistory,
      tallyHistory,
    };
  });

  // Sort by most relevant stage date: tally > snapshot > forum
  assembled.sort((a, b) => {
    const getDate = (item: (typeof assembled)[number]) => {
      const tallyStages = tallyByProposal.get(item.id);
      const snapStages = snapshotsByProposal.get(item.id);
      const forumRow = proposalRows.find(p => p.id === item.id);
      return (
        tallyStages?.[0]?.last_activity ??
        snapStages?.[0]?.voting_end ??
        forumRow?.forumStages[0]?.last_message_at ??
        null
      );
    };
    return (getDate(b)?.getTime() ?? 0) - (getDate(a)?.getTime() ?? 0);
  });

  return assembled;
}

export type DashboardProposal = Awaited<ReturnType<typeof getDashboardProposals>>[number];
