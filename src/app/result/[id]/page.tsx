import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdSlot } from "@/components/AdSlot";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import {
  ConflictList,
  IngredientBreakdown,
  SectionHeading,
  SkinFitGrid,
  UnmatchedList,
} from "@/components/analysis";
import { Disclaimer } from "@/components/Disclaimer";
import { ProductCard } from "@/components/ProductCard";
import { ShareButton } from "@/components/ShareButton";
import { analyze, findAlternatives, identifyProduct, keyIngredientsOf } from "@/lib/analyze";
import { getAnalysis, getConflictRules, getIngredients, getProducts } from "@/lib/data";
import { buildIndex, matchIngredient } from "@/lib/parse";
import { formatInr } from "@/lib/site";
import type { ParsedIngredient } from "@/lib/types";

// Results are user-pasted text: shareable, but not for search engines.
export const metadata: Metadata = {
  title: "Your ingredient check",
  robots: { index: false, follow: true },
};

export default function ResultPage({ params }: PageProps<"/result/[id]">) {
  return (
    <div className="space-y-10">
      <Suspense fallback={<ResultSkeleton />}>
        <Result params={params} />
      </Suspense>
    </div>
  );
}

async function Result({ params }: Pick<PageProps<"/result/[id]">, "params">) {
  const { id } = await params;
  const record = await getAnalysis(id);
  if (!record) notFound();

  const [ingredients, rules, products] = await Promise.all([getIngredients(), getConflictRules(), getProducts()]);
  const parsed = record.parsed as ParsedIngredient[];
  const analysis = analyze(parsed, ingredients, rules);
  const index = buildIndex(ingredients);
  const known = identifyProduct(
    parsed.map((p) => p.slug),
    products,
    (raw) => matchIngredient(raw, index),
  );
  const keys = known?.keyIngredients ?? keyIngredientsOf(analysis.items.map((i) => i.ingredient.slug), products);
  const alternatives = findAlternatives(keys, products, ingredients, {
    excludeSlug: known?.slug,
    maxPrice: known?.priceInr,
  });

  const counts = {
    identified: analysis.items.length,
    conflicts: analysis.conflicts.length,
    flagged: analysis.items.filter((i) => i.ingredient.rating !== "good").length,
  };

  return (
    <>
      <header className="space-y-4">
        <Link href="/" className="text-sm font-semibold text-berry hover:underline">
          ← Check another product
        </Link>
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">Your ingredient check</h1>
        {known && (
          <p className="text-sm text-muted">
            This looks like{" "}
            <Link href={`/product/${known.slug}`} className="font-semibold text-ink underline underline-offset-2">
              {known.brand} {known.name}
            </Link>{" "}
            ({formatInr(known.priceInr)}).
          </p>
        )}
        <ul className="grid grid-cols-3 gap-2 text-center" aria-label="Summary">
          <SummaryStat value={counts.identified} label="identified" />
          <SummaryStat value={counts.conflicts} label={counts.conflicts === 1 ? "clash" : "clashes"} warn={counts.conflicts > 0} />
          <SummaryStat value={counts.flagged} label="to watch" warn={counts.flagged > 0} />
        </ul>
        <div className="flex flex-wrap items-center gap-2">
          <ShareButton title="My skincare ingredient check" />
        </div>
        <Disclaimer />
      </header>

      <section aria-labelledby="conflicts">
        <SectionHeading id="conflicts" sub="Ingredient pairs in this list that can work against each other.">
          Clash check
        </SectionHeading>
        <ConflictList conflicts={analysis.conflicts} />
      </section>

      <section aria-labelledby="skin-fit">
        <SectionHeading id="skin-fit" sub="A rough guide based on the ingredients we identified and where they sit in the list.">
          Skin-type fit
        </SectionHeading>
        <SkinFitGrid fit={analysis.skinFit} />
      </section>

      <AdSlot slot="result-mid" />

      <section aria-labelledby="breakdown" className="space-y-4">
        <SectionHeading id="breakdown" sub="In label order. Ingredients near the top are present in larger amounts.">
          Ingredient breakdown
        </SectionHeading>
        <IngredientBreakdown items={analysis.items} />
        <UnmatchedList unmatched={analysis.unmatched} />
      </section>

      {alternatives.length > 0 && (
        <section aria-labelledby="alternatives" className="space-y-3">
          <SectionHeading
            id="alternatives"
            sub={
              known
                ? `Products under ${formatInr(known.priceInr)} with similar key ingredients.`
                : "Budget picks with similar key ingredients. Closest match first."
            }
          >
            Cheaper alternatives
          </SectionHeading>
          <AffiliateDisclosure />
          <div className="grid gap-3">
            {alternatives.map((a) => (
              <ProductCard key={a.product.slug} product={a.product} shared={a.shared} />
            ))}
          </div>
        </section>
      )}

      <details className="rounded-2xl border border-line bg-shell p-4 text-sm">
        <summary className="cursor-pointer font-semibold text-ink">What you pasted</summary>
        <p className="mt-2 break-words whitespace-pre-wrap text-muted">{record.inputText}</p>
      </details>

      <AdSlot slot="result-bottom" />
      <Disclaimer />
    </>
  );
}

function SummaryStat({ value, label, warn }: { value: number; label: string; warn?: boolean }) {
  return (
    <li className={`rounded-2xl p-3 ${warn ? "bg-care-bg" : "bg-shell ring-1 ring-line"}`}>
      <span className="block text-2xl font-bold text-ink">{value}</span>
      <span className="block text-xs font-medium text-muted">{label}</span>
    </li>
  );
}

function ResultSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading your result" className="space-y-4">
      <div className="h-9 w-2/3 animate-pulse rounded-xl bg-blush" />
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl bg-blush" />
        ))}
      </div>
      <div className="h-40 animate-pulse rounded-2xl bg-blush" />
    </div>
  );
}
