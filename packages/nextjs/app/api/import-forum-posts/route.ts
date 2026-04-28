import { NextRequest, NextResponse } from "next/server";
import { importForumPosts } from "~~/services/forum/import";

export const maxDuration = 300;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error("Unauthorized attempt to access import-forum-posts endpoint");
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    console.log("Importing forum posts...");
    await importForumPosts();

    return NextResponse.json({
      success: true,
      message: "Forum posts imported successfully",
    });
  } catch (error) {
    console.error("Error importing forum posts:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
