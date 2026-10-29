import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdSlot } from "@/components/AdSlot";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import { SectionHeading } from "@/components/analysis";
import { Disclaimer } from "@/components/Disclaimer";
import { JsonLd } from "@/components/JsonLd";
import { ProductCard } from "@/components/ProductCard";
import { RatingBadge } from "@/components/RatingBadge";
import { getConflictRules, getIngredient, getIngredients, getProducts } from "@/lib/data";
import { buildFaqs } from "@/lib/faqs";
import { buildIndex, matchIngredient } from "@/lib/parse";
import { SITE_NAME, siteUrl } from "@/lib/site";
import { RATING_LABEL, SKIN_TYPES, SKIN_TYPE_LABEL } from "@/lib/types";

export async function generateStaticParams() {
  const ingredients = await getIngredients();
  return ingredients.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: PageProps<"/ingredient/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const ing = await getIngredient(slug);
  if (!ing) return { title: "Ingredient not found" };

  const firstSentence = ing.description.split(/(?<=\.)\s/)[0];
  const description = `${ing.name} in skincare: ${firstSentence} Rated "${RATING_LABEL[ing.rating]}". Skin-type fit, what not to mix it with, and FAQs.`;
  return {
    title: `${ing.name}: What It Does, Benefits & What Not to Mix`,
    description: description.slice(0, 300),
    alternates: { canonical: `/ingredient/${ing.slug}` },
    openGraph: { title: `${ing.name} in skincare, explained`, description, url: `/ingredient/${ing.slug}` },
  };
}

export default function IngredientPage({ params }: PageProps<"/ingredient/[slug]">) {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-3xl bg-blush" aria-busy="true" />}>
      <IngredientContent params={params} />
    </Suspense>
  );
}

async function IngredientContent({ params }: Pick<PageProps<"/ingredient/[slug]">, "params">) {
  const { slug } = await params;
  const [ing, all, rules, products] = await Promise.all([
    getIngredient(slug),
    getIngredients(),
    getConflictRules(),
    getProducts(),
  ]);
  if (!ing) notFound();

  const faqs = buildFaqs(ing, rules, all);
  const index = buildIndex(all);
  const containing = products.filter((p) => p.ingredients.some((raw) => matchIngredient(raw, index) === ing.slug));
  const related = all.filter(
    (other) => other.slug !== ing.slug && other.functions.some((f) => ing.functions.includes(f)),
  );

  return (
    <article className="space-y-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: SITE_NAME, item: siteUrl("/") },
            { "@type": "ListItem", position: 2, name: "Ingredients", item: siteUrl("/ingredient") },
            { "@type": "ListItem", position: 3, name: ing.name, item: siteUrl(`/ingredient/${ing.slug}`) },
          ],
        }}
      />

      <header className="space-y-4">
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <Link href="/ingredient" className="hover:text-ink hover:underline">
            Ingredients
          </Link>{" "}
          / <span className="text-ink">{ing.name}</span>
        </nav>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">{ing.name}</h1>
          <RatingBadge rating={ing.rating} />
        </div>
        <ul className="flex flex-wrap gap-1.5" aria-label="What it does">
          {ing.functions.map((f) => (
            <li key={f} className="rounded-full bg-blush px-3 py-1 text-sm font-medium text-ink">
              {f}
            </li>
          ))}
        </ul>
        <p className="text-lg leading-relaxed text-ink/90">{ing.description}</p>
        {ing.aliases.length > 0 && (
          <p className="text-sm text-muted">
            <span className="font-semibold text-ink">Also listed as:</span> {ing.aliases.join(", ")}
          </p>
        )}
      </header>

      <section aria-labelledby="skin-types">
        <SectionHeading id="skin-types">Is it right for your skin type?</SectionHeading>
        <dl className="grid gap-3 sm:grid-cols-2">
          {SKIN_TYPES.map((type) => {
            const note = ing.skinTypes[type];
            const chip =
              note?.fit === 1 ? "bg-good-bg text-good" : note?.fit === -1 ? "bg-bad-bg text-bad" : "bg-blush text-ink";
            const label = note?.fit === 1 ? "Good fit" : note?.fit === -1 ? "Be careful" : "Neutral";
            return (
              <div key={type} className="rounded-2xl border border-line bg-shell p-4">
                <dt className="flex items-center justify-between gap-2 font-semibold text-ink">
                  {SKIN_TYPE_LABEL[type]}
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${chip}`}>{label}</span>
                </dt>
                <dd className="mt-1 text-sm text-muted">
                  {note?.note ?? "No strong effect either way for this skin type."}
                </dd>
              </div>
            );
          })}
        </dl>
      </section>

      <AdSlot slot="ingredient-mid" />

      <section aria-labelledby="faq">
        <SectionHeading id="faq">Frequently asked questions</SectionHeading>
        <div className="space-y-2">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-line bg-shell p-4 open:bg-shell">
              <summary className="cursor-pointer list-none font-semibold text-ink marker:hidden">
                <span className="flex items-start justify-between gap-3">
                  <h3>{f.q}</h3>
                  <span aria-hidden className="text-berry transition-transform group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {containing.length > 0 && (
        <section aria-labelledby="products" className="space-y-3">
          <SectionHeading id="products" sub="Cheapest first.">
            Products with {ing.name}
          </SectionHeading>
          <AffiliateDisclosure />
          <div className="grid gap-3">
            {containing.slice(0, 4).map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section aria-labelledby="related">
          <SectionHeading id="related">Similar ingredients</SectionHeading>
          <ul className="flex flex-wrap gap-2">
            {related.slice(0, 8).map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/ingredient/${r.slug}`}
                  className="inline-block rounded-full border border-line bg-shell px-4 py-2 text-sm font-medium text-ink hover:border-berry hover:bg-blush"
                >
                  {r.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="rounded-3xl bg-blush p-5 text-center">
        <p className="font-semibold text-ink">Got a product with {ing.name}?</p>
        <p className="mt-1 text-sm text-muted">Paste its full ingredient list to check for clashes and skin-type fit.</p>
        <Link
          href="/"
          className="mt-3 inline-flex min-h-11 items-center rounded-full bg-berry px-6 font-semibold text-white hover:bg-berry-dark"
        >
          Check a product
        </Link>
      </div>

      <Disclaimer />
    </article>
  );
}
