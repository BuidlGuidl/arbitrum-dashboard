"use client";

import { PendingStage, typeBadgeColor } from "./types";

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.round((now - then) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  const diffMonth = Math.round(diffDay / 30);
  return `${diffMonth}mo ago`;
}

interface Props {
  stages: PendingStage[];
  runningJobs: Map<string, string>;
  onMatch: (sourceType: "snapshot" | "tally", stageId: string) => void;
}

export function PendingStagesTable({ stages, runningJobs, onMatch }: Props) {
  if (stages.length === 0) {
    return (
      <div className="bg-base-200 rounded-xl p-6 text-center text-base-content/60">No pending stages to match.</div>
    );
  }

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm rounded-xl">
      <div className="p-3 lg:p-4 border-b border-base-300">
        <span className="text-sm text-base-content/60">{stages.length} pending stage(s)</span>
      </div>
      <div className="relative w-full overflow-x-auto">
        <table className="table table-sm w-full">
          <thead>
            <tr>
              <th>Type</th>
              <th>Title</th>
              <th>Author</th>
              <th>Last Activity</th>
              <th>URL</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {stages.map(stage => {
              const isRunning = runningJobs.has(stage.stageId);
              return (
                <tr key={stage.stageId}>
                  <td>
                    <span className={`badge badge-sm whitespace-nowrap border ${typeBadgeColor(stage.sourceType)}`}>
                      {stage.sourceType}
                    </span>
                  </td>
                  <td className="max-w-xs truncate" title={stage.title ?? ""}>
                    {stage.title ?? "—"}
                  </td>
                  <td className="max-w-[120px] truncate">{stage.authorName ?? "—"}</td>
                  <td
                    className="text-xs text-base-content/70 whitespace-nowrap"
                    title={stage.lastActivity ? new Date(stage.lastActivity).toLocaleString() : ""}
                  >
                    {relativeTime(stage.lastActivity)}
                  </td>
                  <td>
                    {stage.url ? (
                      <a
                        href={stage.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link link-primary text-xs"
                      >
                        View
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-xs"
                      onClick={() => onMatch(stage.sourceType, stage.stageId)}
                      disabled={isRunning}
                    >
                      {isRunning ? <span className="loading loading-spinner loading-xs" /> : "Match"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
