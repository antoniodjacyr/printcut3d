export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-white/10" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="tech-card h-24 animate-pulse rounded-2xl bg-white/5" />
        ))}
      </div>
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="tech-card h-64 animate-pulse rounded-2xl bg-white/5 sm:h-72" />
          <div className="tech-card h-64 animate-pulse rounded-2xl bg-white/5 sm:h-72" />
        </div>
        <div className="tech-card h-64 animate-pulse rounded-2xl bg-white/5 sm:h-72" />
      </div>
    </div>
  );
}
