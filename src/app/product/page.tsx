import type { Metadata } from "next";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import { ProductCard } from "@/components/ProductCard";
import { getProducts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Skincare Products, Checked",
  description: "Ingredient breakdowns of popular skincare products in India, with budget alternatives.",
  alternates: { canonical: "/product" },
};

export default async function ProductIndexPage() {
  const products = await getProducts();
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">Products</h1>
        <p className="text-muted">Every product here has a full ingredient breakdown. Cheapest first.</p>
      </header>
      <AffiliateDisclosure />
      <div className="grid gap-3 sm:grid-cols-2">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}
