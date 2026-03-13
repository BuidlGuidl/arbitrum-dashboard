"use client";

import { useState } from "react";
import {
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface Citation {
  proposal_id: string;
  stage: string;
  url: string;
  snippet: string;
  title?: string;
}

interface QueryResponse {
  success: boolean;
  answer?: string;
  citations?: Citation[];
  error?: string;
}

const STAGE_STYLES: Record<string, { active: string; inactive: string; badge: string; label: string }> = {
  forum: {
    active: "bg-orange-100 text-orange-700 border-orange-300 shadow-sm",
    inactive: "bg-base-100 text-base-content/50 border-base-300 hover:border-orange-200 hover:text-orange-600",
    badge: "bg-orange-100 text-orange-700 border-orange-200",
    label: "Forum",
  },
  snapshot: {
    active: "bg-purple-100 text-purple-700 border-purple-300 shadow-sm",
    inactive: "bg-base-100 text-base-content/50 border-base-300 hover:border-purple-200 hover:text-purple-600",
    badge: "bg-purple-100 text-purple-700 border-purple-200",
    label: "Snapshot",
  },
  tally: {
    active: "bg-cyan-100 text-cyan-700 border-cyan-300 shadow-sm",
    inactive: "bg-base-100 text-base-content/50 border-base-300 hover:border-cyan-200 hover:text-cyan-600",
    badge: "bg-cyan-100 text-cyan-700 border-cyan-200",
    label: "Tally",
  },
};

const SUGGESTED_QUERIES = [
  "What proposals are related to treasury management?",
  "Show me recently executed constitutional proposals",
  "Which proposals discuss incentive programs?",
  "What are the most debated governance changes?",
];

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-5 animate-pulse">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary/40" />
          <div className="h-4 w-32 bg-base-300 rounded" />
        </div>
        <div className="space-y-2.5 pl-4">
          <div className="h-3.5 bg-base-300 rounded w-full" />
          <div className="h-3.5 bg-base-300 rounded w-[95%]" />
          <div className="h-3.5 bg-base-300 rounded w-[88%]" />
          <div className="h-3.5 bg-base-300 rounded w-[72%]" />
        </div>
      </div>
      <div className="border-t border-base-300" />
      <div className="flex flex-col gap-3">
        <div className="h-4 w-20 bg-base-300 rounded" />
        {[1, 2].map(i => (
          <div key={i} className="border border-base-300 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-5 w-16 bg-base-300 rounded-full" />
              <div className="h-4 w-48 bg-base-300 rounded" />
            </div>
            <div className="h-3 bg-base-300 rounded w-[90%]" />
            <div className="h-3 bg-base-300 rounded w-[60%]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RagAdminPage() {
  const [query, setQuery] = useState("");
  const [queryResponse, setQueryResponse] = useState<QueryResponse | null>(null);
  const [queryLoading, setQueryLoading] = useState(false);

  const [stageFilters, setStageFilters] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("");

  const handleQuery = async () => {
    if (!query.trim()) return;

    setQueryLoading(true);
    setQueryResponse(null);

    try {
      const filters: { stage?: string[]; status?: string[] } = {};
      if (stageFilters.length > 0) {
        filters.stage = stageFilters;
      }
      if (statusFilter) {
        filters.status = [statusFilter];
      }

      const res = await fetch("/api/rag/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          filters: Object.keys(filters).length > 0 ? filters : undefined,
        }),
      });

      const data = await res.json();
      setQueryResponse(data);
    } catch (error) {
      setQueryResponse({
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      });
    } finally {
      setQueryLoading(false);
    }
  };

  const toggleStageFilter = (stage: string) => {
    setStageFilters(prev => (prev.includes(stage) ? prev.filter(s => s !== stage) : [...prev, stage]));
  };

  const hasResults = queryResponse?.success && queryResponse.answer;
  const hasError = queryResponse && !queryResponse.success;
  const isEmpty = !queryResponse && !queryLoading;

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col">
      {/* Header bar */}
      <div className="border-b border-base-300 bg-base-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <SparklesIcon className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">Proposal RAG</h1>
              <p className="text-xs text-base-content/60 leading-tight">
                Natural language search across governance proposals
              </p>
            </div>
          </div>
          <a href="/admin" className="btn btn-ghost btn-sm gap-1.5 text-base-content/70">
            <ArrowLeftIcon className="w-4 h-4" />
            Admin
          </a>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-6 lg:h-[calc(100vh-12rem)]">
          {/* Left panel — Query input */}
          <div className="flex flex-col gap-4">
            {/* Search input card */}
            <div className="bg-base-100 rounded-xl border border-base-300 p-4 flex flex-col gap-3.5">
              <div className="relative">
                <textarea
                  className="textarea w-full min-h-28 text-sm leading-relaxed bg-base-200/50 border-base-300 focus:border-primary/40 focus:bg-base-100 transition-colors resize-none rounded-lg"
                  placeholder="Ask anything about Arbitrum governance proposals..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleQuery();
                    }
                  }}
                />
                <div className="absolute bottom-2.5 right-2.5">
                  <kbd className="kbd kbd-xs text-base-content/40">Enter</kbd>
                </div>
              </div>

              {/* Filters row */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-base-content/50 uppercase tracking-wider">Stage</span>
                  <div className="flex-1 h-px bg-base-300/60" />
                </div>
                <div className="flex gap-1.5">
                  {(["forum", "snapshot", "tally"] as const).map(stage => {
                    const styles = STAGE_STYLES[stage];
                    const isActive = stageFilters.includes(stage);
                    return (
                      <button
                        key={stage}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${isActive ? styles.active : styles.inactive}`}
                        onClick={() => toggleStageFilter(stage)}
                      >
                        {styles.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-base-content/50 uppercase tracking-wider">Status</span>
                  <div className="flex-1 h-px bg-base-300/60" />
                </div>
                <select
                  className="select select-sm select-bordered w-full text-sm bg-base-200/50 border-base-300"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option value="">All statuses</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                  <option value="pending">Pending</option>
                  <option value="executed">Executed</option>
                  <option value="defeated">Defeated</option>
                </select>
              </div>

              <button
                className={`btn btn-primary btn-sm w-full gap-2 mt-1 ${queryLoading ? "opacity-80" : ""}`}
                onClick={handleQuery}
                disabled={queryLoading || !query.trim()}
              >
                {queryLoading ? (
                  <>
                    <span className="loading loading-spinner loading-xs" />
                    Searching...
                  </>
                ) : (
                  <>
                    <MagnifyingGlassIcon className="w-4 h-4" />
                    Search Proposals
                  </>
                )}
              </button>
            </div>

            {/* Active filters summary */}
            {(stageFilters.length > 0 || statusFilter) && (
              <div className="flex flex-wrap items-center gap-1.5 px-1">
                <span className="text-[11px] text-base-content/50">Filtering:</span>
                {stageFilters.map(stage => {
                  const styles = STAGE_STYLES[stage];
                  return (
                    <span
                      key={stage}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full border ${styles.badge}`}
                    >
                      {styles.label}
                      <button className="hover:opacity-70 cursor-pointer" onClick={() => toggleStageFilter(stage)}>
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
                {statusFilter && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full border border-base-300 bg-base-100 text-base-content/80">
                    {statusFilter}
                    <button className="hover:opacity-70 cursor-pointer" onClick={() => setStatusFilter("")}>
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right panel — Results */}
          <div className="bg-base-100 rounded-xl border border-base-300 flex flex-col min-h-[400px] lg:min-h-0 overflow-hidden">
            {/* Results header */}
            <div className="px-4 py-3 border-b border-base-300 flex items-center justify-between shrink-0">
              <span className="text-xs font-medium text-base-content/60 uppercase tracking-wider">Results</span>
              {hasResults && queryResponse.citations && (
                <span className="text-xs text-base-content/50">
                  {queryResponse.citations.length} source{queryResponse.citations.length !== 1 ? "s" : ""} cited
                </span>
              )}
            </div>

            {/* Results body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              {/* Empty state */}
              {isEmpty && (
                <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8">
                  <div className="w-12 h-12 rounded-2xl bg-base-200 flex items-center justify-center mb-4">
                    <ChatBubbleLeftRightIcon className="w-6 h-6 text-base-content/30" />
                  </div>
                  <p className="text-sm font-medium text-base-content/60 mb-1">Ask a question to get started</p>
                  <p className="text-xs text-base-content/45 mb-6 max-w-xs">
                    Query proposals using natural language. Results include AI-generated answers with source citations.
                  </p>
                  <div className="w-full max-w-sm space-y-1.5">
                    <p className="text-[11px] text-base-content/40 uppercase tracking-wider font-medium mb-2">
                      Try asking
                    </p>
                    {SUGGESTED_QUERIES.map((suggestion, idx) => (
                      <button
                        key={idx}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs text-base-content/65 bg-base-200/50 hover:bg-base-200 hover:text-base-content/85 transition-colors border border-transparent hover:border-base-300 cursor-pointer"
                        onClick={() => setQuery(suggestion)}
                      >
                        &ldquo;{suggestion}&rdquo;
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading state */}
              {queryLoading && <LoadingSkeleton />}

              {/* Error state */}
              {hasError && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-error/5 border border-error/15">
                  <ExclamationTriangleIcon className="w-5 h-5 text-error shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-error mb-0.5">Query failed</p>
                    <p className="text-xs text-error/80 break-words">{queryResponse?.error}</p>
                  </div>
                </div>
              )}

              {/* Success state */}
              {hasResults && (
                <div className="flex flex-col gap-5">
                  {/* Answer */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      <span className="text-xs font-semibold text-base-content/70 uppercase tracking-wider">
                        Answer
                      </span>
                    </div>
                    <div className="pl-4 border-l-2 border-base-300">
                      <p className="text-sm leading-relaxed text-base-content/90 whitespace-pre-wrap break-words overflow-hidden">
                        {queryResponse.answer}
                      </p>
                    </div>
                  </div>

                  {/* Citations */}
                  {queryResponse.citations && queryResponse.citations.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-3">
                        <span className="text-xs font-semibold text-base-content/70 uppercase tracking-wider">
                          Sources
                        </span>
                        <div className="flex-1 h-px bg-base-300/60" />
                      </div>
                      <div className="flex flex-col gap-2">
                        {queryResponse.citations.map((citation, idx) => {
                          const stageStyle = STAGE_STYLES[citation.stage] || {
                            badge: "bg-base-200 text-base-content/70 border-base-300",
                            label: citation.stage,
                          };
                          return (
                            <div
                              key={idx}
                              className="group border border-base-300 rounded-lg p-3.5 hover:border-base-content/15 transition-colors overflow-hidden"
                            >
                              <div className="flex items-start gap-2.5 mb-2 min-w-0">
                                <span
                                  className={`shrink-0 inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full border ${stageStyle.badge}`}
                                >
                                  {stageStyle.label}
                                </span>
                                {citation.title && (
                                  <span className="text-sm font-medium text-base-content/85 truncate min-w-0">
                                    {citation.title}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-base-content/60 leading-relaxed mb-2.5 line-clamp-3 break-words overflow-hidden">
                                {citation.snippet}
                              </p>
                              {citation.url && (
                                <a
                                  href={citation.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-content underline underline-offset-2 decoration-accent-content/30 hover:decoration-accent-content/60 transition-colors"
                                >
                                  <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                                  View source
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
