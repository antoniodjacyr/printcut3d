"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { dictionary } from "@/lib/i18n";

const navItems = [
  { href: "/dashboard", labelKey: "dashNavOverview" },
  { href: "/dashboard/catalog", labelKey: "dashNavCatalog" },
  { href: "/dashboard/orders", labelKey: "dashNavOrders" },
  { href: "/dashboard/pipeline", labelKey: "dashNavPipeline" },
  { href: "/dashboard/shipping", labelKey: "dashNavShipping" },
  { href: "/dashboard/finance", labelKey: "dashNavFinance" },
  { href: "/dashboard/reviews", labelKey: "dashNavReviews" },
  { href: "/dashboard/marketing", labelKey: "dashNavMarketing" },
  { href: "/dashboard/content", labelKey: "dashNavContent" }
] as const;

export function DashboardTopBar() {
  const { locale } = useLocale();
  const t = useMemo(() => dictionary[locale], [locale]);
  const pathname = usePathname() || "/dashboard";

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neon/80">{t.dashBrandLabel}</p>
          <h1 className="text-2xl font-semibold text-white">{t.dashHeading}</h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-400">{t.dashTagline}</p>
        </div>
        <Link
          href="/"
          className="rounded-lg border border-white/15 px-3 py-2 text-sm text-zinc-200 transition hover:border-neon/40 hover:text-white"
        >
          {t.dashBackSite}
        </Link>
      </div>

      <nav className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {navItems.map(({ href, labelKey }) => {
          const active =
            href === "/dashboard" ? pathname === "/dashboard" : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                active ? "bg-neon/20 text-neon ring-1 ring-neon/40" : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
              }`}
            >
              {t[labelKey]}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
