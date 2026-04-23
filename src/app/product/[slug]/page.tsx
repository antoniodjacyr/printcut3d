import { notFound } from "next/navigation";
import { getAllMockProductSlugs, getMockProductBySlug } from "@/lib/mock-catalog";
import { ProductView } from "./product-view";

export function generateStaticParams() {
  return getAllMockProductSlugs().map((slug) => ({ slug }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getMockProductBySlug(slug);
  if (!product) {
    notFound();
  }
  return <ProductView product={product} />;
}
