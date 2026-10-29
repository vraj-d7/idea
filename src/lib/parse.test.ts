import { describe, expect, it } from "vitest";
import {
  buildIndex,
  candidates,
  levenshtein,
  matchIngredient,
  normalize,
  parseIngredientList,
  splitIngredients,
} from "./parse";
import { ingredients } from "./test-data";

const index = buildIndex(ingredients);
const match = (raw: string) => matchIngredient(raw, index);

describe("splitIngredients", () => {
  it("splits on commas and trims", () => {
    expect(splitIngredients("Aqua,  Glycerin ,Niacinamide.")).toEqual(["Aqua", "Glycerin", "Niacinamide"]);
  });

  it("keeps commas inside numbers like 1,2-Hexanediol", () => {
    expect(splitIngredients("Water, 1,2-Hexanediol, Glycerin")).toEqual(["Water", "1,2-Hexanediol", "Glycerin"]);
  });

  it("strips a leading 'Ingredients:' label", () => {
    expect(splitIngredients("INGREDIENTS: Water, Glycerin")).toEqual(["Water", "Glycerin"]);
  });

  it("splits on new lines, semicolons and bullets", () => {
    expect(splitIngredients("Water\nGlycerin; Niacinamide • Panthenol")).toEqual([
      "Water",
      "Glycerin",
      "Niacinamide",
      "Panthenol",
    ]);
  });

  it("treats 'May contain' as more ingredients", () => {
    expect(splitIngredients("Water, Glycerin. May contain: CI 77891")).toEqual(["Water", "Glycerin", "CI 77891"]);
  });

  it("splits blends written with (and) or 'and'", () => {
    expect(splitIngredients("Aqua, Phenoxyethanol (and) Ethylhexylglycerin, Allantoin and Sodium Gluconate.")).toEqual([
      "Aqua",
      "Phenoxyethanol",
      "Ethylhexylglycerin",
      "Allantoin",
      "Sodium Gluconate",
    ]);
  });

  it("splits (and) even without spaces around it", () => {
    expect(splitIngredients("Lauryl Glucoside(and) Polyglyceryl-6 Laurate (and)Disodium EDTA")).toEqual([
      "Lauryl Glucoside",
      "Polyglyceryl-6 Laurate",
      "Disodium EDTA",
    ]);
  });

  it("does not split 'and' inside a lowercase description", () => {
    expect(splitIngredients("Water, cocoa and shea blend")).toEqual(["Water", "cocoa and shea blend"]);
  });

  it("ignores empty entries", () => {
    expect(splitIngredients(" , ,Water,, ")).toEqual(["Water"]);
  });
});

describe("normalize and candidates", () => {
  it("lowercases and removes percentages and asterisks", () => {
    expect(normalize("Niacinamide 10%*")).toBe("niacinamide");
  });

  it("removes bracketed notes like [nano]", () => {
    expect(normalize("Zinc Oxide [Nano]")).toBe("zinc oxide");
  });

  it("offers versions with and without parentheses", () => {
    const c = candidates("Butyrospermum Parkii (Shea) Butter");
    expect(c).toContain("butyrospermum parkii butter");
    expect(c).toContain("shea");
  });

  it("splits Aqua/Water into both names", () => {
    expect(candidates("Aqua/Water")).toEqual(expect.arrayContaining(["aqua", "water"]));
  });
});

describe("levenshtein", () => {
  it("measures edit distance", () => {
    expect(levenshtein("retinol", "retinol")).toBe(0);
    expect(levenshtein("niacinamid", "niacinamide")).toBe(1);
    expect(levenshtein("kitten", "sitting")).toBe(3);
  });
});

describe("matchIngredient", () => {
  it.each([
    ["Aqua", "water"],
    ["Aqua (Water)", "water"],
    ["Water/Aqua/Eau", "water"],
    ["Sodium Hyaluronate", "hyaluronic-acid"],
    ["Parfum", "fragrance"],
    ["Ceramide NP", "ceramides"],
    ["Vitamin C (Ascorbic Acid)", "l-ascorbic-acid"],
    ["Butyrospermum Parkii (Shea) Butter", "shea-butter"],
    ["1,2-Hexanediol", "hexanediol"],
    ["Alcohol Denat.", "alcohol-denat"],
    ["Tocopheryl Acetate", "tocopherol"],
    ["NIACINAMIDE 5%", "niacinamide"],
  ])("matches %s to %s", (raw, slug) => {
    expect(match(raw)).toBe(slug);
  });

  it("forgives small typos", () => {
    expect(match("Niacinamid")).toBe("niacinamide");
    expect(match("Glycerine")).toBe("glycerin");
    expect(match("Salicylic Acd")).toBe("salicylic-acid");
    expect(match("Phenoxyethenol")).toBe("phenoxyethanol");
  });

  it("tells retinol and retinal apart", () => {
    expect(match("Retinol")).toBe("retinol");
    expect(match("Retinal")).toBe("retinal");
    expect(match("Retinoll")).toBe("retinol");
  });

  it("does not fuzzy-match different chemicals with similar names", () => {
    expect(match("Benzophenone-4")).not.toBe("oxybenzone"); // oxybenzone is benzophenone-3
    expect(match("Dipropylene Glycol")).not.toBe("propylene-glycol");
    expect(match("Diethanolamine")).not.toBe("triethanolamine");
  });

  it("still forgives spacing and hyphen differences", () => {
    expect(match("Polysorbate20")).toBe("polysorbate-20");
    expect(match("Polysorbate-20")).toBe("polysorbate-20");
    expect(match("Sodium Lauryl Sarcosinate")).toBe("sodium-lauroyl-sarcosinate");
  });

  it("does not fuzzy-match short names", () => {
    expect(match("SAX")).toBeNull();
  });

  it("returns null for unknown ingredients", () => {
    expect(match("Moringa Oleifera Seed Oil")).toBeNull();
    expect(match("Something Completely Made Up")).toBeNull();
  });
});

describe("parseIngredientList", () => {
  it("keeps unmatched entries with a null slug instead of failing", () => {
    const parsed = parseIngredientList("Aqua, Mystery Extract, Glycerin", index);
    expect(parsed).toEqual([
      { raw: "Aqua", slug: "water" },
      { raw: "Mystery Extract", slug: null },
      { raw: "Glycerin", slug: "glycerin" },
    ]);
  });
});
