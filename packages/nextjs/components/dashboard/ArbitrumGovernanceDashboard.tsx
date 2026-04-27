"use client";

import { useMemo, useState } from "react";
import { StatsCard } from "./StatsCard";
import { VotingStageCell } from "./VotingStageCell";
import { ArrowTopRightOnSquareIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { ArbitrumLogo } from "~~/components/assets/ArbitrumLogo";
import type { DashboardProposal } from "~~/services/database/repositories/proposals";
import { STAT_CARD_CONFIG, computeStats } from "~~/utils/governanceStats";

const getStatus = (p: DashboardProposal) => {
  if (p.tallyStatus === "Executed" || p.tallyStatus === "Cross-chain Executed") return "Executed";
  if (p.tallyStatus?.startsWith("Pending execution")) return "Pending execution";
  if (p.tallyStatus === "Canceled") return "Canceled";
  if (p.tallyStatus === "Defeated") return "Defeated";
  if (p.tallyStatus === "Active") return "Active On-chain Vote";
  if (p.snapshotStatus === "Passed") return "Awaiting On-chain Vote";
  if (p.snapshotStatus === "Failed") return "Failed Off-chain";
  if (p.snapshotStatus === "Active" || p.snapshotStatus === "Pending") return "Active Off-chain Vote";
  if (p.forumStatus === "Active Discussion") return "In Discussion";
  return "Unknown";
};

export const STAGE_COLORS = {
  snapshot: {
    border: "border-purple-500/40",
    bg: "bg-purple-500/15",
    text: "text-purple-700 dark:text-purple-300 font-bold",
  },
  tally: {
    border: "border-cyan-500/40",
    bg: "bg-cyan-500/15",
    text: "text-cyan-700 dark:text-cyan-300 font-bold",
  },
  forum: {
    border: "border-orange-500/40",
    bg: "bg-orange-500/15",
    text: "text-orange-700 dark:text-orange-300 font-bold",
  },
} as const;

const getBadgeColor = (p: DashboardProposal) => {
  if (p.tallyLink) return `${STAGE_COLORS.tally.border} ${STAGE_COLORS.tally.bg} ${STAGE_COLORS.tally.text}`;
  if (p.snapshotLink)
    return `${STAGE_COLORS.snapshot.border} ${STAGE_COLORS.snapshot.bg} ${STAGE_COLORS.snapshot.text}`;
  return `${STAGE_COLORS.forum.border} ${STAGE_COLORS.forum.bg} ${STAGE_COLORS.forum.text}`;
};

export const ArbitrumGovernanceDashboard = ({ proposals }: { proposals: DashboardProposal[] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showForumOnly, setShowForumOnly] = useState(false);

  const filtered = useMemo(
    () =>
      proposals.filter(p => {
        const search = searchTerm.toLowerCase();
        if (search && !p.title.toLowerCase().includes(search) && !p.author?.toLowerCase().includes(search))
          return false;
        if (statusFilter !== "all" && !getStatus(p).toLowerCase().includes(statusFilter.toLowerCase())) return false;

        if (!showForumOnly && !p.snapshotStatus && !p.tallyStatus) return false;
        return true;
      }),
    [searchTerm, statusFilter, showForumOnly, proposals],
  );

  const stats = useMemo(() => computeStats(proposals), [proposals]);

  return (
    <div className="mx-auto w-full max-w-[1480px] px-5 py-4 lg:py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-4 mb-3">
          <ArbitrumLogo size={56} className="h-12 w-12 lg:h-14 lg:w-14" />
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight m-0">Arbitrum DAO Governance Tracking</h1>
        </div>
        <p className="text-base-content/60 text-lg">Unified proposal tracking across all governance stages</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARD_CONFIG.map(config => (
          <StatsCard key={config.key} config={config} value={stats[config.key]} />
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="input input-bordered flex items-center gap-2 w-72 max-w-full">
            <MagnifyingGlassIcon className="w-4 h-4" />
            <input
              type="text"
              className="grow"
              placeholder="Search proposals or authors..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </label>
          <select
            className="select select-bordered w-48 max-w-full"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="discussion">Forum: In Discussion</option>
            <option value="active off-chain">Snapshot: Active Off-chain Vote</option>
            <option value="awaiting">Snapshot: Awaiting On-chain Vote</option>
            <option value="failed">Snapshot: Failed</option>
            <option value="executed">Tally: Executed</option>
            <option value="pending">Tally: Pending execution</option>
            <option value="defeated">Tally: Defeated</option>
            <option value="canceled">Tally: Canceled</option>
            <option value="active on-chain">Tally: Active On-chain Vote</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
        <label className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-sm font-medium">Show active forum discussions</span>
          <input
            type="checkbox"
            className="toggle toggle-accent"
            checked={showForumOnly}
            onChange={() => setShowForumOnly(!showForumOnly)}
          />
        </label>
      </div>

      {/* Table */}
      <div className="card bg-base-100 border border-base-300 shadow-sm rounded-xl">
        <div className="p-3 lg:p-4 border-b border-base-300 flex items-center justify-end">
          <p className="text-sm text-base-content/60 p-0 m-0">
            Showing {filtered.length} of {proposals.length} proposals
          </p>
        </div>
        <div className="relative w-full overflow-x-auto">
          <table className="proposals-table table w-full table-fixed min-w-[1100px] [&_th]:py-5 [&_td]:py-6 [&_th]:px-3 [&_td]:px-3">
            <thead className="bg-base-200/60">
              <tr className="text-xs uppercase tracking-wider text-base-content/60">
                <th className="w-[26%]">Proposal</th>
                <th className="w-[14%]">Status</th>
                <th className="w-[10%]">
                  <div className="flex flex-col gap-0.5">
                    <span>Offchain</span>
                    <span className="text-[10px] normal-case tracking-normal text-base-content/50 font-normal">
                      Snapshot
                    </span>
                  </div>
                </th>
                <th className="w-[10%]">
                  <div className="flex flex-col gap-0.5">
                    <span>Onchain</span>
                    <span className="text-[10px] normal-case tracking-normal text-base-content/50 font-normal">
                      Tally
                    </span>
                  </div>
                </th>
                <th className="w-[9%]">Last Activity</th>
                <th className="w-[16%]">Votes</th>
                <th className="w-[10%]">Links</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-base-content/60">
                    No proposals found
                  </td>
                </tr>
              )}
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-base-300/60">
                  <td className="align-top">
                    <div
                      className="font-semibold text-sm mb-1 overflow-hidden"
                      style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
                    >
                      {p.title}
                    </div>
                    {p.author && <div className="text-xs text-base-content/60 truncate">by {p.author}</div>}
                  </td>
                  <td>
                    <div className={`badge badge-md whitespace-nowrap border ${getBadgeColor(p)}`}>{getStatus(p)}</div>
                  </td>
                  <td>
                    <VotingStageCell
                      status={p.snapshotStatus}
                      lastUpdate={p.snapshotLastUpdate}
                      link={p.snapshotLink}
                      history={p.snapshotHistory}
                      colorScheme={STAGE_COLORS.snapshot}
                    />
                  </td>
                  <td>
                    <VotingStageCell
                      status={p.tallyDisplayStatus}
                      lastUpdate={p.tallyLastUpdate}
                      link={p.tallyLink}
                      history={p.tallyHistory}
                      colorScheme={STAGE_COLORS.tally}
                    />
                  </td>
                  <td>
                    <span className="text-xs text-base-content/60 whitespace-nowrap">{p.lastActivity ?? "\u2014"}</span>
                  </td>
                  <td>
                    {p.votes ? (
                      <div className="text-xs leading-tight">
                        {p.votes.for !== undefined ? (
                          <>
                            <div className="grid grid-cols-[auto_1fr] gap-x-3">
                              <span className="text-green-600 font-semibold">For</span>
                              <span className="text-green-600 font-semibold text-right tabular-nums">
                                {p.votes.for}
                              </span>
                              <span className="text-red-600 font-semibold">Against</span>
                              <span className="text-red-600 font-semibold text-right tabular-nums">
                                {p.votes.against}
                              </span>
                              <span className="text-base-content/60">Total</span>
                              <span className="text-base-content/60 text-right tabular-nums">{p.votes.total}</span>
                            </div>
                            <VoteProgressBar forRaw={p.votes.forRaw} againstRaw={p.votes.againstRaw} />
                          </>
                        ) : p.votes.choices ? (
                          <div
                            className="tooltip tooltip-left"
                            data-tip={p.votes.choices.map(c => `${c.label}: ${c.value}`).join("\n")}
                          >
                            {p.votes.choices.map((c, i) => (
                              <div key={i} className="text-base-content/80">
                                <span className="font-semibold">{c.shortLabel}:</span> {c.value}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-base-content/60 text-xs">No votes yet</span>
                    )}
                  </td>
                  <td>
                    <div className="flex flex-col gap-1">
                      {p.forumLink && (
                        <Link
                          href={p.forumLink}
                          label="Forum"
                          color="text-orange-700 dark:text-orange-300"
                          bg="bg-orange-500/15"
                        />
                      )}
                      {p.snapshotLink && (
                        <Link
                          href={p.snapshotLink}
                          label="Snapshot"
                          color="text-purple-700 dark:text-purple-300"
                          bg="bg-purple-500/15"
                        />
                      )}
                      {p.tallyLink && (
                        <Link
                          href={p.tallyLink}
                          label="Tally"
                          color="text-cyan-700 dark:text-cyan-300"
                          bg="bg-cyan-500/15"
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const VoteProgressBar = ({ forRaw, againstRaw }: { forRaw?: number; againstRaw?: number }) => {
  const f = forRaw ?? 0;
  const a = againstRaw ?? 0;
  const total = f + a;
  if (total <= 0) return null;
  const forPct = (f / total) * 100;
  return (
    <div className="mt-2 flex h-[3px] w-full overflow-hidden rounded-full bg-base-300/60">
      <div className="bg-green-500" style={{ width: `${forPct}%` }} />
      <div className="bg-red-500" style={{ width: `${100 - forPct}%` }} />
    </div>
  );
};

const Link = ({ href, label, color, bg }: { href: string; label: string; color: string; bg: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`flex items-center gap-1.5 ${color} hover:underline`}
  >
    <div className={`w-4 h-4 rounded ${bg} flex items-center justify-center`}>
      <ArrowTopRightOnSquareIcon className="w-2.5 h-2.5" />
    </div>
    <span className="text-xs font-semibold">{label}</span>
  </a>
);
