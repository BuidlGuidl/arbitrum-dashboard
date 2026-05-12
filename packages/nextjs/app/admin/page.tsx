import Link from "next/link";
import { getServerSession } from "next-auth";
import { ArrowRightIcon, PlusIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { authOptions } from "~~/utils/auth";

const ADMIN_TOOLS = [
  {
    href: "/admin/rag",
    label: "Proposal RAG Search",
    description: "Query governance proposals using natural language with AI-powered answers and source citations.",
    icon: <SparklesIcon className="w-5 h-5" />,
    color: "text-purple-600 bg-purple-100 border-purple-200",
  },
];

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col">
      {/* Header */}
      <div className="border-b border-base-300 bg-base-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold leading-tight">Admin Panel</h1>
              <p className="text-xs text-base-content/55 mt-0.5">Arbitrum Governance Dashboard</p>
            </div>
            <div className="flex items-center gap-3">
              {session?.user?.userAddress && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-base-200 border border-base-300">
                  <Address address={session.user.userAddress} />
                </div>
              )}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20">
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                <span className="text-[11px] font-semibold text-success uppercase tracking-wider">Admin</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Tools section */}
        <div className="mb-8">
          <div className="flex items-center gap-1.5 mb-4">
            <span className="text-[11px] font-semibold text-base-content/50 uppercase tracking-wider">Tools</span>
            <div className="flex-1 h-px bg-base-300/60" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ADMIN_TOOLS.map(tool => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group flex flex-col gap-3 p-4 rounded-xl bg-base-100 border border-base-300 hover:border-base-content/15 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${tool.color}`}>
                    {tool.icon}
                  </div>
                  <span className="text-sm font-semibold text-base-content/90 group-hover:text-base-content transition-colors">
                    {tool.label}
                  </span>
                </div>
                <p className="text-xs text-base-content/60 leading-relaxed">{tool.description}</p>
                <div className="flex items-center gap-1 text-xs font-medium text-base-content/40 group-hover:text-primary transition-colors mt-auto">
                  <span>Open</span>
                  <ArrowRightIcon className="w-3 h-3" />
                </div>
              </Link>
            ))}

            {/* Placeholder for future tools */}
            <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-base-300 min-h-[140px]">
              <div className="w-9 h-9 rounded-lg bg-base-200 flex items-center justify-center">
                <PlusIcon className="w-5 h-5 text-base-content/25" />
              </div>
              <span className="text-xs text-base-content/35">More tools coming soon</span>
            </div>
          </div>
        </div>

        {/* Quick info */}
        <div className="flex items-center gap-1.5 mb-4">
          <span className="text-[11px] font-semibold text-base-content/50 uppercase tracking-wider">Session</span>
          <div className="flex-1 h-px bg-base-300/60" />
        </div>
        <div className="bg-base-100 rounded-xl border border-base-300 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-[11px] font-medium text-base-content/50 uppercase tracking-wider block mb-1">
                Wallet
              </span>
              <div className="text-base-content/80">
                {session?.user?.userAddress ? (
                  <Address address={session.user.userAddress} />
                ) : (
                  <span className="text-base-content/40">Not connected</span>
                )}
              </div>
            </div>
            <div>
              <span className="text-[11px] font-medium text-base-content/50 uppercase tracking-wider block mb-1">
                Role
              </span>
              <span className="text-base-content/80">Administrator</span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-base-content/50 uppercase tracking-wider block mb-1">
                Auth Method
              </span>
              <span className="text-base-content/80">Sign-In with Ethereum</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
