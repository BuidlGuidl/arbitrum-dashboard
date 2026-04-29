import { NextRequest, NextResponse } from "next/server";
import { importTallyProposals } from "~~/services/tally/import";

export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const startedAt = Date.now();

  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.error("Unauthorized attempt to access import-tally-proposals endpoint");
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    console.log("Importing Tally proposals...");
    await importTallyProposals();
    const durationMs = Date.now() - startedAt;
    console.log(`Tally proposals import finished in ${durationMs}ms`);

    return NextResponse.json({
      success: true,
      message: "Tally proposals imported successfully",
      durationMs,
    });
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    console.error(`Error importing Tally proposals after ${durationMs}ms:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        durationMs,
      },
      { status: 500 },
    );
  }
}
