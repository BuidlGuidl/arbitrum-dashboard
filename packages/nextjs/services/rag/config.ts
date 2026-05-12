// RAG Configuration

// Environment variable defaults
export const RAG_CONFIG = {
  // OpenAI models
  embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-large",
  chatModel: process.env.OPENAI_CHAT_MODEL || "gpt-5-mini",

  // Embedding dimensions for text-embedding-3-small
  embeddingDimensions: 1536,

  // Query defaults — 10 keeps the synthesis context lean (~5K tokens) so we
  // finish well within the 30s app timeout. Combined with the similarity
  // cutoff below, weak hits get culled before reaching the LLM anyway.
  defaultTopK: Number(process.env.RAG_TOP_K) || 10,
  maxTopK: 20,

  // Timeouts
  timeoutMs: Number(process.env.RAG_TIMEOUT_MS) || 30000,

  // Minimum cosine similarity for retrieved nodes — anything below this is
  // dropped before synthesis so the LLM doesn't get pulled off-topic by weakly
  // related chunks and so the citations panel only surfaces actually-relevant
  // sources. Calibrated for text-embedding-3-large; tune via RAG_MIN_SIMILARITY.
  minSimilarity: Number(process.env.RAG_MIN_SIMILARITY) || 0.3,

  // Vector store table name (managed by LlamaIndex)
  vectorTableName: "llamaindex_proposal_vectors",

  // Chunk settings
  chunkSize: 512,
  chunkOverlap: 50,
} as const;

// Validate required environment variables
export function validateRagConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!process.env.OPENAI_API_KEY) {
    errors.push("OPENAI_API_KEY is required");
  }

  if (!process.env.POSTGRES_URL) {
    errors.push("POSTGRES_URL is required for vector store");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
