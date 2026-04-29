import { ChartPieIcon, ChatBubbleLeftEllipsisIcon, CheckCircleIcon, LinkIcon } from "@heroicons/react/24/solid";
import type { DashboardProposal } from "~~/services/database/repositories/proposals";

export type Stats = {
  discussions: number;
  offchain: number;
  onchain: number;
  done: number;
};

export type StatCardConfig = {
  title: string;
  sub: string;
  color: string;
  Icon: React.ComponentType<{ className?: string }>;
  key: keyof Stats;
};

export const STAT_CARD_CONFIG: StatCardConfig[] = [
  {
    title: "Active Discussions",
    sub: "Forum stage proposals with no offchain or onchain voting stages",
    color: "text-orange-500",
    Icon: ChatBubbleLeftEllipsisIcon,
    key: "discussions",
  },
  {
    title: "Active Offchain Votes",
    sub: "Snapshot voting in progress",
    color: "text-purple-500",
    Icon: ChartPieIcon,
    key: "offchain",
  },
  {
    title: "Active Onchain Votes",
    sub: "Tally voting in progress",
    color: "text-cyan-500",
    Icon: LinkIcon,
    key: "onchain",
  },
  {
    title: "Executed / Pending Execution",
    sub: "Completed or awaiting execution",
    color: "text-green-500",
    Icon: CheckCircleIcon,
    key: "done",
  },
];

export const computeStats = (proposals: DashboardProposal[]): Stats => ({
  discussions: proposals.filter(p => p.forumStatus === "Active Discussion").length,
  offchain: proposals.filter(p => p.snapshotStatus && !["Passed", "Failed"].includes(p.snapshotStatus)).length,
  onchain: proposals.filter(
    p =>
      p.tallyStatus &&
      !["Executed", "Cross-chain Executed", "Canceled", "Defeated"].includes(p.tallyStatus) &&
      !p.tallyStatus.startsWith("Pending"),
  ).length,
  done: proposals.filter(
    p =>
      p.tallyStatus === "Executed" || p.tallyStatus === "Cross-chain Executed" || p.tallyStatus?.startsWith("Pending"),
  ).length,
});
