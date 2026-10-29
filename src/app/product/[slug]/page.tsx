import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { AffiliateButton } from "@/components/AffiliateButton";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import { ConflictList, IngredientBreakdown, SectionHeading, SkinFitGrid, UnmatchedList } from "@/components/analysis";
import { Disclaimer } from "@/components/Disclaimer";
import { ProductCard } from "@/components/ProductCard";
import { analyze, findAlternatives } from "@/lib/analyze";
import { getConflictRules, getIngredients, getProduct, getProducts } from "@/lib/data";
import { buildIndex, matchIngredient } from "@/lib/parse";
import { formatInr } from "@/lib/site";

// No Product JSON-LD yet: Google wants real offers/reviews for it, and the
// sample catalog is placeholder data. Add it once products are real.

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return { title: "Product not found" };
  const title = `${p.brand} ${p.name}: Ingredients & Review`;
  const description = `Ingredient breakdown of ${p.brand} ${p.name} (${formatInr(p.priceInr)}): what each ingredient does, clashes, skin-type fit and cheaper alternatives.`;
  return {
    title,
    description,
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: { title, description, url: `/product/${p.slug}` },
    // Keep placeholder products out of search results.
    robots: p.placeholder ? { index: false, follow: true } : undefined,
  };
}

// Prerendered for every product; params is awaited outside Suspense so
// unknown slugs return a real 404.
export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const [product, ingredients, rules, products] = await Promise.all([
    getProduct(slug),
    getIngredients(),
    getConflictRules(),
    getProducts(),
  ]);
  if (!product) notFound();

  const index = buildIndex(ingredients);
  const parsed = product.ingredients.map((raw) => ({ raw, slug: matchIngredient(raw, index) }));
  const analysis = analyze(parsed, ingredients, rules);
  const alternatives = findAlternatives(product.keyIngredients, products, ingredients, {
    maxPrice: product.priceInr,
    excludeSlug: product.slug,
    category: product.category,
  });
  const keyNames = product.keyIngredients
    .map((s) => ingredients.find((i) => i.slug === s))
    .filter((i) => i !== undefined);

  return (
    <article className="space-y-10">
      <header className="space-y-4">
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <Link href="/product" className="hover:text-ink hover:underline">
            Products
          </Link>{" "}
          / <span className="text-ink">{product.name}</span>
        </nav>
        <div className="rounded-3xl border border-line bg-shell p-5 sm:p-6">
          <p className="text-sm font-medium tracking-wide text-muted uppercase">{product.brand}</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">{product.name}</h1>
          <p className="mt-3 text-2xl font-bold text-ink">{formatInr(product.priceInr)}</p>
          {keyNames.length > 0 && (
            <p className="mt-3 text-sm text-muted">
              Key ingredients:{" "}
              {keyNames.map((k, i) => (
                <span key={k.slug}>
                  {i > 0 && ", "}
                  <Link href={`/ingredient/${k.slug}`} className="font-semibold text-ink underline underline-offset-2">
                    {k.name}
                  </Link>
                </span>
              ))}
            </p>
          )}
          {product.placeholder && (
            <p className="mt-3 rounded-xl bg-care-bg px-3 py-2 text-xs text-care">
              Sample product with placeholder data. Not a real listing.
            </p>
          )}
          <div className="mt-4 space-y-2">
            <AffiliateButton href={product.affiliateUrl} productName={product.name} label="Check latest price" />
            <AffiliateDisclosure />
          </div>
        </div>
        <Disclaimer />
      </header>

      <section aria-labelledby="conflicts">
        <SectionHeading id="conflicts" sub="Ingredient pairs in this product that can work against each other.">
          Clash check
        </SectionHeading>
        <ConflictList conflicts={analysis.conflicts} />
      </section>

      <section aria-labelledby="skin-fit">
        <SectionHeading id="skin-fit">Skin-type fit</SectionHeading>
        <SkinFitGrid fit={analysis.skinFit} />
      </section>

      <AdSlot slot="product-mid" />

      {alternatives.length > 0 && (
        <section aria-labelledby="alternatives" className="space-y-3">
          <SectionHeading
            id="alternatives"
            sub={`Under ${formatInr(product.priceInr)} with similar key ingredients. Closest match first.`}
          >
            Cheaper alternatives
          </SectionHeading>
          <AffiliateDisclosure />
          <div className="grid gap-3">
            {alternatives.map((a) => (
              <ProductCard key={a.product.slug} product={a.product} shared={a.shared} compareWith={product.slug} />
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="breakdown" className="space-y-4">
        <SectionHeading id="breakdown" sub="In label order. Ingredients near the top are present in larger amounts.">
          Full ingredient breakdown
        </SectionHeading>
        <IngredientBreakdown items={analysis.items} />
        <UnmatchedList unmatched={analysis.unmatched} />
      </section>

      <Disclaimer />
    </article>
  );
}
