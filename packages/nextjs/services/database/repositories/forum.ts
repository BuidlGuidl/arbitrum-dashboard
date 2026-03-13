import { forumStage } from "../config/schema";
import { eq } from "drizzle-orm";
import { InferInsertModel } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { ForumPost, ForumPostsArraySchema } from "~~/services/forum/types";

type ForumStageData = InferInsertModel<typeof forumStage>;

export type ForumContentUpdate = {
  posts_json: ForumPost[];
  content_fetched_at: Date;
  content_fetch_status: "pending" | "success" | "failed" | "partial";
  last_fetched_post_count: number;
};

export type ForumStageWithContent = ForumStageData & {
  posts: ForumPost[];
};

export async function getAllForumStagesForComparison() {
  return db.query.forumStage.findMany({
    columns: {
      original_id: true,
      title: true,
      message_count: true,
      last_message_at: true,
      url: true,
    },
  });
}

export async function createForumStage(forumStageData: ForumStageData) {
  const [newForumStage] = await db.insert(forumStage).values(forumStageData).returning();
  return newForumStage;
}

export async function updateForumStageByOriginalId(originalId: string, updates: Partial<ForumStageData>) {
  const [updated] = await db.update(forumStage).set(updates).where(eq(forumStage.original_id, originalId)).returning();
  return updated;
}

export async function getForumStageByOriginalId(originalId: string) {
  return await db.query.forumStage.findFirst({
    where: eq(forumStage.original_id, originalId),
  });
}

export async function getForumStageByUrl(url: string) {
  return await db.query.forumStage.findFirst({
    where: eq(forumStage.url, url),
  });
}

/**
 * Update forum content for a specific forum stage.
 * Sets posts_json, fetch status, and retry metadata.
 */
export async function updateForumContent(forumStageId: string, content: ForumContentUpdate): Promise<void> {
  await db
    .update(forumStage)
    .set({
      posts_json: content.posts_json,
      content_fetched_at: content.content_fetched_at,
      content_fetch_status: content.content_fetch_status,
      last_fetched_post_count: content.last_fetched_post_count,
      updated_at: new Date(),
    })
    .where(eq(forumStage.id, forumStageId));
}

/**
 * Get forum stage with validated posts content for a proposal.
 * Validates posts_json against schema and logs validation errors.
 */
export async function getForumStageWithContent(proposalId: string): Promise<ForumStageWithContent | null> {
  const result = await db.query.forumStage.findFirst({
    where: eq(forumStage.proposal_id, proposalId),
  });

  if (!result) return null;

  // Validate posts_json with error logging
  let posts: ForumPost[] = [];
  if (result.posts_json) {
    const validation = ForumPostsArraySchema.safeParse(result.posts_json);
    if (validation.success) {
      posts = validation.data;
    } else {
      console.error(`Invalid posts_json for proposal ${proposalId}:`, validation.error.flatten());
    }
  }

  return {
    ...result,
    posts,
  };
}
