// app/dashboard/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth";
import { LogoutButton } from "../components/logout-button";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as {
    email?: string | null;
    name?: string | null;
    isActive?: boolean;
  };

  const isActive = Boolean(user?.isActive);

  return (
    <main className="min-h-screen bg-[#070B18] text-white">
      <div className="mx-auto max-w-[1700px] px-6 py-12 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
              <p className="mt-2 text-sm text-white/70">
                Review matched opportunities and keep your profile up to date.
              </p>
            </div>

            <LogoutButton />
          </div>

          <div className="mt-8 grid gap-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="text-sm text-white/60">Signed in as</div>
              <div className="mt-1 text-lg font-semibold">{user?.email || "—"}</div>

              <div className="mt-3 text-sm text-white/70">
                Status: <span className="text-white">{isActive ? "Active" : "Inactive"}</span>
              </div>

              {!isActive && (
                <div className="mt-4 rounded-xl border border-white/10 bg-[#070B18]/40 px-4 py-3 text-sm text-white/75">
                  Your subscription is not active yet. You can still preview the experience, but
                  full access will unlock after payment.
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/winning-opportunities"
                  className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
                >
                  View Winning Opportunities
                </Link>

                <Link
                  href="/profile"
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Edit Profile
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="text-lg font-semibold">How customers use Ambit</div>
              <ol className="mt-4 space-y-3 text-sm text-white/75">
                <li>
                  <span className="font-semibold text-white">1) Review top matches</span> — Ambit
                  ranks opportunities by fit so you don’t waste time.
                </li>
                <li>
                  <span className="font-semibold text-white">2) Save what matters</span> — keep a
                  short list of opportunities worth bidding.
                </li>
                <li>
                  <span className="font-semibold text-white">3) Move to bid</span> — share links and
                  details with your team and execute.
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
