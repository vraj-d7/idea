import Link from "next/link";
import type { Analysis, ConflictHit, FitVerdict, SkinFit } from "@/lib/analyze";
import { SKIN_TYPES, SKIN_TYPE_LABEL, type Severity, type SkinType } from "@/lib/types";
import { RatingBadge } from "./RatingBadge";

export function SectionHeading({ id, children, sub }: { id: string; children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-3">
      <h2 id={id} className="font-display text-xl font-bold text-ink sm:text-2xl">
        {children}
      </h2>
      {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
    </div>
  );
}

// --- Conflicts -------------------------------------------------------------

const severityStyle: Record<Severity, { box: string; label: string }> = {
  high: { box: "border-bad/30 bg-bad-bg", label: "Strong clash" },
  medium: { box: "border-care/30 bg-care-bg", label: "Worth spacing out" },
  low: { box: "border-line bg-shell", label: "Mild, keep an eye on it" },
};

export function ConflictList({ conflicts }: { conflicts: ConflictHit[] }) {
  if (!conflicts.length) {
    return (
      <p className="rounded-2xl bg-good-bg px-4 py-3 text-sm font-medium text-good">
        <span aria-hidden>✓ </span>No known ingredient clashes in this list.
      </p>
    );
  }
  return (
    <ul className="space-y-3">
      {conflicts.map((c, i) => (
        <li key={i} className={`rounded-2xl border px-4 py-3 ${severityStyle[c.severity].box}`}>
          <p className="text-xs font-bold tracking-wide text-ink uppercase">{severityStyle[c.severity].label}</p>
          <p className="mt-1 font-semibold text-ink">
            {c.a.join(", ")} <span className="text-muted">+</span> {c.b.join(", ")}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink/80">{c.explanation}</p>
        </li>
      ))}
    </ul>
  );
}

// --- Skin type fit ---------------------------------------------------------

const verdictStyle: Record<FitVerdict, { chip: string; label: string }> = {
  good: { chip: "bg-good-bg text-good", label: "Good fit" },
  okay: { chip: "bg-blush text-ink", label: "Okay" },
  caution: { chip: "bg-bad-bg text-bad", label: "Be careful" },
};

const typeIcon: Record<SkinType, string> = { oily: "💧", dry: "🌵", sensitive: "🌸", acne: "🔎" };

export function SkinFitGrid({ fit }: { fit: Record<SkinType, SkinFit> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {SKIN_TYPES.map((type) => {
        const f = fit[type];
        const v = verdictStyle[f.verdict];
        return (
          <div key={type} className="rounded-2xl border border-line bg-shell p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-ink">
                <span aria-hidden>{typeIcon[type]} </span>
                {SKIN_TYPE_LABEL[type]}
              </h3>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${v.chip}`}>{v.label}</span>
            </div>
            {f.reasons.length > 0 ? (
              <ul className="mt-2 space-y-1.5 text-sm text-muted">
                {f.reasons.slice(0, 3).map((r) => (
                  <li key={r.slug} className="flex gap-1.5">
                    <span aria-hidden className={r.fit > 0 ? "text-good" : "text-bad"}>
                      {r.fit > 0 ? "+" : "−"}
                    </span>
                    <span>
                      <span className="sr-only">{r.fit > 0 ? "Plus: " : "Minus: "}</span>
                      <Link href={`/ingredient/${r.slug}`} className="font-medium text-ink hover:underline">
                        {r.name}
                      </Link>
                      : {r.note}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted">Nothing here stands out for this skin type either way.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// --- Ingredient breakdown -------------------------------------------------

export function IngredientBreakdown({ items }: { items: Analysis["items"] }) {
  return (
    <ol className="space-y-2">
      {items.map(({ ingredient, labels }) => {
        const listedAs = labels.filter((l) => l.toLowerCase() !== ingredient.name.toLowerCase());
        return (
          <li key={ingredient.slug} className="rounded-2xl border border-line bg-shell p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-ink">
                  <Link href={`/ingredient/${ingredient.slug}`} className="hover:underline">
                    {ingredient.name}
                  </Link>
                </h3>
                {listedAs.length > 0 && <p className="text-xs text-muted">Listed as: {listedAs.join(", ")}</p>}
              </div>
              <RatingBadge rating={ingredient.rating} />
            </div>
            <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="What it does">
              {ingredient.functions.map((f) => (
                <li key={f} className="rounded-full bg-blush px-2.5 py-0.5 text-xs font-medium text-ink">
                  {f}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm leading-relaxed text-muted">{ingredient.description}</p>
          </li>
        );
      })}
    </ol>
  );
}

export function UnmatchedList({ unmatched }: { unmatched: string[] }) {
  if (!unmatched.length) return null;
  return (
    <section aria-labelledby="unmatched" className="rounded-2xl border border-dashed border-line p-4">
      <h3 id="unmatched" className="font-semibold text-ink">
        Couldn&apos;t identify ({unmatched.length})
      </h3>
      <p className="mt-1 text-sm text-muted">
        These aren&apos;t in our database yet, or the spelling was too different to match. They&apos;re left out of the
        analysis above.
      </p>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {unmatched.map((u, i) => (
          <li key={i} className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">
            {u}
          </li>
        ))}
      </ul>
    </section>
  );
}
