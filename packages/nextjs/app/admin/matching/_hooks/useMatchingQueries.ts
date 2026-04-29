import type { MatchingResultRow, PendingStage, SourceType } from "../_components/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface MatchJobStatus {
  id: string;
  status: "running" | "completed" | "error";
  result?: { status: string; proposalId: string | null };
  error?: string;
  createdAt: number;
  completedAt?: number;
}

export const matchingKeys = {
  all: ["admin", "matching"] as const,
  pending: () => [...matchingKeys.all, "pending"] as const,
  results: () => [...matchingKeys.all, "results"] as const,
  jobStatus: (jobId: string) => [...matchingKeys.all, "status", jobId] as const,
};

const STALE_TIME = 30_000;
const POLL_INTERVAL_MS = 2000;

export function useMatchingPending() {
  return useQuery({
    queryKey: matchingKeys.pending(),
    queryFn: async (): Promise<PendingStage[]> => {
      const res = await fetch("/api/admin/matching/pending");
      if (!res.ok) throw new Error("Failed to fetch pending stages");
      return res.json();
    },
    staleTime: STALE_TIME,
  });
}

export function useMatchingResults() {
  return useQuery({
    queryKey: matchingKeys.results(),
    queryFn: async (): Promise<MatchingResultRow[]> => {
      const res = await fetch("/api/admin/matching/results");
      if (!res.ok) throw new Error("Failed to fetch matching results");
      return res.json();
    },
    staleTime: STALE_TIME,
  });
}

export function useExecuteMatch() {
  return useMutation({
    mutationFn: async ({
      sourceType,
      stageId,
    }: {
      sourceType: SourceType;
      stageId: string;
    }): Promise<{ jobId: string }> => {
      const res = await fetch("/api/admin/matching/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceType, stageId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to start matching");
      }
      return res.json();
    },
  });
}

export function useJobStatus(jobId: string | null) {
  return useQuery({
    queryKey: jobId ? matchingKeys.jobStatus(jobId) : [...matchingKeys.all, "status", "noop"],
    queryFn: async (): Promise<MatchJobStatus> => {
      const res = await fetch(`/api/admin/matching/status/${jobId}`);
      if (!res.ok) throw new Error("Status check failed");
      return res.json();
    },
    enabled: !!jobId,
    refetchInterval: query => {
      const data = query.state.data;
      if (data?.status === "completed" || data?.status === "error") return false;
      return POLL_INTERVAL_MS;
    },
    retry: 3,
    retryDelay: POLL_INTERVAL_MS,
  });
}

export function useInvalidateMatchingLists() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: matchingKeys.pending() });
    queryClient.invalidateQueries({ queryKey: matchingKeys.results() });
  };
}
