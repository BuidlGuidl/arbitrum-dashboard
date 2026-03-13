// RAG Service Types
import { ForumPost } from "~~/services/forum/types";

export type ProposalStage = "forum" | "snapshot" | "tally";

// Document type distinguishes the 3 kinds of RAG documents
export type RagDocType = "summary" | "voting_data" | "forum_post";

// Typed interfaces for Snapshot options JSONB
export type SnapshotOptions = {
  choices: string[];
  scores: number[];
};

// Typed interfaces for Tally options JSONB
export type TallyVoteStat = {
  type: string;
  votesCount: string;
  votersCount: number | string;
  percent: number | string;
};

export type TallyExecCall = {
  calldata: string;
  target: string;
  value: string;
};

export type TallyEvent = {
  block: {
    number: number;
    timestamp: string;
  };
  chainId: number;
  createdAt: string;
  type: string;
  txHash: string | null;
};

export type TallyOptions = {
  voteStats: TallyVoteStat[];
  executableCalls: TallyExecCall[];
  events?: TallyEvent[];
};

// Metadata schema for each node in the vector store.
// Uses index signature to be compatible with LlamaIndex's Record<string, unknown> while
// still providing type hints for known fields.
export type RagNodeMetadata = {
  proposal_id: string;
  stage: ProposalStage;
  doc_type: RagDocType;
  status: string;
  url: string;
  source_id: string; // snapshot_id or forum original_id
  chunk_index?: number;
  content_hash?: string;
  // Forum-specific fields
  post_number?: number;
  author_name?: string;
  author_username?: string;
  content_type?: "original" | "comment";
  posted_at?: string;
  total_chunks?: number;
  reply_to_post_number?: number;
  // Allow additional fields for LlamaIndex compatibility
  [key: string]: unknown;
};

// Input for RAG queries
export type RagQueryInput = {
  query: string;
  filters?: {
    stage?: ProposalStage[];
    status?: string[];
  };
  topK?: number;
};

// Citation returned with answers
export type RagCitation = {
  proposal_id: string;
  stage: ProposalStage;
  url: string;
  snippet: string;
  title?: string;
};

// Output from RAG queries
export type RagQueryOutput = {
  answer: string;
  citations: RagCitation[];
};

// Ingestion result
export type IngestionResult = {
  success: boolean;
  totalDocuments: number;
  newNodes: number;
  updatedNodes: number;
  skippedNodes: number;
  errors: string[];
};

// Unified proposal type with all stage data + forum posts for document building
export type ProposalWithAllData = {
  id: string;
  title: string;
  author_name: string | null;
  category: string | null;
  created_at: Date | null;
  forum?: {
    id: string;
    original_id: string | null;
    title: string | null;
    author_name: string | null;
    url: string | null;
    message_count: number | null;
    last_message_at: Date | null;
    posts: ForumPost[];
  } | null;
  snapshot?: {
    id: string;
    snapshot_id: string | null;
    title: string | null;
    author_name: string | null;
    url: string | null;
    body: string | null;
    status: string | null;
    voting_start: Date | null;
    voting_end: Date | null;
    options: unknown;
  } | null;
  tally?: {
    id: string;
    tally_proposal_id: string | null;
    title: string | null;
    author_name: string | null;
    url: string | null;
    onchain_id: string | null;
    description: string | null;
    discourse_url: string | null;
    snapshot_url: string | null;
    status: string | null;
    substatus: string | null;
    substatus_deadline: Date | null;
    start_timestamp: Date | null;
    end_timestamp: Date | null;
    options: unknown;
  } | null;
};

// Allowed status values for filtering
export const ALLOWED_STATUSES = [
  "active",
  "closed",
  "pending",
  "executed",
  "defeated",
  "queued",
  "canceled",
  "expired",
] as const;

export type AllowedStatus = (typeof ALLOWED_STATUSES)[number];
