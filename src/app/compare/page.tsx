import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AffiliateButton } from "@/components/AffiliateButton";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import { Disclaimer } from "@/components/Disclaimer";
import { RatingBadge } from "@/components/RatingBadge";
import { analyze, type Analysis, type FitVerdict } from "@/lib/analyze";
import { getConflictRules, getIngredients, getProducts } from "@/lib/data";
import { buildIndex, matchIngredient } from "@/lib/parse";
import { formatInr } from "@/lib/site";
import { SKIN_TYPES, SKIN_TYPE_LABEL, type ProductData } from "@/lib/types";

export const metadata: Metadata = {
  title: "Compare Two Skincare Products",
  description: "Compare two skincare products side by side: price, key ingredients, clashes and skin-type fit.",
  alternates: { canonical: "/compare" },
};

export default function ComparePage({ searchParams }: PageProps<"/compare">) {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">Compare products</h1>
        <p className="text-muted">Pick two products to see them side by side.</p>
      </header>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-3xl bg-blush" aria-busy="true" />}>
        <Comparison searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

async function Comparison({ searchParams }: Pick<PageProps<"/compare">, "searchParams">) {
  const sp = await searchParams;
  const [products, ingredients, rules] = await Promise.all([getProducts(), getIngredients(), getConflictRules()]);
  const a = products.find((p) => p.slug === one(sp.a));
  const b = products.find((p) => p.slug === one(sp.b));

  const index = buildIndex(ingredients);
  const run = (p: ProductData) =>
    analyze(
      p.ingredients.map((raw) => ({ raw, slug: matchIngredient(raw, index) })),
      ingredients,
      rules,
    );

  return (
    <>
      <Picker products={products} a={a?.slug} b={b?.slug} />
      {a && b ? (
        <SideBySide a={a} b={b} aa={run(a)} bb={run(b)} />
      ) : (
        <p className="rounded-2xl border border-dashed border-line p-4 text-sm text-muted">
          Choose two products above, or use the &ldquo;Compare&rdquo; button on any product&apos;s alternatives.
        </p>
      )}
      <Disclaimer />
    </>
  );
}

function Picker({ products, a, b }: { products: ProductData[]; a?: string; b?: string }) {
  const select = (name: string, label: string, value?: string) => (
    <div className="flex-1">
      <label htmlFor={`compare-${name}`} className="mb-1 block text-sm font-semibold text-ink">
        {label}
      </label>
      <select
        id={`compare-${name}`}
        name={name}
        defaultValue={value ?? ""}
        required
        className="min-h-11 w-full rounded-xl border border-line bg-shell px-3 text-sm text-ink"
      >
        <option value="" disabled>
          Select a product
        </option>
        {products.map((p) => (
          <option key={p.slug} value={p.slug}>
            {p.brand} · {p.name}
          </option>
        ))}
      </select>
    </div>
  );
  return (
    <form method="get" action="/compare" className="flex flex-col gap-3 rounded-3xl border border-line bg-shell p-4 sm:flex-row sm:items-end">
      {select("a", "First product", a)}
      {select("b", "Second product", b)}
      <button
        type="submit"
        className="min-h-11 rounded-full bg-berry px-6 font-semibold text-white hover:bg-berry-dark"
      >
        Compare
      </button>
    </form>
  );
}

const verdictText: Record<FitVerdict, { label: string; cls: string }> = {
  good: { label: "Good fit", cls: "text-good" },
  okay: { label: "Okay", cls: "text-ink" },
  caution: { label: "Be careful", cls: "text-bad" },
};

function SideBySide({ a, b, aa, bb }: { a: ProductData; b: ProductData; aa: Analysis; bb: Analysis }) {
  const slugsA = new Set(aa.items.map((i) => i.ingredient.slug));
  const slugsB = new Set(bb.items.map((i) => i.ingredient.slug));
  const shared = aa.items.filter((i) => slugsB.has(i.ingredient.slug)).map((i) => i.ingredient);
  const onlyA = aa.items.filter((i) => !slugsB.has(i.ingredient.slug)).map((i) => i.ingredient);
  const onlyB = bb.items.filter((i) => !slugsA.has(i.ingredient.slug)).map((i) => i.ingredient);
  const cheaper = a.priceInr === b.priceInr ? null : a.priceInr < b.priceInr ? a.slug : b.slug;

  const keys = (p: ProductData, an: Analysis) =>
    names(p.keyIngredients.flatMap((s) => an.items.filter((i) => i.ingredient.slug === s).map((i) => i.ingredient)));

  const flagged = (an: Analysis) => {
    const f = an.items.filter((i) => i.ingredient.rating !== "good");
    return f.length ? (
      <ul className="space-y-1">
        {f.map((i) => (
          <li key={i.ingredient.slug}>
            <Link href={`/ingredient/${i.ingredient.slug}`} className="hover:underline">
              {i.ingredient.name}
            </Link>
          </li>
        ))}
      </ul>
    ) : (
      <span className="text-muted">None</span>
    );
  };

  const clashes = (an: Analysis) =>
    an.conflicts.length ? (
      <ul className="space-y-1">
        {an.conflicts.map((c, i) => (
          <li key={i}>
            {c.a.join(", ")} + {c.b.join(", ")}
          </li>
        ))}
      </ul>
    ) : (
      <span className="text-good">None found</span>
    );

  const names = (list: { name: string; slug: string }[]) =>
    list.length ? list.map((i) => i.name).join(", ") : <span className="text-muted">None</span>;

  return (
    <section aria-label="Comparison" className="space-y-4">
      <div className="overflow-x-auto rounded-3xl border border-line bg-shell p-4">
        <table className="w-full table-fixed border-collapse">
          <caption className="sr-only">
            {a.name} compared with {b.name}
          </caption>
          <thead>
            <tr>
              <td className="w-24 sm:w-32" />
              {[a, b].map((p) => (
                <th key={p.slug} scope="col" className="pr-2 pb-3 text-left align-top">
                  <span className="block text-xs font-medium text-muted uppercase">{p.brand}</span>
                  <Link href={`/product/${p.slug}`} className="text-sm font-semibold text-ink hover:underline sm:text-base">
                    {p.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Row
              label="Price"
              left={<Price p={a} cheaper={cheaper === a.slug} />}
              right={<Price p={b} cheaper={cheaper === b.slug} />}
            />
            <Row
              label="Key ingredients"
              left={keys(a, aa)}
              right={keys(b, bb)}
            />
            <Row label="Clashes" left={clashes(aa)} right={clashes(bb)} />
            {SKIN_TYPES.map((t) => (
              <Row
                key={t}
                label={SKIN_TYPE_LABEL[t]}
                left={<span className={`font-semibold ${verdictText[aa.skinFit[t].verdict].cls}`}>{verdictText[aa.skinFit[t].verdict].label}</span>}
                right={<span className={`font-semibold ${verdictText[bb.skinFit[t].verdict].cls}`}>{verdictText[bb.skinFit[t].verdict].label}</span>}
              />
            ))}
            <Row label="To watch" left={flagged(aa)} right={flagged(bb)} />
            <Row label="Only in this one" left={names(onlyA)} right={names(onlyB)} />
          </tbody>
        </table>
      </div>

      <div className="rounded-3xl border border-line bg-shell p-4">
        <h2 className="font-semibold text-ink">In both ({shared.length})</h2>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {shared.map((i) => (
            <li key={i.slug} className="flex items-center gap-1 rounded-full bg-blush px-2.5 py-0.5 text-xs text-ink">
              {i.name}
              {i.rating !== "good" && <RatingBadge rating={i.rating} />}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <AffiliateButton href={a.affiliateUrl} productName={a.name} label={`Buy ${a.brand.replace(/\s*\(sample\)/i, "")}`} />
          <AffiliateButton href={b.affiliateUrl} productName={b.name} label={`Buy ${b.brand.replace(/\s*\(sample\)/i, "")}`} />
        </div>
        <AffiliateDisclosure />
      </div>
    </section>
  );
}

function Row({ label, left, right }: { label: string; left: React.ReactNode; right: React.ReactNode }) {
  return (
    <tr className="border-t border-line align-top">
      <th scope="row" className="w-24 py-3 pr-2 text-left text-xs font-semibold text-muted sm:w-32 sm:text-sm">
        {label}
      </th>
      <td className="py-3 pr-2 text-sm text-ink">{left}</td>
      <td className="py-3 text-sm text-ink">{right}</td>
    </tr>
  );
}

function Price({ p, cheaper }: { p: ProductData; cheaper: boolean }) {
  return (
    <span className="font-bold">
      {formatInr(p.priceInr)}
      {cheaper && (
        <span className="ml-1 block w-fit rounded-full bg-good-bg px-2 py-0.5 text-xs font-semibold text-good sm:inline-block">
          Cheaper
        </span>
      )}
    </span>
  );
}
