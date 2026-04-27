import { type StatCardConfig } from "~~/utils/governanceStats";

interface StatsCardProps {
  config: StatCardConfig;
  value: number;
  isLoading?: boolean;
}

const ICON_BG: Record<string, string> = {
  "text-orange-500": "bg-orange-500/15",
  "text-purple-500": "bg-purple-500/15",
  "text-cyan-500": "bg-cyan-500/15",
  "text-green-500": "bg-green-500/15",
};

export const StatsCard = ({ config, value, isLoading = false }: StatsCardProps) => {
  const { title, sub, color, Icon } = config;
  const iconBg = ICON_BG[color] ?? "bg-base-300";

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm rounded-xl">
      <div className="card-body p-5">
        <div className="flex items-start gap-4">
          <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xs font-semibold tracking-wider uppercase text-base-content/70">{title}</h2>
            <div className={`text-4xl font-bold mt-1 ${color}`}>
              {isLoading ? <span className="loading loading-spinner loading-sm"></span> : value}
            </div>
          </div>
        </div>
        <p className="text-xs text-base-content/60 mt-2">{sub}</p>
      </div>
    </div>
  );
};
