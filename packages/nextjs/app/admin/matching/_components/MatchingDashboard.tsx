"use client";

import { useCallback, useState } from "react";
import {
  useExecuteMatch,
  useInvalidateMatchingLists,
  useMatchingPending,
  useMatchingResults,
} from "../_hooks/useMatchingQueries";
import { JobPoller } from "./JobPoller";
import { MatchingResultsTable } from "./MatchingResultsTable";
import { PendingStagesTable } from "./PendingStagesTable";
import { SourceType } from "./types";

const PENDING_PLACEHOLDER = "pending";

export function MatchingDashboard() {
  const pendingQuery = useMatchingPending();
  const resultsQuery = useMatchingResults();
  const executeMutation = useExecuteMatch();
  const invalidateLists = useInvalidateMatchingLists();

  const [runningJobs, setRunningJobs] = useState<Map<string, string>>(new Map());
  const [error, setError] = useState<string | null>(null);

  const removeRunningJob = useCallback((stageId: string) => {
    setRunningJobs(prev => {
      const next = new Map(prev);
      next.delete(stageId);
      return next;
    });
  }, []);

  const handleJobComplete = useCallback(
    (stageId: string) => {
      removeRunningJob(stageId);
      invalidateLists();
    },
    [removeRunningJob, invalidateLists],
  );

  const handleJobError = useCallback(
    (stageId: string, message: string) => {
      removeRunningJob(stageId);
      setError(message);
    },
    [removeRunningJob],
  );

  const executeMatch = useCallback(
    (sourceType: SourceType, stageId: string) => {
      setRunningJobs(prev => new Map(prev).set(stageId, PENDING_PLACEHOLDER));

      executeMutation.mutate(
        { sourceType, stageId },
        {
          onSuccess: ({ jobId }) => {
            setRunningJobs(prev => new Map(prev).set(stageId, jobId));
          },
          onError: err => {
            removeRunningJob(stageId);
            setError(err instanceof Error ? err.message : "Failed to start matching");
          },
        },
      );
    },
    [executeMutation, removeRunningJob],
  );

  if (pendingQuery.isLoading || resultsQuery.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  const fetchError = pendingQuery.error?.message ?? resultsQuery.error?.message ?? null;
  const displayError = error ?? fetchError;

  return (
    <div className="flex flex-col gap-4">
      {Array.from(runningJobs.entries()).map(([stageId, jobId]) =>
        jobId !== PENDING_PLACEHOLDER ? (
          <JobPoller
            key={jobId}
            jobId={jobId}
            stageId={stageId}
            onComplete={handleJobComplete}
            onError={handleJobError}
          />
        ) : null,
      )}

      {displayError && (
        <div className="alert alert-error">
          <span>{displayError}</span>
          <button className="btn btn-ghost btn-xs" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}

      <section>
        <h2 className="text-2xl font-semibold mb-2">Pending Stages</h2>
        <PendingStagesTable stages={pendingQuery.data ?? []} runningJobs={runningJobs} onMatch={executeMatch} />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">Matching Results</h2>
        <MatchingResultsTable results={resultsQuery.data ?? []} runningJobs={runningJobs} onRematch={executeMatch} />
      </section>
    </div>
  );
}
