import type { Metadata } from "next";
import Link from "next/link";
import { RatingBadge } from "@/components/RatingBadge";
import { getIngredients } from "@/lib/data";

export const metadata: Metadata = {
  title: "Skincare Ingredients A–Z",
  description:
    "Plain-language guides to common skincare ingredients: what they do, who they suit, and what not to mix them with.",
  alternates: { canonical: "/ingredient" },
};

export default async function IngredientIndexPage() {
  const ingredients = await getIngredients();
  const byLetter = new Map<string, typeof ingredients>();
  for (const ing of ingredients) {
    const letter = /[a-z]/i.test(ing.name[0]) ? ing.name[0].toUpperCase() : "#";
    byLetter.set(letter, [...(byLetter.get(letter) ?? []), ing]);
  }
  const letters = [...byLetter.keys()].sort();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">Skincare ingredients A–Z</h1>
        <p className="text-muted">
          {ingredients.length} ingredients explained in plain words. Tap one to see what it does and what not to mix it
          with.
        </p>
      </header>

      <nav aria-label="Jump to letter" className="flex flex-wrap gap-1">
        {letters.map((l) => (
          <a
            key={l}
            href={`#letter-${l}`}
            className="grid h-9 w-9 place-items-center rounded-full bg-shell text-sm font-semibold text-ink ring-1 ring-line hover:bg-blush"
          >
            {l}
          </a>
        ))}
      </nav>

      {letters.map((l) => (
        <section key={l} aria-labelledby={`letter-${l}`} className="scroll-mt-4">
          <h2 id={`letter-${l}`} className="mb-2 font-display text-xl font-bold text-berry">
            {l}
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {byLetter.get(l)!.map((ing) => (
              <li key={ing.slug}>
                <Link
                  href={`/ingredient/${ing.slug}`}
                  className="flex h-full items-center justify-between gap-2 rounded-2xl border border-line bg-shell px-4 py-3 hover:border-berry"
                >
                  <span className="font-medium text-ink">{ing.name}</span>
                  <RatingBadge rating={ing.rating} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
