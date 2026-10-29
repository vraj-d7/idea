import Link from "next/link";
import { AnalyzeForm, type Example } from "@/components/AnalyzeForm";
import { getIngredients, getProducts } from "@/lib/data";

const EXAMPLE_SLUGS = [
  "dewdrop-retinol-glycolic-night-serum",
  "glowlab-vitamin-c-15-serum",
  "mellow-ceramide-barrier-cream",
];

const POPULAR = [
  "niacinamide",
  "salicylic-acid",
  "retinol",
  "hyaluronic-acid",
  "l-ascorbic-acid",
  "glycolic-acid",
  "ceramides",
  "benzoyl-peroxide",
  "azelaic-acid",
  "fragrance",
];

export default async function HomePage() {
  const [products, ingredients] = await Promise.all([getProducts(), getIngredients()]);

  const examples: Example[] = EXAMPLE_SLUGS.flatMap((slug) => {
    const p = products.find((x) => x.slug === slug);
    return p ? [{ label: p.name, brand: p.brand, ingredients: p.ingredients.join(", ") }] : [];
  });
  const popular = POPULAR.flatMap((slug) => ingredients.filter((i) => i.slug === slug));

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <div className="space-y-3 pt-2 text-center sm:pt-6">
          <p className="inline-block rounded-full bg-blush px-3 py-1 text-xs font-semibold text-berry">
            Free · No sign-up · Made for India
          </p>
          <h1 className="font-display text-4xl leading-tight font-bold text-balance text-ink sm:text-5xl">
            What&apos;s actually in your skincare?
          </h1>
          <p className="mx-auto max-w-xl text-base text-pretty text-muted sm:text-lg">
            Paste any ingredient list. We&apos;ll explain each ingredient in plain words, flag combos that clash, tell
            you how it suits your skin type, and find cheaper picks.
          </p>
        </div>
        <AnalyzeForm examples={examples} />
      </section>

      <section aria-labelledby="how" className="space-y-4">
        <h2 id="how" className="font-display text-2xl font-bold text-ink">
          How it works
        </h2>
        <ol className="grid gap-3 sm:grid-cols-3">
          {[
            ["Paste", "Copy the ingredient list from the pack or a shopping site."],
            ["Read", "See what each ingredient does, what clashes, and your skin-type fit."],
            ["Save", "Find budget alternatives with similar key ingredients."],
          ].map(([title, body], i) => (
            <li key={title} className="rounded-3xl bg-shell p-5 ring-1 ring-line">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-blush text-sm font-bold text-berry">
                {i + 1}
              </span>
              <h3 className="mt-3 font-semibold text-ink">{title}</h3>
              <p className="mt-1 text-sm text-muted">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="popular" className="space-y-4">
        <h2 id="popular" className="font-display text-2xl font-bold text-ink">
          Popular ingredients
        </h2>
        <ul className="flex flex-wrap gap-2">
          {popular.map((i) => (
            <li key={i.slug}>
              <Link
                href={`/ingredient/${i.slug}`}
                className="inline-block rounded-full border border-line bg-shell px-4 py-2 text-sm font-medium text-ink hover:border-berry hover:bg-blush"
              >
                {i.name}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/ingredient"
              className="inline-block rounded-full px-4 py-2 text-sm font-semibold text-berry hover:bg-blush"
            >
              See all →
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
