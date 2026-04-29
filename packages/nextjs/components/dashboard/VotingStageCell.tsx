"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import type { VotingStageItem } from "~~/services/database/repositories/proposals";

type ColorScheme = {
  border: string;
  bg: string;
  text: string;
};

export const VotingStageCell = ({
  status,
  lastUpdate,
  link,
  history,
  colorScheme,
}: {
  status: string | null;
  lastUpdate: string | null;
  link: string | null;
  history: VotingStageItem[];
  colorScheme: ColorScheme;
}) => {
  const [expanded, setExpanded] = useState(false);
  const hasHistory = history.length > 0;

  if (!status) {
    return <span className="text-xs text-base-content/60">Not started</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      {/* Latest stage */}
      <div className="flex flex-wrap items-center gap-1.5 min-w-0">
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer">
            <div
              className={`badge badge-sm whitespace-nowrap border cursor-pointer hover:brightness-95 ${colorScheme.border} ${colorScheme.bg} ${colorScheme.text}`}
            >
              {status}
            </div>
          </a>
        ) : (
          <div
            className={`badge badge-sm whitespace-nowrap border ${colorScheme.border} ${colorScheme.bg} ${colorScheme.text}`}
          >
            {status}
          </div>
        )}
        {hasHistory && (
          <button
            onClick={() => setExpanded(!expanded)}
            title={`${history.length} previous ${history.length === 1 ? "attempt" : "attempts"} — click to ${expanded ? "collapse" : "expand"}`}
            className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold leading-none transition-[filter,background-color] hover:brightness-110 cursor-pointer ${colorScheme.border} ${colorScheme.bg} ${colorScheme.text}`}
          >
            <span>+{history.length}</span>
            <ChevronDownIcon
              className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>
      {lastUpdate && <span className="text-xs text-base-content/60">{lastUpdate}</span>}

      {/* Expandable history */}
      {hasHistory && (
        <div
          className="grid transition-[grid-template-rows] duration-200 ease-out"
          style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-1.5 pt-1.5 border-t border-base-200 mt-1">
              {history.map(item => (
                <HistoryItem key={item.id} item={item} colorScheme={colorScheme} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HistoryItem = ({ item, colorScheme }: { item: VotingStageItem; colorScheme: ColorScheme }) => {
  return (
    <div className="flex flex-col gap-0.5 opacity-80">
      {item.displayStatus &&
        (item.link ? (
          <a href={item.link} target="_blank" rel="noopener noreferrer">
            <div
              className={`badge badge-xs whitespace-nowrap border cursor-pointer hover:brightness-95 ${colorScheme.border} ${colorScheme.bg} ${colorScheme.text}`}
            >
              {item.displayStatus}
            </div>
          </a>
        ) : (
          <div
            className={`badge badge-xs whitespace-nowrap border ${colorScheme.border} ${colorScheme.bg} ${colorScheme.text}`}
          >
            {item.displayStatus}
          </div>
        ))}
      {item.lastUpdate && <span className="text-[10px] text-base-content/70">{item.lastUpdate}</span>}
      {item.votes && (
        <div className="text-[10px] leading-tight">
          <span className="text-green-600">F:{item.votes.for}</span>{" "}
          <span className="text-red-600">A:{item.votes.against}</span>
        </div>
      )}
    </div>
  );
};
