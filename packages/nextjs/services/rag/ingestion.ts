// Ingestion Pipeline - Ingest proposals into vector store
import { RAG_CONFIG, validateRagConfig } from "./config";
import { createDocumentsFromForumStage, createSummaryDocument, createVotingDocument } from "./documentBuilder";
import { cleanupEncoder, estimateTokens } from "./tokens";
import { IngestionResult, ProposalWithAllData } from "./types";
import { closeVectorStore, getVectorStore, initializeVectorStore } from "./vectorStore";
import { OpenAI, OpenAIEmbedding } from "@llamaindex/openai";
import { and, desc, eq } from "drizzle-orm";
import { Document, SentenceSplitter, Settings, TextNode } from "llamaindex";
import { closeDb, db } from "~~/services/database/config/postgresClient";
import { forumStage, matchingResult, snapshotStage, tallyStage } from "~~/services/database/config/schema";
import { ForumPost, ForumPostsArraySchema } from "~~/services/forum/types";

// Chunking configuration
const CHUNK_SIZE = 512; // tokens
const CHUNK_OVERLAP = 50; // tokens

/**
 * Fetch all proposal data in a single pass: proposals + all stages + forum posts + body/description fields.
 *
 * Stages are sourced from `matching_result` (the canonical link table after PR #28),
 * mirroring `getDashboardProposals`. The previous implementation joined via the
 * `proposal_id` FK on stage tables, which can be stale or unset for newly matched
 * stages, and which collapses bundled votes into a single mapping. Picking the
 * most-recent matched stage per proposal keeps RAG answers consistent with what
 * users see on the homepage.
 */
export async function fetchAllProposalData(): Promise<ProposalWithAllData[]> {
  const [proposalRows, forumRows, snapshotLinks, tallyLinks] = await Promise.all([
    db.query.proposals.findMany(),
    db.select().from(forumStage),
    db
      .select({ proposalId: matchingResult.proposal_id, stage: snapshotStage })
      .from(matchingResult)
      .innerJoin(snapshotStage, eq(matchingResult.source_stage_id, snapshotStage.id))
      .where(and(eq(matchingResult.source_type, "snapshot"), eq(matchingResult.status, "matched")))
      .orderBy(desc(snapshotStage.voting_end)),
    db
      .select({ proposalId: matchingResult.proposal_id, stage: tallyStage })
      .from(matchingResult)
      .innerJoin(tallyStage, eq(matchingResult.source_stage_id, tallyStage.id))
      .where(and(eq(matchingResult.source_type, "tally"), eq(matchingResult.status, "matched")))
      .orderBy(desc(tallyStage.last_activity)),
  ]);

  // Forum is still 1:1 via FK (no matching_result equivalent yet); pick the
  // freshest topic per proposal in case of duplicates.
  const forumByProposal = new Map<string, (typeof forumRows)[number]>();
  for (const f of forumRows) {
    if (!f.proposal_id) continue;
    const existing = forumByProposal.get(f.proposal_id);
    const fAt = f.last_message_at?.getTime() ?? 0;
    const eAt = existing?.last_message_at?.getTime() ?? 0;
    if (!existing || fAt > eAt) forumByProposal.set(f.proposal_id, f);
  }

  // First link wins because the joins are pre-sorted by recency descending.
  const snapshotByProposal = new Map<string, (typeof snapshotLinks)[number]["stage"]>();
  for (const link of snapshotLinks) {
    if (!link.proposalId || snapshotByProposal.has(link.proposalId)) continue;
    snapshotByProposal.set(link.proposalId, link.stage);
  }
  const tallyByProposal = new Map<string, (typeof tallyLinks)[number]["stage"]>();
  for (const link of tallyLinks) {
    if (!link.proposalId || tallyByProposal.has(link.proposalId)) continue;
    tallyByProposal.set(link.proposalId, link.stage);
  }

  return proposalRows.map(proposal => {
    const forum = forumByProposal.get(proposal.id);
    const snapshot = snapshotByProposal.get(proposal.id);
    const tally = tallyByProposal.get(proposal.id);

    let forumPosts: ProposalWithAllData["forum"] = null;
    if (forum) {
      let posts: ForumPost[] = [];
      if (forum.posts_json && forum.content_fetch_status !== "failed") {
        const validation = ForumPostsArraySchema.safeParse(forum.posts_json);
        if (validation.success && validation.data.length > 0) {
          posts = validation.data;
        }
      }
      forumPosts = {
        id: forum.id,
        original_id: forum.original_id,
        title: forum.title,
        author_name: forum.author_name,
        url: forum.url,
        message_count: forum.message_count,
        last_message_at: forum.last_message_at,
        posts,
      };
    }

    return {
      id: proposal.id,
      title: proposal.title,
      author_name: proposal.author_name,
      category: proposal.category,
      created_at: proposal.created_at,
      forum: forumPosts,
      snapshot: snapshot || null,
      tally: tally || null,
    };
  });
}

/**
 * Configure LlamaIndex Settings with OpenAI models.
 */
function configureSettings(): void {
  Settings.llm = new OpenAI({
    model: RAG_CONFIG.chatModel,
    apiKey: process.env.OPENAI_API_KEY,
    temperature: 1, // gpt-5-mini only supports temperature=1
  });

  Settings.embedModel = new OpenAIEmbedding({
    model: RAG_CONFIG.embeddingModel,
    apiKey: process.env.OPENAI_API_KEY,
    dimensions: RAG_CONFIG.embeddingDimensions,
  });
}

/**
 * Chunk documents using SentenceSplitter.
 * Applies to all document types that may exceed the token threshold.
 * Returns TextNode[] ready for vector store insertion.
 */
async function chunkDocuments(documents: Document[]): Promise<TextNode[]> {
  const splitter = new SentenceSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });

  const allNodes: TextNode[] = [];

  for (const doc of documents) {
    const tokenCount = estimateTokens(doc.text);
    const nodes = await splitter.getNodesFromDocuments([doc]);

    // Add chunk metadata for multi-chunk documents
    if (tokenCount > CHUNK_SIZE && nodes.length > 1) {
      for (let idx = 0; idx < nodes.length; idx++) {
        nodes[idx].metadata.chunk_index = idx;
        nodes[idx].metadata.total_chunks = nodes.length;
      }
    }

    allNodes.push(...nodes);
  }

  return allNodes;
}

/**
 * Embed and ingest nodes into the vector store.
 * Handles batching for both embedding generation and PostgreSQL insertion.
 */
async function embedAndIngestNodes(nodes: TextNode[], label: string): Promise<number> {
  if (nodes.length === 0) return 0;

  console.log(`Embedding ${nodes.length} ${label} chunks...`);

  const embedModel = Settings.embedModel;
  const embeddingBatchSize = 100;

  for (let i = 0; i < nodes.length; i += embeddingBatchSize) {
    const batch = nodes.slice(i, i + embeddingBatchSize);
    const texts = batch.map(node => node.getContent(undefined));

    // Filter out empty or whitespace-only texts (OpenAI API requirement)
    const validIndices: number[] = [];
    const validTexts: string[] = [];

    for (let j = 0; j < texts.length; j++) {
      const text = texts[j]?.trim();
      if (text && text.length > 0) {
        validIndices.push(j);
        validTexts.push(texts[j]);
      } else {
        console.warn(`Skipping empty content for node at index ${i + j}`);
      }
    }

    if (validTexts.length > 0) {
      const embeddings = await embedModel.getTextEmbeddingsBatch(validTexts);
      for (let k = 0; k < validIndices.length; k++) {
        batch[validIndices[k]].embedding = embeddings[k];
      }
    }

    const progress = Math.min(i + embeddingBatchSize, nodes.length);
    process.stdout.write(`\r  Embedded ${progress}/${nodes.length} ${label} chunks`);
  }
  console.log("");

  // Filter out nodes without embeddings
  const validNodes = nodes.filter(node => node.embedding && node.embedding.length > 0);

  if (validNodes.length < nodes.length) {
    console.warn(`Skipped ${nodes.length - validNodes.length} nodes with empty content`);
  }

  // Connect to vector store only now — after all embeddings are done.
  // This avoids Neon killing the idle connection during the long OpenAI embedding phase.
  await initializeVectorStore();
  const insertBatchSize = 40;
  const vectorStore = getVectorStore();

  for (let i = 0; i < validNodes.length; i += insertBatchSize) {
    const batch = validNodes.slice(i, i + insertBatchSize);
    await vectorStore.add(batch);

    const progress = Math.min(i + insertBatchSize, validNodes.length);
    process.stdout.write(`\r  Ingested ${progress}/${validNodes.length} ${label} chunks`);
  }
  console.log("");

  return validNodes.length;
}

/**
 * Run the ingestion pipeline.
 * Simplified to 3 phases: Fetch → Build → Chunk & Embed.
 */
export async function runIngestion(options?: { clearFirst?: boolean }): Promise<IngestionResult> {
  const result: IngestionResult = {
    success: false,
    totalDocuments: 0,
    newNodes: 0,
    updatedNodes: 0,
    skippedNodes: 0,
    errors: [],
  };

  try {
    // Validate configuration
    const configValidation = validateRagConfig();
    if (!configValidation.valid) {
      result.errors = configValidation.errors;
      return result;
    }

    // Configure LlamaIndex
    configureSettings();

    // Optionally clear existing data (connect, clear, disconnect to avoid idle timeout)
    if (options?.clearFirst) {
      await initializeVectorStore();
      const vectorStore = getVectorStore();
      await vectorStore.clearCollection();
      console.log("Cleared existing vector data");
      await closeVectorStore();
    }

    // ========== PHASE 1: Fetch all proposal data ==========
    console.log("\n=== Phase 1: Fetch ===");
    const proposals = await fetchAllProposalData();
    console.log(`Found ${proposals.length} proposals`);

    // Close Drizzle DB pool — not needed after fetch. Prevents Neon idle connection timeout
    // during the long embedding phase. The vector store uses its own separate connection.
    await closeDb();

    // ========== PHASE 2: Build documents ==========
    console.log("\n=== Phase 2: Build Documents ===");
    const allDocuments: Document[] = [];

    let summaryCount = 0;
    let votingCount = 0;
    let forumPostCount = 0;
    let skippedPost1Count = 0;

    for (const proposal of proposals) {
      try {
        // Summary document (1 per proposal)
        const summaryDoc = createSummaryDocument(proposal);
        allDocuments.push(summaryDoc);
        summaryCount++;

        // Voting data document (1 per proposal, if voting data exists)
        const votingDoc = createVotingDocument(proposal);
        if (votingDoc) {
          allDocuments.push(votingDoc);
          votingCount++;
        }

        // Forum post documents (1 per post, skipping post 1 when body text exists)
        const hasBodyText = !!proposal.snapshot?.body || !!proposal.tally?.description;
        const forumPostsBefore = proposal.forum?.posts?.filter(p => p.post_number === 1 && !p.is_deleted).length || 0;
        const forumDocs = createDocumentsFromForumStage(proposal);
        allDocuments.push(...forumDocs);
        forumPostCount += forumDocs.length;
        if (hasBodyText && forumPostsBefore > 0) {
          skippedPost1Count++;
        }
      } catch (error) {
        const errorMsg = `Error building documents for proposal ${proposal.id}: ${error instanceof Error ? error.message : "Unknown"}`;
        console.error(errorMsg);
        result.errors.push(errorMsg);
      }
    }

    console.log(`Built ${allDocuments.length} total documents:`);
    console.log(`  - Summary documents: ${summaryCount}`);
    console.log(`  - Voting data documents: ${votingCount}`);
    console.log(`  - Forum post documents: ${forumPostCount}`);
    if (skippedPost1Count > 0) {
      console.log(`  - Skipped post #1 (duplicate body text): ${skippedPost1Count}`);
    }

    result.totalDocuments = allDocuments.length;

    if (allDocuments.length === 0) {
      result.success = true;
      result.errors.push("No documents to ingest");
      return result;
    }

    // ========== PHASE 3: Chunk & Embed ==========
    console.log("\n=== Phase 3: Chunk & Embed ===");
    console.log(`Chunking ${allDocuments.length} documents (chunk_size=${CHUNK_SIZE}, overlap=${CHUNK_OVERLAP})...`);

    const allNodes = await chunkDocuments(allDocuments);
    console.log(`Created ${allNodes.length} chunks from ${allDocuments.length} documents`);

    const ingestedCount = await embedAndIngestNodes(allNodes, "all");

    result.newNodes = ingestedCount;
    result.success = true;

    console.log(`\n✓ Ingestion complete!`);
    console.log(`  - Summary documents: ${summaryCount}`);
    console.log(`  - Voting data documents: ${votingCount}`);
    console.log(`  - Forum post documents: ${forumPostCount}`);
    console.log(`  - Total chunks: ${allNodes.length}`);
    console.log(`  - Total nodes indexed: ${ingestedCount}`);

    return result;
  } catch (error) {
    const errorMsg = `Ingestion failed: ${error instanceof Error ? error.message : "Unknown error"}`;
    console.error(errorMsg);
    result.errors.push(errorMsg);
    return result;
  } finally {
    // Cleanup encoder to free memory
    cleanupEncoder();
  }
}
