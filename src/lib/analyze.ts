import {
  SKIN_TYPES,
  type ConflictRuleData,
  type Fit,
  type IngredientData,
  type ParsedIngredient,
  type ProductData,
  type Severity,
  type SkinType,
} from "./types";

export type BreakdownItem = {
  ingredient: IngredientData;
  /** How it was written on the label, e.g. ["Ceramide NP", "Ceramide AP"] */
  labels: string[];
  /** 0-based position of its first appearance in the list */
  position: number;
};

export type ConflictHit = {
  severity: Severity;
  explanation: string;
  /** Ingredient names on each side of the rule that were found */
  a: string[];
  b: string[];
};

export type FitVerdict = "good" | "okay" | "caution";

export type SkinFit = {
  verdict: FitVerdict;
  score: number;
  reasons: { name: string; slug: string; fit: Fit; note: string }[];
};

export type Analysis = {
  items: BreakdownItem[];
  unmatched: string[];
  conflicts: ConflictHit[];
  skinFit: Record<SkinType, SkinFit>;
};

const SEVERITY_ORDER: Record<Severity, number> = { high: 0, medium: 1, low: 2 };

/** Group parsed entries by ingredient, in order of first appearance. */
export function buildBreakdown(parsed: ParsedIngredient[], ingredients: IngredientData[]) {
  const bySlug = new Map(ingredients.map((i) => [i.slug, i]));
  const items = new Map<string, BreakdownItem>();
  const unmatched: string[] = [];

  parsed.forEach((p, position) => {
    const ingredient = p.slug ? bySlug.get(p.slug) : undefined;
    if (!ingredient) {
      unmatched.push(p.raw);
      return;
    }
    const existing = items.get(ingredient.slug);
    if (existing) {
      if (!existing.labels.includes(p.raw)) existing.labels.push(p.raw);
    } else {
      items.set(ingredient.slug, { ingredient, labels: [p.raw], position });
    }
  });

  return { items: [...items.values()], unmatched };
}

/** Does this ingredient satisfy a rule side ("retinol" or "group:retinoid")? */
export function matchesRef(ing: Pick<IngredientData, "slug" | "groups">, ref: string): boolean {
  return ref.startsWith("group:") ? ing.groups.includes(ref.slice(6)) : ing.slug === ref;
}

export function findConflicts(
  found: Pick<IngredientData, "slug" | "name" | "groups">[],
  rules: ConflictRuleData[],
): ConflictHit[] {
  const hits: ConflictHit[] = [];
  for (const rule of rules) {
    const sideA = found.filter((i) => matchesRef(i, rule.ingredientA));
    const sideB = found.filter((i) => matchesRef(i, rule.ingredientB));
    if (!sideA.length || !sideB.length) continue;

    // The two sides must be different ingredients. This also makes
    // "retinoid + retinoid" fire only when there are two retinoids.
    const distinct = sideA.some((a) => sideB.some((b) => b.slug !== a.slug));
    if (!distinct) continue;

    hits.push({
      severity: rule.severity,
      explanation: rule.explanation,
      a: sideA.map((i) => i.name),
      b: sideB.map((i) => i.name),
    });
  }
  return hits.sort((x, y) => SEVERITY_ORDER[x.severity] - SEVERITY_ORDER[y.severity]);
}

/** Ingredients near the top of the list are present in larger amounts. */
export function positionWeight(position: number): number {
  if (position < 5) return 1;
  if (position < 10) return 0.7;
  return 0.4;
}

export function skinTypeFit(items: BreakdownItem[]): Record<SkinType, SkinFit> {
  const result = {} as Record<SkinType, SkinFit>;
  for (const type of SKIN_TYPES) {
    let score = 0;
    const reasons: SkinFit["reasons"] = [];
    for (const item of items) {
      const note = item.ingredient.skinTypes[type];
      if (!note || note.fit === 0) continue;
      score += note.fit * positionWeight(item.position);
      reasons.push({ name: item.ingredient.name, slug: item.ingredient.slug, fit: note.fit, note: note.note });
    }
    const hasCaution = reasons.some((r) => r.fit < 0);
    let verdict: FitVerdict = "okay";
    if (score <= -0.5) verdict = "caution";
    else if (score >= 1 && !hasCaution) verdict = "good";
    // Cautions first, so the important bit is visible.
    reasons.sort((a, b) => a.fit - b.fit);
    result[type] = { verdict, score: Math.round(score * 10) / 10, reasons };
  }
  return result;
}

export function analyze(
  parsed: ParsedIngredient[],
  ingredients: IngredientData[],
  rules: ConflictRuleData[],
): Analysis {
  const { items, unmatched } = buildBreakdown(parsed, ingredients);
  return {
    items,
    unmatched,
    conflicts: findConflicts(
      items.map((i) => i.ingredient),
      rules,
    ),
    skinFit: skinTypeFit(items),
  };
}

// ---------------------------------------------------------------------------
// Alternatives

/**
 * The key ingredients of a pasted list: anything that some product in the
 * catalog advertises as a key ingredient. Keeps water, thickeners and
 * preservatives from making every product look "similar".
 */
export function keyIngredientsOf(slugs: string[], products: ProductData[]): string[] {
  const advertised = new Set(products.flatMap((p) => p.keyIngredients));
  return slugs.filter((s) => advertised.has(s));
}

/**
 * If the pasted list is a known product's label (same identified ingredients
 * in the same order), return that product.
 */
export function identifyProduct(
  parsedSlugs: (string | null)[],
  products: ProductData[],
  matchSlug: (raw: string) => string | null,
): ProductData | null {
  const target = parsedSlugs.filter((s): s is string => !!s);
  if (target.length < 3) return null;
  return (
    products.find((p) => {
      const slugs = p.ingredients.map(matchSlug).filter((s): s is string => !!s);
      return slugs.length === target.length && slugs.every((s, i) => s === target[i]);
    }) ?? null
  );
}

export type Alternative = { product: ProductData; shared: string[] };

/** Groups too broad to call two ingredients "similar" (AHA vs BHA). */
const BROAD_GROUPS = new Set(["exfoliating-acid"]);

/**
 * Products whose key ingredients overlap with `targetKeys`. Two ingredients
 * count as the same if they share a group, so a pure vitamin C serum can be
 * matched with a cheaper vitamin C derivative.
 */
export function findAlternatives(
  targetKeys: string[],
  products: ProductData[],
  ingredients: IngredientData[],
  opts: { maxPrice?: number; excludeSlug?: string; limit?: number } = {},
): Alternative[] {
  const bySlug = new Map(ingredients.map((i) => [i.slug, i]));
  const targets = targetKeys.map((s) => bySlug.get(s)).filter((i): i is IngredientData => !!i);
  if (!targets.length) return [];

  const similar = (slug: string) => {
    const ing = bySlug.get(slug);
    if (!ing) return false;
    return targets.some(
      (t) =>
        t.slug === slug ||
        t.groups.some((g) => !BROAD_GROUPS.has(g) && ing.groups.includes(g)),
    );
  };

  return products
    .filter((p) => p.slug !== opts.excludeSlug)
    .filter((p) => opts.maxPrice === undefined || p.priceInr < opts.maxPrice)
    .map((product) => ({
      product,
      shared: product.keyIngredients.filter(similar).map((s) => bySlug.get(s)!.name),
    }))
    .filter((a) => a.shared.length > 0)
    .sort((a, b) => b.shared.length - a.shared.length || a.product.priceInr - b.product.priceInr)
    .slice(0, opts.limit ?? 3);
}
