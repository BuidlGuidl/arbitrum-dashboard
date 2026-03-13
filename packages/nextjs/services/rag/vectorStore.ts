// Vector Store Configuration using LlamaIndex PGVectorStore
import { RAG_CONFIG } from "./config";
import { PGVectorStore } from "@llamaindex/postgres";

let vectorStoreInstance: PGVectorStore | null = null;

/**
 * Get or create the PGVectorStore instance.
 * Uses connectionString directly (pg.ClientConfig supports it natively).
 * keepAlive prevents Neon from dropping the connection during long embedding phases.
 */
export function getVectorStore(): PGVectorStore {
  if (vectorStoreInstance) {
    return vectorStoreInstance;
  }

  const postgresUrl = process.env.POSTGRES_URL;
  if (!postgresUrl) {
    throw new Error("POSTGRES_URL environment variable is required");
  }

  vectorStoreInstance = new PGVectorStore({
    clientConfig: {
      connectionString: postgresUrl,
      keepAlive: true,
    },
    dimensions: RAG_CONFIG.embeddingDimensions,
    tableName: RAG_CONFIG.vectorTableName,
  });

  return vectorStoreInstance;
}

/**
 * Initialize the vector store - creates tables and indexes if needed.
 * Should be called before first use.
 */
export async function initializeVectorStore(): Promise<void> {
  const vectorStore = getVectorStore();

  // Set a collection name for this use case
  vectorStore.setCollection("arbitrum-proposals");

  console.log("Vector store initialized with collection: arbitrum-proposals");
}

/**
 * Clear all vectors from the store.
 * Useful for full re-ingestion.
 */
export async function clearVectorStore(): Promise<void> {
  const vectorStore = getVectorStore();
  await vectorStore.clearCollection();
  console.log("Vector store collection cleared");
}

/**
 * Close the vector store connection and reset the instance.
 */
export async function closeVectorStore(): Promise<void> {
  if (vectorStoreInstance) {
    const db = (vectorStoreInstance as unknown as { db: { close: () => Promise<void> } | null }).db;
    if (db?.close) {
      await db.close();
    }
    vectorStoreInstance = null;
  }
}
