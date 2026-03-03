// JSONB shapes stored in the DB
export type SnapshotOptions = {
  choices: string[];
  scores: number[];
};

export type TallyOptions = {
  voteStats: Array<{
    type: string;
    votesCount: string;
    votersCount: string;
    percent: string;
  }>;
  executableCalls?: Array<unknown>;
};

// Helpers
export function formatVoteCount(raw: string): string {
  const num = Number(raw) / 1e18;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
  return num.toFixed(2);
}

// TODO: Maybe we cna use date-fns if require this / other function instead of creating our own
export function timeAgo(date: Date | null): string | null {
  if (!date) return null;
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffDays < 1) {
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return "just now";
  }

  if (diffDays < 30) return `${diffDays}d ago`;

  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  const days = diffDays % 30;

  const parts: string[] = [];
  if (years > 0) parts.push(`${years}y`);
  if (months > 0) parts.push(`${months}mo`);
  if (days > 0 && years === 0) parts.push(`${days}d`);

  return `${parts.join(" ")} ago`;
}

export function mapTallyStatus(status: string | null, substatus: string | null): string | null {
  if (!status) return null;
  const s = status.toLowerCase();
  if (s === "executed") return "Executed";
  if (s === "crosschainexecuted") return "Cross-chain Executed";
  if (s === "canceled" || s === "cancelled") return "Canceled";
  if (s === "defeated") return "Defeated";
  if (s === "queued") return `Pending execution (${substatus || "Proposal queued"})`;
  if (s === "active") return "Active";
  if (substatus) return `Pending execution (${substatus})`;
  return status;
}

export function resolveSnapshotResult(status: string | null, options: SnapshotOptions | null): string | null {
  if (!status) return null;
  const s = status.toLowerCase();

  if (s === "active") return "Active";
  if (s === "pending") return "Pending";

  if (s === "closed" && options?.choices && options?.scores && options.choices.length >= 2) {
    const forIdx = options.choices.findIndex(c => c.toLowerCase().startsWith("for"));
    const againstIdx = options.choices.findIndex(c => c.toLowerCase().startsWith("against"));
    if (forIdx !== -1 && againstIdx !== -1) {
      return options.scores[forIdx] > options.scores[againstIdx] ? "Passed" : "Failed";
    }
    // Fallback: highest score at index 0 → Passed
    const maxScore = Math.max(...options.scores);
    return options.scores.indexOf(maxScore) === 0 ? "Passed" : "Failed";
  }

  return s === "closed" ? "Closed" : status;
}

export type VoteInfo = {
  for?: string;
  against?: string;
  choices?: { label: string; shortLabel: string; value: string }[];
  total: string;
};

function formatScore(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
  return n.toFixed(2);
}

function truncateLabel(label: string): string {
  const words = label.split(/\s+/);
  if (words.length <= 2) return label;
  return `${words.slice(0, 2).join(" ")}…`;
}

export function extractTallyVotes(options: TallyOptions | null): VoteInfo | undefined {
  if (!options?.voteStats?.length) return undefined;

  const forStat = options.voteStats.find(s => s.type.toLowerCase() === "for");
  const againstStat = options.voteStats.find(s => s.type.toLowerCase() === "against");
  if (!forStat && !againstStat) return undefined;

  const forCount = forStat ? formatVoteCount(forStat.votesCount) : "0";
  const againstCount = againstStat ? formatVoteCount(againstStat.votesCount) : "0";
  const totalRaw = options.voteStats.reduce((sum, s) => sum + Number(s.votesCount), 0);

  return { for: forCount, against: againstCount, total: formatVoteCount(totalRaw.toString()) };
}

export function extractSnapshotVotes(options: SnapshotOptions | null): VoteInfo | undefined {
  if (!options?.choices?.length || !options?.scores?.length) return undefined;

  const forIdx = options.choices.findIndex(c => c.toLowerCase().startsWith("for"));
  const againstIdx = options.choices.findIndex(c => c.toLowerCase().startsWith("against"));
  const total = options.scores.reduce((sum, s) => sum + s, 0);

  // Binary For/Against vote
  if (forIdx !== -1 && againstIdx !== -1) {
    return {
      for: formatScore(options.scores[forIdx] ?? 0),
      against: formatScore(options.scores[againstIdx] ?? 0),
      total: formatScore(total),
    };
  }

  // Multi-choice vote: show all choices
  const choices = options.choices.map((label, i) => ({
    label,
    shortLabel: truncateLabel(label),
    value: formatScore(options.scores[i] ?? 0),
  }));

  return { choices, total: formatScore(total) };
}
