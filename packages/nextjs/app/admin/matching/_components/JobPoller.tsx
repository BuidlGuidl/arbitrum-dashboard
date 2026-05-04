"use client";

import { useEffect } from "react";
import { useJobStatus } from "../_hooks/useMatchingQueries";

interface Props {
  jobId: string;
  stageId: string;
  onComplete: (stageId: string) => void;
  onError: (stageId: string, message: string) => void;
}

export function JobPoller({ jobId, stageId, onComplete, onError }: Props) {
  const { data, isError } = useJobStatus(jobId);

  useEffect(() => {
    if (data?.status === "completed") {
      onComplete(stageId);
    } else if (data?.status === "error") {
      onError(stageId, data.error ?? "Matching failed");
    }
  }, [data, stageId, onComplete, onError]);

  useEffect(() => {
    if (isError) {
      onError(stageId, "Lost track of matching job. Please refresh the page.");
    }
  }, [isError, stageId, onError]);

  return null;
}
