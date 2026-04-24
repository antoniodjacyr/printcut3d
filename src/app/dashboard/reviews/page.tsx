import { ReviewsModeration } from "@/components/dashboard/reviews-moderation";
import { getMockReviews } from "@/lib/dashboard/mock-metrics";

export default function DashboardReviewsPage() {
  const reviews = getMockReviews();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Prova social</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Moderação de reviews e curadoria de fotos de clientes para reforçar confiança no mercado EUA.
        </p>
      </div>
      <ReviewsModeration initial={reviews} />
    </div>
  );
}
