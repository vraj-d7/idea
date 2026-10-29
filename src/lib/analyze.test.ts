import { describe, expect, it } from "vitest";
import { analyze, findAlternatives, findConflicts, identifyProduct, keyIngredientsOf } from "./analyze";
import { buildFaqs } from "./faqs";
import { buildIndex, parseIngredientList } from "./parse";
import { ingredients, products, rules } from "./test-data";

const index = buildIndex(ingredients);
const run = (text: string) => analyze(parseIngredientList(text, index), ingredients, rules);
const bySlug = (slug: string) => ingredients.find((i) => i.slug === slug)!;
const conflictsOf = (...slugs: string[]) => findConflicts(slugs.map(bySlug), rules);

describe("findConflicts", () => {
  it("flags retinol + glycolic acid as high severity", () => {
    const hits = conflictsOf("retinol", "glycolic-acid");
    expect(hits).toHaveLength(1);
    expect(hits[0].severity).toBe("high");
    expect(hits[0].a).toEqual(["Retinol"]);
    expect(hits[0].b).toEqual(["Glycolic Acid"]);
  });

  it("flags retinoid + BHA, and retinoid + benzoyl peroxide", () => {
    expect(conflictsOf("retinal", "salicylic-acid")[0].severity).toBe("high");
    expect(conflictsOf("retinol", "benzoyl-peroxide")[0].severity).toBe("high");
  });

  it("flags pure vitamin C with strong acids", () => {
    const hits = conflictsOf("l-ascorbic-acid", "glycolic-acid");
    expect(hits.map((h) => h.severity)).toEqual(["medium"]);
  });

  it("does not flag gentle vitamin C derivatives with acids", () => {
    expect(conflictsOf("ethyl-ascorbic-acid", "glycolic-acid")).toEqual([]);
  });

  it("does not flag niacinamide with vitamin C", () => {
    expect(conflictsOf("niacinamide", "l-ascorbic-acid")).toEqual([]);
  });

  it("only flags 'two retinoids' when there really are two", () => {
    expect(conflictsOf("retinol")).toEqual([]);
    const hits = conflictsOf("retinol", "retinal");
    expect(hits).toHaveLength(1);
    expect(hits[0].explanation).toMatch(/two retinoids/i);
  });

  it("sorts high severity first", () => {
    const hits = conflictsOf("retinol", "glycolic-acid", "salicylic-acid", "alcohol-denat");
    const order = hits.map((h) => h.severity);
    expect(order).toEqual([...order].sort((a, b) => ["high", "medium", "low"].indexOf(a) - ["high", "medium", "low"].indexOf(b)));
    expect(order[0]).toBe("high");
    expect(order).toContain("low");
  });

  it("returns nothing for a simple moisturiser", () => {
    expect(conflictsOf("water", "glycerin", "ceramides", "panthenol")).toEqual([]);
  });
});

describe("analyze", () => {
  it("builds a breakdown, merging labels for the same ingredient", () => {
    const a = run("Aqua, Glycerin, Ceramide NP, Ceramide AP, Mystery Extract");
    expect(a.items.map((i) => i.ingredient.slug)).toEqual(["water", "glycerin", "ceramides"]);
    expect(a.items[2].labels).toEqual(["Ceramide NP", "Ceramide AP"]);
    expect(a.unmatched).toEqual(["Mystery Extract"]);
  });

  it("rates a fragranced, alcohol-heavy serum as a caution for sensitive skin", () => {
    const a = run("Aqua, Alcohol Denat., Ascorbic Acid, Fragrance");
    expect(a.skinFit.sensitive.verdict).toBe("caution");
    expect(a.skinFit.sensitive.reasons[0].fit).toBe(-1);
  });

  it("rates a gentle ceramide cream well for dry skin", () => {
    const a = run("Water, Glycerin, Ceramide NP, Squalane, Panthenol");
    expect(a.skinFit.dry.verdict).toBe("good");
  });

  it("counts ingredients lower in the list less", () => {
    const top = run("Fragrance, Water, Glycerin, Butylene Glycol, Propanediol, Xanthan Gum");
    const bottom = run(
      "Water, Glycerin, Butylene Glycol, Propanediol, Xanthan Gum, Carbomer, Disodium EDTA, Phenoxyethanol, Ethylhexylglycerin, Sodium Hydroxide, 1,2-Hexanediol, Fragrance",
    );
    expect(top.skinFit.sensitive.score).toBeLessThan(bottom.skinFit.sensitive.score);
  });

  it("finds the retinol + glycolic clash in a full label", () => {
    const sample = products.find((p) => p.slug === "dewdrop-retinol-glycolic-night-serum")!;
    const a = run(sample.ingredients.join(", "));
    expect(a.unmatched).toEqual([]);
    expect(a.conflicts[0].severity).toBe("high");
  });
});

describe("identifyProduct", () => {
  const matchSlug = (raw: string) => parseIngredientList(raw, index)[0]?.slug ?? null;
  const slugsOf = (text: string) => parseIngredientList(text, index).map((p) => p.slug);

  it("recognises a pasted label from the catalog, even with spelling differences", () => {
    const serum = products.find((p) => p.slug === "glowlab-vitamin-c-15-serum")!;
    const pasted = serum.ingredients.join(", ").replace("Aqua", "Water").replace("Fragrance", "Parfum");
    expect(identifyProduct(slugsOf(pasted), products, matchSlug)?.slug).toBe(serum.slug);
  });

  it("returns null for a list that isn't in the catalog", () => {
    expect(identifyProduct(slugsOf("Water, Glycerin, Niacinamide, Retinol"), products, matchSlug)).toBeNull();
  });
});

describe("findAlternatives", () => {
  it("only suggests cheaper products for a product page", () => {
    const serum = products.find((p) => p.slug === "glowlab-vitamin-c-15-serum")!;
    const alts = findAlternatives(serum.keyIngredients, products, ingredients, {
      maxPrice: serum.priceInr,
      excludeSlug: serum.slug,
    });
    expect(alts.length).toBeGreaterThan(0);
    for (const alt of alts) expect(alt.product.priceInr).toBeLessThan(serum.priceInr);
    // Matched through the shared vitamin-c group, not the exact same slug.
    expect(alts[0].product.slug).toBe("kasa-ethyl-ascorbic-vitamin-c-serum");
  });

  it("does not treat AHAs and BHAs as the same thing", () => {
    const alts = findAlternatives(["glycolic-acid"], products, ingredients);
    expect(alts.map((a) => a.product.slug)).not.toContain("glowlab-salicylic-2-serum");
  });

  it("ignores water and preservatives when picking key ingredients", () => {
    expect(keyIngredientsOf(["water", "phenoxyethanol", "niacinamide"], products)).toEqual(["niacinamide"]);
  });

  it("returns nothing when there are no key ingredients", () => {
    expect(findAlternatives([], products, ingredients)).toEqual([]);
  });
});

describe("buildFaqs", () => {
  it("includes hand-written FAQs first, then generated ones", () => {
    const faqs = buildFaqs(bySlug("niacinamide"), rules, ingredients);
    expect(faqs[0].q).toBe("Is niacinamide safe with vitamin C?");
    expect(faqs.some((f) => f.q === "Is Niacinamide good for oily skin?")).toBe(true);
  });

  it("generates conflict questions from rules", () => {
    const faqs = buildFaqs(bySlug("retinol"), rules, ingredients);
    expect(faqs.some((f) => f.q.startsWith("Can I use Retinol with AHAs"))).toBe(true);
    expect(faqs.some((f) => f.q === "Can I use Retinol with other retinoids?")).toBe(true);
    // Single-member groups use the ingredient's own name.
    expect(faqs.some((f) => f.q === "Can I use Retinol with Benzoyl Peroxide?")).toBe(true);
  });

  it("has no duplicate questions", () => {
    for (const ing of ingredients) {
      const qs = buildFaqs(ing, rules, ingredients).map((f) => f.q.toLowerCase());
      expect(new Set(qs).size).toBe(qs.length);
    }
  });
});
