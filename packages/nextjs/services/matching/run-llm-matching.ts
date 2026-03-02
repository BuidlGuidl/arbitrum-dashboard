import { matchStage } from "./llm-matching";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables before importing database modules
dotenv.config({ path: path.resolve(__dirname, "../../.env.development") });

function parseArgs(): { type?: "tally" | "snapshot"; id?: string } {
  const args = process.argv.slice(2);
  let type: "tally" | "snapshot" | undefined;
  let id: string | undefined;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--type":
        type = args[++i] as "tally" | "snapshot";
        if (type !== "tally" && type !== "snapshot") {
          console.error(`Invalid type: ${type}. Must be "tally" or "snapshot".`);
          process.exit(1);
        }
        break;
      case "--id":
        id = args[++i];
        break;
      default:
        console.error(`Unknown argument: ${args[i]}`);
        printUsage();
        process.exit(1);
    }
  }

  return { type, id };
}

function printUsage(): void {
  console.log(`
Usage:
  yarn match:llm --type tally --id <stage-uuid>    Match a specific tally stage
  yarn match:llm --type snapshot --id <stage-uuid>  Match a specific snapshot stage
`);
}

async function main(): Promise<void> {
  const { type, id } = parseArgs();

  if (!id || !type) {
    console.error("Both --type and --id are required");
    printUsage();
    process.exit(1);
  }

  console.log(`Matching ${type} stage: ${id}\n`);
  const result = await matchStage(type, id);
  console.log(`\nResult: ${result.status}${result.proposalId ? ` → ${result.proposalId}` : ""}`);
}

main()
  .then(() => {
    console.log("\nDone!");
    process.exit(0);
  })
  .catch(error => {
    console.error("LLM matching failed:", error);
    process.exit(1);
  });
