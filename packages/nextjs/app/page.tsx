import type { NextPage } from "next";
import { ArbitrumGovernanceDashboard } from "~~/components/dashboard/ArbitrumGovernanceDashboard";
import { type DashboardProposal, getDashboardProposals } from "~~/services/database/repositories/proposals";

// The dashboard reads from a database mutated by daily import/matching crons.
// Cache the rendered page and refresh it once per day (ISR). This regenerates
// the page on its own schedule, so it no longer depends solely on the matching
// cron's revalidatePath("/") call firing successfully.
export const revalidate = 86400; // 24h

const Home: NextPage = async () => {
  // Intentionally NOT wrapped in try/catch: if the DB query fails during an ISR
  // regeneration, we want it to throw so Next.js keeps serving the last good
  // cached page and retries later — rather than caching an empty result and
  // showing "0 proposals" until the next refresh or a redeploy.
  const proposals: DashboardProposal[] = await getDashboardProposals();

  return <ArbitrumGovernanceDashboard proposals={proposals} />;
};

export default Home;
