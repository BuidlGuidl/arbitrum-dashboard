// RAG Service - Main exports

export { RAG_CONFIG, validateRagConfig } from "./config";
export {
  createSummaryDocument,
  createVotingDocument,
  createDocumentsFromForumStage,
  computeContentHash,
  generateNodeId,
} from "./documentBuilder";
export { runIngestion, fetchAllProposalData } from "./ingestion";
export { queryRag, searchSimilar } from "./retrieval";
export { getVectorStore, initializeVectorStore, clearVectorStore, closeVectorStore } from "./vectorStore";
export type {
  RagQueryInput,
  RagQueryOutput,
  RagCitation,
  IngestionResult,
  ProposalWithAllData,
  ProposalStage,
  RagNodeMetadata,
  RagDocType,
  SnapshotOptions,
  TallyOptions,
  TallyVoteStat,
  TallyExecCall,
  TallyEvent,
  AllowedStatus,
} from "./types";
export { ALLOWED_STATUSES } from "./types";

// Evaluation pipeline
export { runEvaluation, printReport, saveReport, EVAL_CONFIG, TEST_QUERIES } from "./evaluation";
export type {
  EvalReport,
  EvalRunOptions,
  EvalSummary,
  EvalTestQuery,
  LLMEvalResult,
  QueryEvalResult,
  RetrievalResult,
} from "./evaluation";
