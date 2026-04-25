import { DashboardTopBar } from "@/components/dashboard/dashboard-top-bar";
import { redirect } from "next/navigation";
import { getAuthenticatedUserOrNull, isUserAdmin } from "@/lib/server/dashboard-auth";

export const runtime = "edge";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuthenticatedUserOrNull();
  if ("response" in auth || !auth.user) {
    redirect("/login?next=/dashboard");
  }
  const admin = await isUserAdmin(auth.user);
  if (!admin) {
    redirect("/minha-conta");
  }

  return (
    <div className="min-h-screen bg-[#05070f] text-zinc-100">
      <div className="border-b border-white/10 bg-black/30 backdrop-blur">
        <DashboardTopBar />
      </div>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
